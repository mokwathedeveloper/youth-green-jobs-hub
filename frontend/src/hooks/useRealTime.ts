import { useState, useEffect, useCallback, useRef } from 'react';
import { useUserPreferences } from './useLocalStorage';

/**
 * WebSocket connection states
 */
export type WebSocketState = 'connecting' | 'connected' | 'disconnected' | 'error';

/**
 * Real-time event types
 */
export interface RealTimeEvent {
  type: string;
  data: any;
  timestamp: string;
  id?: string;
}

/**
 * WebSocket hook options
 */
export interface UseWebSocketOptions {
  url?: string;
  protocols?: string | string[];
  onOpen?: (event: Event) => void;
  onClose?: (event: CloseEvent) => void;
  onError?: (event: Event) => void;
  onMessage?: (event: MessageEvent) => void;
  shouldReconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  heartbeatInterval?: number;
}

/**
 * Custom WebSocket hook with automatic reconnection
 */
export function useWebSocket(options: UseWebSocketOptions = {}) {
  const {
    url = process.env.VITE_WS_URL || 'ws://localhost:8000/ws/',
    protocols,
    onOpen,
    onClose,
    onError,
    onMessage,
    shouldReconnect = true,
    reconnectInterval = 3000,
    maxReconnectAttempts = 5,
    heartbeatInterval = 30000,
  } = options;

  const [state, setState] = useState<WebSocketState>('disconnected');
  const [lastMessage, setLastMessage] = useState<MessageEvent | null>(null);
  const [reconnectCount, setReconnectCount] = useState(0);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    setState('connecting');

    try {
      wsRef.current = new WebSocket(url, protocols);

      wsRef.current.onopen = (event) => {
        setState('connected');
        setReconnectCount(0);
        onOpen?.(event);

        // Start heartbeat
        if (heartbeatInterval > 0) {
          heartbeatTimeoutRef.current = setInterval(() => {
            if (wsRef.current?.readyState === WebSocket.OPEN) {
              wsRef.current.send(JSON.stringify({ type: 'ping' }));
            }
          }, heartbeatInterval);
        }
      };

      wsRef.current.onclose = (event) => {
        setState('disconnected');
        onClose?.(event);

        // Clear heartbeat
        if (heartbeatTimeoutRef.current) {
          clearInterval(heartbeatTimeoutRef.current);
        }

        // Attempt reconnection
        if (shouldReconnect && reconnectCount < maxReconnectAttempts) {
          reconnectTimeoutRef.current = setTimeout(() => {
            setReconnectCount(prev => prev + 1);
            connect();
          }, reconnectInterval * Math.pow(2, reconnectCount)); // Exponential backoff
        }
      };

      wsRef.current.onerror = (event) => {
        setState('error');
        onError?.(event);
      };

      wsRef.current.onmessage = (event) => {
        setLastMessage(event);
        onMessage?.(event);
      };
    } catch (error) {
      setState('error');
      console.error('WebSocket connection error:', error);
    }
  }, [url, protocols, onOpen, onClose, onError, onMessage, shouldReconnect, reconnectInterval, maxReconnectAttempts, heartbeatInterval, reconnectCount]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (heartbeatTimeoutRef.current) {
      clearInterval(heartbeatTimeoutRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
    }
    setState('disconnected');
  }, []);

  const sendMessage = useCallback((message: string | object) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      const messageStr = typeof message === 'string' ? message : JSON.stringify(message);
      wsRef.current.send(messageStr);
      return true;
    }
    return false;
  }, []);

  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    state,
    lastMessage,
    reconnectCount,
    connect,
    disconnect,
    sendMessage,
    isConnected: state === 'connected',
    isConnecting: state === 'connecting',
  };
}

/**
 * Real-time data updates hook
 */
export interface UseRealTimeDataOptions<T> {
  eventTypes: string[];
  initialData?: T;
  onUpdate?: (data: T, event: RealTimeEvent) => void;
  transform?: (event: RealTimeEvent) => Partial<T>;
  shouldUpdate?: (event: RealTimeEvent) => boolean;
}

export function useRealTimeData<T>(options: UseRealTimeDataOptions<T>) {
  const {
    eventTypes,
    initialData,
    onUpdate,
    transform,
    shouldUpdate,
  } = options;

  const [data, setData] = useState<T | undefined>(initialData);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const handleMessage = useCallback((event: MessageEvent) => {
    try {
      const realTimeEvent: RealTimeEvent = JSON.parse(event.data);
      
      if (!eventTypes.includes(realTimeEvent.type)) {
        return;
      }

      if (shouldUpdate && !shouldUpdate(realTimeEvent)) {
        return;
      }

      if (transform) {
        const updates = transform(realTimeEvent);
        setData(prevData => ({ ...prevData, ...updates } as T));
      } else {
        setData(realTimeEvent.data);
      }

      setLastUpdate(new Date());
      onUpdate?.(data as T, realTimeEvent);
    } catch (error) {
      console.error('Error parsing real-time message:', error);
    }
  }, [eventTypes, shouldUpdate, transform, onUpdate, data]);

  const { state, isConnected, sendMessage } = useWebSocket({
    onMessage: handleMessage,
  });

  return {
    data,
    lastUpdate,
    isConnected,
    connectionState: state,
    sendMessage,
  };
}

/**
 * Polling hook for regular data updates
 */
export interface UsePollingOptions<T> {
  fetchFunction: () => Promise<T>;
  interval?: number;
  immediate?: boolean;
  enabled?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

export function usePolling<T>(options: UsePollingOptions<T>) {
  const {
    fetchFunction,
    interval = 30000, // 30 seconds default
    immediate = true,
    enabled = true,
    onSuccess,
    onError,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { preferences } = useUserPreferences();

  const fetchData = useCallback(async () => {
    if (!enabled) return;

    setLoading(true);
    setError(null);

    try {
      const result = await fetchFunction();
      setData(result);
      setLastUpdate(new Date());
      onSuccess?.(result);
    } catch (err) {
      const error = err as Error;
      setError(error);
      onError?.(error);
    } finally {
      setLoading(false);
    }
  }, [fetchFunction, enabled, onSuccess, onError]);

  const startPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    const pollInterval = preferences.autoRefreshInterval || interval;
    
    if (enabled && pollInterval > 0) {
      intervalRef.current = setInterval(fetchData, pollInterval);
    }
  }, [fetchData, interval, enabled, preferences.autoRefreshInterval]);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const refresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (immediate) {
      fetchData();
    }
    startPolling();

    return () => {
      stopPolling();
    };
  }, [immediate, fetchData, startPolling, stopPolling]);

  // Restart polling when preferences change
  useEffect(() => {
    startPolling();
  }, [preferences.autoRefreshInterval, startPolling]);

  return {
    data,
    loading,
    error,
    lastUpdate,
    refresh,
    startPolling,
    stopPolling,
    isPolling: intervalRef.current !== null,
  };
}

/**
 * Live dashboard updates hook
 */
export function useLiveDashboard() {
  const [metrics, setMetrics] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);

  // Real-time updates via WebSocket
  const { isConnected } = useRealTimeData({
    eventTypes: ['dashboard_update', 'new_alert', 'activity_update'],
    onUpdate: (_, event) => {
      switch (event.type) {
        case 'dashboard_update':
          setMetrics((prevMetrics: any) => ({ ...prevMetrics, ...event.data }));
          break;
        case 'new_alert':
          setAlerts(prevAlerts => [event.data, ...prevAlerts.slice(0, 9)]); // Keep last 10
          break;
        case 'activity_update':
          setActivities(prevActivities => [event.data, ...prevActivities.slice(0, 19)]); // Keep last 20
          break;
      }
    },
  });

  return {
    metrics,
    alerts,
    activities,
    isConnected,
    setMetrics,
    setAlerts,
    setActivities,
  };
}

/**
 * Live notifications hook
 */
export function useLiveNotifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const { isConnected } = useRealTimeData({
    eventTypes: ['notification'],
    onUpdate: (_, event) => {
      const notification = {
        ...event.data,
        id: event.id || Date.now().toString(),
        timestamp: event.timestamp,
        read: false,
      };

      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    },
  });

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
    setUnreadCount(0);
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  return {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead,
    clearNotifications,
  };
}

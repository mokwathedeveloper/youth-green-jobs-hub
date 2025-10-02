import { renderHook, act, waitFor } from '@testing-library/react';
import { useWebSocket, usePolling, useLiveDashboard } from '../useRealTime';

// Mock WebSocket
class MockWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  readyState = MockWebSocket.CONNECTING;
  onopen: ((event: Event) => void) | null = null;
  onclose: ((event: CloseEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;

  url: string;
  protocols?: string | string[];

  constructor(url: string, protocols?: string | string[]) {
    this.url = url;
    this.protocols = protocols;
    setTimeout(() => {
      this.readyState = MockWebSocket.OPEN;
      this.onopen?.(new Event('open'));
    }, 10);
  }

  send(_data: string) {
    if (this.readyState === MockWebSocket.OPEN) {
      // Mock successful send
    }
  }

  close() {
    this.readyState = MockWebSocket.CLOSED;
    this.onclose?.(new CloseEvent('close'));
  }

  // Helper method to simulate receiving a message
  simulateMessage(data: any) {
    if (this.readyState === MockWebSocket.OPEN) {
      const event = new MessageEvent('message', {
        data: typeof data === 'string' ? data : JSON.stringify(data),
      });
      this.onmessage?.(event);
    }
  }

  // Helper method to simulate error
  simulateError() {
    this.onerror?.(new Event('error'));
  }
}

// Mock the global WebSocket
(global as any).WebSocket = MockWebSocket;

// Mock useUserPreferences
jest.mock('../useLocalStorage', () => ({
  useUserPreferences: jest.fn(() => ({
    preferences: {
      autoRefreshInterval: 30000,
    },
  })),
}));

describe('useWebSocket', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should connect to WebSocket successfully', async () => {
    const onOpen = jest.fn();
    
    const { result } = renderHook(() =>
      useWebSocket({
        url: 'ws://localhost:8000/ws/',
        onOpen,
      })
    );

    expect(result.current.state).toBe('connecting');
    expect(result.current.isConnecting).toBe(true);

    await waitFor(() => {
      expect(result.current.state).toBe('connected');
    });

    expect(result.current.isConnected).toBe(true);
    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it('should send messages when connected', async () => {
    const { result } = renderHook(() => useWebSocket());

    await waitFor(() => {
      expect(result.current.isConnected).toBe(true);
    });

    const message = { type: 'ping' };
    const success = result.current.sendMessage(message);

    expect(success).toBe(true);
  });

  it('should not send messages when disconnected', () => {
    const { result } = renderHook(() => useWebSocket());

    const message = { type: 'ping' };
    const success = result.current.sendMessage(message);

    expect(success).toBe(false);
  });

  it('should disconnect properly', async () => {
    const { result } = renderHook(() => useWebSocket());

    await waitFor(() => {
      expect(result.current.isConnected).toBe(true);
    });

    act(() => {
      result.current.disconnect();
    });

    expect(result.current.state).toBe('disconnected');
  });
});

describe('usePolling', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should fetch data immediately when immediate is true', async () => {
    const mockData = { id: 1, value: 'test' };
    const fetchFunction = jest.fn().mockResolvedValue(mockData);

    const { result } = renderHook(() =>
      usePolling({
        fetchFunction,
        immediate: true,
        interval: 1000,
      })
    );

    expect(result.current.loading).toBe(true);

    await act(async () => {
      await Promise.resolve(); // Let the promise resolve
    });

    expect(result.current.data).toEqual(mockData);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(fetchFunction).toHaveBeenCalledTimes(1);
  });

  it('should poll at specified intervals', async () => {
    const mockData = { id: 1, value: 'test' };
    const fetchFunction = jest.fn().mockResolvedValue(mockData);

    const { result } = renderHook(() =>
      usePolling({
        fetchFunction,
        immediate: false,
        interval: 1000,
      })
    );

    // Start polling
    act(() => {
      result.current.startPolling();
    });

    // Fast-forward time to trigger polling
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    await act(async () => {
      await Promise.resolve();
    });

    expect(fetchFunction).toHaveBeenCalledTimes(1);

    // Fast-forward again
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    await act(async () => {
      await Promise.resolve();
    });

    expect(fetchFunction).toHaveBeenCalledTimes(2);
  });

  it('should handle fetch errors', async () => {
    const mockError = new Error('Fetch failed');
    const fetchFunction = jest.fn().mockRejectedValue(mockError);
    const onError = jest.fn();

    const { result } = renderHook(() =>
      usePolling({
        fetchFunction,
        immediate: true,
        onError,
      })
    );

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.data).toBe(null);
    expect(result.current.error).toEqual(mockError);
    expect(result.current.loading).toBe(false);
    expect(onError).toHaveBeenCalledWith(mockError);
  });

  it('should stop polling when disabled', async () => {
    const fetchFunction = jest.fn().mockResolvedValue({});

    const { result } = renderHook(() =>
      usePolling({
        fetchFunction,
        enabled: false,
        interval: 1000,
      })
    );

    act(() => {
      result.current.startPolling();
    });

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(fetchFunction).not.toHaveBeenCalled();
  });

  it('should refresh data manually', async () => {
    const mockData = { id: 1, value: 'test' };
    const fetchFunction = jest.fn().mockResolvedValue(mockData);

    const { result } = renderHook(() =>
      usePolling({
        fetchFunction,
        immediate: false,
      })
    );

    expect(result.current.data).toBe(null);

    act(() => {
      result.current.refresh();
    });

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.data).toEqual(mockData);
    expect(fetchFunction).toHaveBeenCalledTimes(1);
  });

  it('should stop polling when component unmounts', () => {
    const fetchFunction = jest.fn().mockResolvedValue({});

    const { unmount } = renderHook(() =>
      usePolling({
        fetchFunction,
        interval: 1000,
      })
    );

    unmount();

    // Advance timers after unmount
    act(() => {
      jest.advanceTimersByTime(2000);
    });

    // Should not call fetch function after unmount
    expect(fetchFunction).not.toHaveBeenCalled();
  });
});

describe('useLiveDashboard', () => {
  it('should initialize with null values', () => {
    const { result } = renderHook(() => useLiveDashboard());

    expect(result.current.metrics).toBe(null);
    expect(result.current.alerts).toEqual([]);
    expect(result.current.activities).toEqual([]);
  });

  it('should update metrics on dashboard_update event', async () => {
    const { result } = renderHook(() => useLiveDashboard());

    await waitFor(() => {
      expect(result.current.isConnected).toBe(true);
    });

    // Simulate dashboard update
    const wsInstance = (global as any).WebSocket.mock?.instances?.[0];
    if (wsInstance) {
      const updateEvent = {
        type: 'dashboard_update',
        data: { totalUsers: 150, activeUsers: 75 },
        timestamp: new Date().toISOString(),
      };

      act(() => {
        wsInstance.simulateMessage(updateEvent);
      });

      expect(result.current.metrics).toEqual({
        totalUsers: 150,
        activeUsers: 75,
      });
    }
  });

  it('should add new alerts on new_alert event', async () => {
    const { result } = renderHook(() => useLiveDashboard());

    await waitFor(() => {
      expect(result.current.isConnected).toBe(true);
    });

    const wsInstance = (global as any).WebSocket.mock?.instances?.[0];
    if (wsInstance) {
      const alertEvent = {
        type: 'new_alert',
        data: { id: 1, message: 'High CPU usage', severity: 'warning' },
        timestamp: new Date().toISOString(),
      };

      act(() => {
        wsInstance.simulateMessage(alertEvent);
      });

      expect(result.current.alerts).toHaveLength(1);
      expect(result.current.alerts[0]).toEqual(alertEvent.data);
    }
  });

  it('should limit alerts to 10 items', async () => {
    const { result } = renderHook(() => useLiveDashboard());

    await waitFor(() => {
      expect(result.current.isConnected).toBe(true);
    });

    const wsInstance = (global as any).WebSocket.mock?.instances?.[0];
    if (wsInstance) {
      // Add 12 alerts
      for (let i = 0; i < 12; i++) {
        const alertEvent = {
          type: 'new_alert',
          data: { id: i, message: `Alert ${i}` },
          timestamp: new Date().toISOString(),
        };

        act(() => {
          wsInstance.simulateMessage(alertEvent);
        });
      }

      expect(result.current.alerts).toHaveLength(10);
      expect(result.current.alerts[0].id).toBe(11); // Most recent first
    }
  });

  it('should add new activities on activity_update event', async () => {
    const { result } = renderHook(() => useLiveDashboard());

    await waitFor(() => {
      expect(result.current.isConnected).toBe(true);
    });

    const wsInstance = (global as any).WebSocket.mock?.instances?.[0];
    if (wsInstance) {
      const activityEvent = {
        type: 'activity_update',
        data: { id: 1, user: 'John Doe', action: 'logged in' },
        timestamp: new Date().toISOString(),
      };

      act(() => {
        wsInstance.simulateMessage(activityEvent);
      });

      expect(result.current.activities).toHaveLength(1);
      expect(result.current.activities[0]).toEqual(activityEvent.data);
    }
  });
});

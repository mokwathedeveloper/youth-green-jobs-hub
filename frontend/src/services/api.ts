import axios from 'axios';
import type { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import type {
  LoginCredentials,
  RegisterData,
  AuthResponse,
  User,
  AuthTokens
} from '../types/auth';
import type {
  WasteCategory,
  CollectionPoint,
  WasteReport,
  WasteReportListResponse,
  CreditTransactionListResponse,
  CollectionEvent,
  CollectionEventDetailType,
  CollectionEventListResponse,
  DashboardStats,
  NearbyCollectionPointsResponse,
  WasteReportFormData,
  CollectionEventFormData,
  WasteReportFilters,
  CollectionEventFilters,
  CreditTransactionFilters,
  MapLocation
} from '../types/waste';
import type {
  Product,
  ProductListItem,
  ProductListResponse,
  SMEVendor,
  VendorListResponse,
  ProductCategory,
  Order,
  OrderListResponse,
  OrderCreateData,
  ProductReview,
  ReviewListResponse,
  ReviewCreateData,
  ShoppingCart,
  CartItem,
  AddToCartData,
  ProductSearchParams,
  ProductRecommendations,
  DashboardStats as ProductDashboardStats,
  PaymentProvider,
  PaymentTransaction,
  PaymentInitiateData,
  PaymentResult,
  PaymentRefundData
} from '../types/products';
import type {
  PlatformMetrics,
  UserEngagementMetrics,
  EnvironmentalImpactMetrics,
  CountyMetrics,
  SystemPerformanceMetrics,
  DashboardAlert,
  DashboardSummary,
  TimeSeriesData,
  CountyRanking,
  WasteCategoryBreakdown,
  TopPerformers,
  SystemHealth,
  EnvironmentalImpactSummary,
  AnalyticsListResponse,
  AnalyticsFilters
} from '../types/analytics';

import { API_CONFIG, GEOLOCATION_CONFIG } from '../config';

// API Error types
export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: Record<string, any>;
}

// API Response wrapper
export interface ApiResponse<T = any> {
  data: T;
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
}

// Retry configuration
interface RetryConfig {
  retries: number;
  retryDelay: number;
  retryCondition?: (error: AxiosError) => boolean;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  retries: 3,
  retryDelay: 1000,
  retryCondition: (error: AxiosError) => {
    return !error.response || error.response.status >= 500;
  },
};

// Create axios instance with enhanced configuration
const apiClient: AxiosInstance = axios.create({
  baseURL: API_CONFIG.FULL_BASE_URL,
  timeout: API_CONFIG.TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request counter for loading states
let activeRequests = 0;
const loadingCallbacks: Set<(loading: boolean) => void> = new Set();

export const subscribeToLoadingState = (callback: (loading: boolean) => void) => {
  loadingCallbacks.add(callback);
  return () => {
    loadingCallbacks.delete(callback);
  };
};

const updateLoadingState = () => {
  const isLoading = activeRequests > 0;
  loadingCallbacks.forEach(callback => callback(isLoading));
};

// Enhanced request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Increment active requests counter
    activeRequests++;
    updateLoadingState();

    // Add auth token if available
    const tokens = localStorage.getItem('auth_tokens');
    if (tokens) {
      try {
        const parsedTokens = JSON.parse(tokens);
        if (parsedTokens.access) {
          config.headers.Authorization = `Bearer ${parsedTokens.access}`;
        }
      } catch (error) {
        console.error('Error parsing auth tokens:', error);
      }
    }

    // Add request timestamp for debugging
    (config as any).metadata = { startTime: Date.now() };

    return config;
  },
  (error) => {
    activeRequests--;
    updateLoadingState();
    return Promise.reject(createApiError(error));
  }
);

// Enhanced response interceptor with retry logic
apiClient.interceptors.response.use(
  (response) => {
    // Decrement active requests counter
    activeRequests--;
    updateLoadingState();

    // Log response time in development
    if (import.meta.env.DEV && (response.config as any).metadata?.startTime) {
      const duration = Date.now() - (response.config as any).metadata.startTime;
      console.log(`API Request: ${response.config.method?.toUpperCase()} ${response.config.url} - ${duration}ms`);
    }

    return response;
  },
  async (error) => {
    // Decrement active requests counter
    activeRequests--;
    updateLoadingState();

    const originalRequest = error.config;

    // Handle 401 Unauthorized with token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const tokens = localStorage.getItem('auth_tokens');
        if (tokens) {
          const parsedTokens = JSON.parse(tokens);
          if (parsedTokens.refresh) {
            const refreshResponse = await authApi.refreshToken(parsedTokens.refresh);
            const newTokens = {
              access: refreshResponse.access,
              refresh: refreshResponse.refresh || parsedTokens.refresh,
            };

            localStorage.setItem('auth_tokens', JSON.stringify(newTokens));
            originalRequest.headers.Authorization = `Bearer ${newTokens.access}`;

            return apiClient(originalRequest);
          }
        }
      } catch (refreshError) {
        // Refresh failed, clear auth and redirect
        localStorage.removeItem('auth_tokens');
        localStorage.removeItem('auth_user');
        window.location.href = '/login';
        return Promise.reject(createApiError(refreshError));
      }
    }

    // Handle retry logic for network errors and 5xx errors
    if (shouldRetry(error, originalRequest)) {
      return retryRequest(originalRequest);
    }

    return Promise.reject(createApiError(error));
  }
);

// Error handling utilities
const createApiError = (error: any): ApiError => {
  if (error.response) {
    // Server responded with error status
    return {
      message: error.response.data?.message || error.response.data?.detail || 'Server error occurred',
      status: error.response.status,
      code: error.response.data?.code,
      details: error.response.data,
    };
  } else if (error.request) {
    // Network error
    return {
      message: 'Network error. Please check your connection.',
      code: 'NETWORK_ERROR',
    };
  } else {
    // Other error
    return {
      message: error.message || 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR',
    };
  }
};

const shouldRetry = (error: AxiosError, config: any): boolean => {
  const retryConfig = config.retryConfig || DEFAULT_RETRY_CONFIG;
  const retryCount = config.__retryCount || 0;

  return (
    retryCount < retryConfig.retries &&
    retryConfig.retryCondition(error)
  );
};

const retryRequest = async (config: any): Promise<any> => {
  const retryConfig = config.retryConfig || DEFAULT_RETRY_CONFIG;
  config.__retryCount = (config.__retryCount || 0) + 1;

  // Exponential backoff
  const delay = retryConfig.retryDelay * Math.pow(2, config.__retryCount - 1);

  await new Promise(resolve => setTimeout(resolve, delay));

  return apiClient(config);
};

// Authentication API
export const authApi = {
  // User registration
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response: AxiosResponse<AuthResponse> = await apiClient.post('/auth/register/', data);
    return response.data;
  },

  // User login
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    // Transform username to username_or_email for backend compatibility
    const loginData = {
      username_or_email: credentials.username,
      password: credentials.password
    };
    const response: AxiosResponse<AuthResponse> = await apiClient.post('/auth/login/', loginData);
    return response.data;
  },

  // User logout
  logout: async (refreshToken: string): Promise<void> => {
    await apiClient.post('/auth/logout/', { refresh: refreshToken });
  },

  // Token refresh
  refreshToken: async (refreshToken: string): Promise<AuthTokens> => {
    const response: AxiosResponse<AuthTokens> = await apiClient.post('/auth/token/refresh/', {
      refresh: refreshToken,
    });
    return response.data;
  },

  // Verify token
  verifyToken: async (accessToken: string): Promise<void> => {
    await apiClient.post('/auth/token/verify/', { token: accessToken });
  },

  // Get user profile
  getProfile: async (accessToken?: string): Promise<User> => {
    const config = accessToken ? {
      headers: { Authorization: `Bearer ${accessToken}` }
    } : {};
    
    const response: AxiosResponse<User> = await apiClient.get('/auth/profile/', config);
    return response.data;
  },

  // Update user profile
  updateProfile: async (data: Partial<User>, accessToken?: string): Promise<User> => {
    const config = accessToken ? {
      headers: { Authorization: `Bearer ${accessToken}` }
    } : {};
    
    const response: AxiosResponse<User> = await apiClient.put('/auth/profile/', data, config);
    return response.data;
  },

  // Change password
  changePassword: async (data: {
    current_password: string;
    new_password: string;
    new_password_confirm: string;
  }): Promise<void> => {
    await apiClient.post('/auth/profile/change-password/', data);
  },

  // Get user list (for directory)
  getUsers: async (params?: {
    county?: string;
    employment_status?: string;
    education_level?: string;
    youth_only?: boolean;
    page?: number;
    page_size?: number;
  }): Promise<{
    count: number;
    next: string | null;
    previous: string | null;
    results: User[];
  }> => {
    const response = await apiClient.get('/auth/users/', { params });
    return response.data;
  },

  // Get user by username
  getUserByUsername: async (username: string): Promise<User> => {
    const response: AxiosResponse<User> = await apiClient.get(`/auth/users/${username}/`);
    return response.data;
  },

  // Password reset request
  requestPasswordReset: async (email: string): Promise<void> => {
    await apiClient.post('/auth/password-reset/', { email });
  },

  // Password reset confirm
  confirmPasswordReset: async (data: {
    token: string;
    new_password: string;
    new_password_confirm: string;
  }): Promise<void> => {
    await apiClient.post('/auth/password-reset/confirm/', data);
  },

  // Email verification
  verifyEmail: async (token: string): Promise<void> => {
    await apiClient.post('/auth/verify-email/', { token });
  },

  // Resend email verification
  resendEmailVerification: async (): Promise<void> => {
    await apiClient.post('/auth/resend-verification/');
  },

  // Get user statistics
  getUserStats: async (): Promise<{
    total_users: number;
    youth_users: number;
    verified_users: number;
    active_users: number;
  }> => {
    const response = await apiClient.get('/auth/stats/');
    return response.data;
  },

  // Deactivate account
  deactivateAccount: async (): Promise<void> => {
    await apiClient.post('/auth/deactivate/');
  },
};

// General API utilities
export const api = {
  // Generic GET request
  get: async <T>(endpoint: string, params?: any): Promise<T> => {
    const response: AxiosResponse<T> = await apiClient.get(endpoint, { params });
    return response.data;
  },

  // Generic POST request
  post: async <T>(endpoint: string, data?: any): Promise<T> => {
    const response: AxiosResponse<T> = await apiClient.post(endpoint, data);
    return response.data;
  },

  // Generic PUT request
  put: async <T>(endpoint: string, data?: any): Promise<T> => {
    const response: AxiosResponse<T> = await apiClient.put(endpoint, data);
    return response.data;
  },

  // Generic DELETE request
  delete: async <T>(endpoint: string): Promise<T> => {
    const response: AxiosResponse<T> = await apiClient.delete(endpoint);
    return response.data;
  },

  // Upload file
  uploadFile: async (endpoint: string, file: File, onProgress?: (progress: number) => void): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });

    return response.data;
  },
};

// Error handling utility
export const handleApiError = (error: any): string => {
  if (error.response?.data) {
    const data = error.response.data;
    
    // Handle field-specific errors
    if (data.field_errors) {
      const firstField = Object.keys(data.field_errors)[0];
      return data.field_errors[firstField][0];
    }
    
    // Handle non-field errors
    if (data.non_field_errors && data.non_field_errors.length > 0) {
      return data.non_field_errors[0];
    }
    
    // Handle detail error
    if (data.detail) {
      return data.detail;
    }
    
    // Handle message error
    if (data.message) {
      return data.message;
    }
  }
  
  // Network or other errors
  if (error.message) {
    return error.message;
  }
  
  return 'An unexpected error occurred. Please try again.';
};

// Waste Collection API
export const wasteApi = {
  // Waste Categories
  getCategories: async (): Promise<WasteCategory[]> => {
    const response = await apiClient.get('/waste/categories/');
    return response.data;
  },

  getCategoryById: async (id: string): Promise<WasteCategory> => {
    const response = await apiClient.get(`/waste/categories/${id}/`);
    return response.data;
  },

  // Collection Points
  getCollectionPoints: async (params?: {
    county?: string;
    point_type?: string;
    is_active?: boolean;
    page?: number;
    page_size?: number;
  }): Promise<{
    count: number;
    next: string | null;
    previous: string | null;
    results: CollectionPoint[];
  }> => {
    const response = await apiClient.get('/waste/collection-points/', { params });
    return response.data;
  },

  getCollectionPointById: async (id: string): Promise<CollectionPoint> => {
    const response = await apiClient.get(`/waste/collection-points/${id}/`);
    return response.data;
  },

  getNearbyCollectionPoints: async (
    latitude: number,
    longitude: number,
    radius: number = 10
  ): Promise<NearbyCollectionPointsResponse> => {
    const response = await apiClient.get('/waste/collection-points/nearby/', {
      params: { latitude, longitude, radius }
    });
    return response.data;
  },

  // Waste Reports
  getWasteReports: async (params?: WasteReportFilters & {
    page?: number;
    page_size?: number;
    ordering?: string;
  }): Promise<WasteReportListResponse> => {
    const response = await apiClient.get('/waste/reports/', { params });
    return response.data;
  },

  getWasteReportById: async (id: string): Promise<WasteReport> => {
    const response = await apiClient.get(`/waste/reports/${id}/`);
    return response.data;
  },

  createWasteReport: async (data: WasteReportFormData): Promise<WasteReport> => {
    const formData = new FormData();

    // Add text fields
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('category_id', data.category_id);
    formData.append('estimated_weight_kg', data.estimated_weight_kg.toString());
    formData.append('location_description', data.location_description);
    formData.append('county', data.county);
    formData.append('priority', data.priority);

    // Add optional fields
    if (data.sub_county) formData.append('sub_county', data.sub_county);
    if (data.latitude) formData.append('latitude', data.latitude.toString());
    if (data.longitude) formData.append('longitude', data.longitude.toString());
    if (data.collection_point_id) formData.append('collection_point_id', data.collection_point_id);
    if (data.photo) formData.append('photo', data.photo);

    const response = await apiClient.post('/waste/reports/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateWasteReport: async (id: string, data: Partial<WasteReportFormData>): Promise<WasteReport> => {
    const response = await apiClient.put(`/waste/reports/${id}/`, data);
    return response.data;
  },

  deleteWasteReport: async (id: string): Promise<void> => {
    await apiClient.delete(`/waste/reports/${id}/`);
  },

  // Staff actions for waste reports
  verifyWasteReport: async (id: string, data: {
    actual_weight_kg?: number;
    notes?: string;
  }): Promise<WasteReport> => {
    const response = await apiClient.post(`/waste/reports/${id}/verify/`, data);
    return response.data;
  },

  collectWasteReport: async (id: string, data: {
    actual_weight_kg: number;
    collection_point_id?: string;
    notes?: string;
  }): Promise<WasteReport> => {
    const response = await apiClient.post(`/waste/reports/${id}/collect/`, data);
    return response.data;
  },

  // Credit Transactions
  getCreditTransactions: async (params?: CreditTransactionFilters & {
    page?: number;
    page_size?: number;
    ordering?: string;
  }): Promise<CreditTransactionListResponse> => {
    const response = await apiClient.get('/waste/credits/', { params });
    return response.data;
  },

  getCreditBalance: async (): Promise<{ balance: number }> => {
    const response = await apiClient.get('/waste/credits/balance/');
    return response.data;
  },

  // Collection Events
  getCollectionEvents: async (params?: CollectionEventFilters & {
    page?: number;
    page_size?: number;
    ordering?: string;
  }): Promise<CollectionEventListResponse> => {
    const response = await apiClient.get('/waste/events/', { params });
    return response.data;
  },

  getCollectionEventById: async (id: string): Promise<CollectionEventDetailType> => {
    const response = await apiClient.get(`/waste/events/${id}/`);
    return response.data;
  },

  createCollectionEvent: async (data: CollectionEventFormData): Promise<CollectionEvent> => {
    const response = await apiClient.post('/waste/events/', data);
    return response.data;
  },

  updateCollectionEvent: async (id: string, data: Partial<CollectionEventFormData>): Promise<CollectionEvent> => {
    const response = await apiClient.put(`/waste/events/${id}/`, data);
    return response.data;
  },

  deleteCollectionEvent: async (id: string): Promise<void> => {
    await apiClient.delete(`/waste/events/${id}/`);
  },

  joinCollectionEvent: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.post(`/waste/events/${id}/join/`);
    return response.data;
  },

  leaveCollectionEvent: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.post(`/waste/events/${id}/leave/`);
    return response.data;
  },

  // Dashboard and Statistics
  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await apiClient.get('/waste/dashboard/stats/');
    return response.data;
  },

  // Location and Map utilities
  getCurrentLocation: (): Promise<MapLocation> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          reject(new Error(`Geolocation error: ${error.message}`));
        },
        GEOLOCATION_CONFIG.OPTIONS
      );
    });
  },

  // File upload with progress
  uploadWastePhoto: async (
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<{ url: string; id: string }> => {
    const formData = new FormData();
    formData.append('photo', file);

    const response = await apiClient.post('/waste/upload-photo/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });

    return response.data;
  },
};

// ===== ECO PRODUCTS API =====
export const productsApi = {

  // Product Catalog
  getProducts: async (params?: ProductSearchParams): Promise<ProductListResponse> => {
    const response = await apiClient.get('/products/products/', { params });
    return response.data;
  },

  getProduct: async (id: string): Promise<Product> => {
    const response = await apiClient.get(`/products/products/${id}/`);
    return response.data;
  },

  getFeaturedProducts: async (): Promise<ProductListItem[]> => {
    const response = await apiClient.get('/products/products/featured/');
    return response.data.results;
  },

  getProductsByVendor: async (vendorId: string, params?: ProductSearchParams): Promise<ProductListResponse> => {
    const response = await apiClient.get(`/products/products/vendor/${vendorId}/`, { params });
    return response.data;
  },

  getProductsByCategory: async (categoryId: string, params?: ProductSearchParams): Promise<ProductListResponse> => {
    const response = await apiClient.get(`/products/products/category/${categoryId}/`, { params });
    return response.data;
  },

  searchProducts: async (params: ProductSearchParams): Promise<ProductListResponse> => {
    const response = await apiClient.get('/products/search/', { params });
    return response.data;
  },

  getProductRecommendations: async (productId: string): Promise<ProductRecommendations> => {
    const response = await apiClient.get(`/products/products/${productId}/recommendations/`);
    return response.data;
  },

  // Vendor Management
  getVendors: async (params?: any): Promise<VendorListResponse> => {
    const response = await apiClient.get('/products/vendors/', { params });
    return response.data;
  },

  getVendor: async (id: string): Promise<SMEVendor> => {
    const response = await apiClient.get(`/products/vendors/${id}/`);
    return response.data;
  },

  // Product Categories
  getProductCategories: async (): Promise<ProductCategory[]> => {
    const response = await apiClient.get('/products/categories/');
    return response.data.results;
  },

  // Shopping Cart
  getCart: async (): Promise<ShoppingCart> => {
    const response = await apiClient.get('/products/cart/');
    return response.data;
  },

  addToCart: async (data: AddToCartData): Promise<CartItem> => {
    const response = await apiClient.post('/products/cart/add/', data);
    return response.data;
  },

  updateCartItem: async (itemId: string, quantity: number): Promise<CartItem> => {
    const response = await apiClient.put(`/products/cart/items/${itemId}/update/`, { quantity });
    return response.data;
  },

  removeFromCart: async (itemId: string): Promise<void> => {
    await apiClient.delete(`/products/cart/items/${itemId}/remove/`);
  },

  clearCart: async (): Promise<void> => {
    await apiClient.delete('/products/cart/clear/');
  },

  // Orders
  getOrders: async (params?: any): Promise<OrderListResponse> => {
    const response = await apiClient.get('/products/orders/', { params });
    return response.data;
  },

  getOrder: async (id: string): Promise<Order> => {
    const response = await apiClient.get(`/products/orders/${id}/`);
    return response.data;
  },

  createOrder: async (data: OrderCreateData): Promise<Order> => {
    const response = await apiClient.post('/products/orders/create/', data);
    return response.data;
  },

  // Reviews
  getProductReviews: async (productId: string, params?: any): Promise<ReviewListResponse> => {
    const response = await apiClient.get(`/products/products/${productId}/reviews/`, { params });
    return response.data;
  },

  createReview: async (data: ReviewCreateData): Promise<ProductReview> => {
    const response = await apiClient.post('/products/reviews/create/', data);
    return response.data;
  },

  markReviewHelpful: async (reviewId: string): Promise<{ helpful_count: number }> => {
    const response = await apiClient.post(`/products/reviews/${reviewId}/helpful/`);
    return response.data;
  },

  // Dashboard Stats
  getProductDashboardStats: async (): Promise<ProductDashboardStats> => {
    const response = await apiClient.get('/products/dashboard/stats/');
    return response.data;
  },
};

// Analytics API Service
export const analyticsApi = {
  // Platform Metrics
  getPlatformMetrics: async (filters?: AnalyticsFilters): Promise<AnalyticsListResponse<PlatformMetrics>> => {
    const response = await apiClient.get('/analytics/platform-metrics/', { params: filters });
    return response.data;
  },

  getPlatformMetricsDetail: async (date: string): Promise<PlatformMetrics> => {
    const response = await apiClient.get(`/analytics/platform-metrics/${date}/`);
    return response.data;
  },

  // User Engagement Metrics
  getUserEngagementMetrics: async (filters?: AnalyticsFilters): Promise<AnalyticsListResponse<UserEngagementMetrics>> => {
    const response = await apiClient.get('/analytics/user-engagement/', { params: filters });
    return response.data;
  },

  // Environmental Impact Metrics
  getEnvironmentalImpactMetrics: async (filters?: AnalyticsFilters): Promise<AnalyticsListResponse<EnvironmentalImpactMetrics>> => {
    const response = await apiClient.get('/analytics/environmental-impact/', { params: filters });
    return response.data;
  },

  // County Metrics
  getCountyMetrics: async (filters?: AnalyticsFilters): Promise<AnalyticsListResponse<CountyMetrics>> => {
    const response = await apiClient.get('/analytics/county-metrics/', { params: filters });
    return response.data;
  },

  // System Performance Metrics
  getSystemPerformanceMetrics: async (filters?: AnalyticsFilters): Promise<AnalyticsListResponse<SystemPerformanceMetrics>> => {
    const response = await apiClient.get('/analytics/system-performance/', { params: filters });
    return response.data;
  },

  // Dashboard Alerts
  getDashboardAlerts: async (filters?: AnalyticsFilters): Promise<AnalyticsListResponse<DashboardAlert>> => {
    const response = await apiClient.get('/analytics/alerts/', { params: filters });
    return response.data;
  },

  createDashboardAlert: async (data: Partial<DashboardAlert>): Promise<DashboardAlert> => {
    const response = await apiClient.post('/analytics/alerts/', data);
    return response.data;
  },

  getDashboardAlert: async (alertId: string): Promise<DashboardAlert> => {
    const response = await apiClient.get(`/analytics/alerts/${alertId}/`);
    return response.data;
  },

  updateDashboardAlert: async (alertId: string, data: Partial<DashboardAlert>): Promise<DashboardAlert> => {
    const response = await apiClient.patch(`/analytics/alerts/${alertId}/`, data);
    return response.data;
  },

  deleteDashboardAlert: async (alertId: string): Promise<void> => {
    await apiClient.delete(`/analytics/alerts/${alertId}/`);
  },

  acknowledgeDashboardAlert: async (alertId: string): Promise<DashboardAlert> => {
    const response = await apiClient.post(`/analytics/alerts/${alertId}/acknowledge/`);
    return response.data;
  },

  // Dashboard Summary and Analytics
  getDashboardSummary: async (): Promise<DashboardSummary> => {
    const response = await apiClient.get('/analytics/dashboard/summary/');
    return response.data;
  },

  getSystemHealth: async (): Promise<SystemHealth> => {
    const response = await apiClient.get('/analytics/dashboard/system-health/');
    return response.data;
  },

  getEnvironmentalImpactSummary: async (days?: number): Promise<EnvironmentalImpactSummary> => {
    const params = days ? { days } : {};
    const response = await apiClient.get('/analytics/dashboard/environmental-impact/', { params });
    return response.data;
  },

  // Chart Data Endpoints
  getWasteCollectionTrends: async (days?: number): Promise<TimeSeriesData> => {
    const params = days ? { days } : {};
    const response = await apiClient.get('/analytics/charts/waste-trends/', { params });
    return response.data;
  },

  getUserGrowthTrends: async (days?: number): Promise<TimeSeriesData> => {
    const params = days ? { days } : {};
    const response = await apiClient.get('/analytics/charts/user-growth/', { params });
    return response.data;
  },

  getMarketplaceTrends: async (days?: number): Promise<TimeSeriesData> => {
    const params = days ? { days } : {};
    const response = await apiClient.get('/analytics/charts/marketplace-trends/', { params });
    return response.data;
  },

  // Rankings and Breakdowns
  getCountyRankings: async (metric?: string, days?: number): Promise<CountyRanking[]> => {
    const params: any = {};
    if (metric) params.metric = metric;
    if (days) params.days = days;
    const response = await apiClient.get('/analytics/rankings/counties/', { params });
    return response.data;
  },

  getWasteCategoryBreakdown: async (days?: number): Promise<WasteCategoryBreakdown[]> => {
    const params = days ? { days } : {};
    const response = await apiClient.get('/analytics/breakdown/waste-categories/', { params });
    return response.data;
  },

  getTopPerformers: async (days?: number): Promise<TopPerformers> => {
    const params = days ? { days } : {};
    const response = await apiClient.get('/analytics/top-performers/', { params });
    return response.data;
  },
};

// Payment API
export const paymentApi = {
  // Get available payment providers
  getPaymentProviders: async (): Promise<{ providers: PaymentProvider[] }> => {
    const response = await apiClient.get('/products/payments/providers/');
    return response.data;
  },

  // Initiate payment
  initiatePayment: async (data: PaymentInitiateData): Promise<PaymentResult> => {
    const response = await apiClient.post('/products/payments/initiate/', data);
    return response.data;
  },

  // Verify payment
  verifyPayment: async (transactionId: string): Promise<PaymentResult> => {
    const response = await apiClient.get(`/products/payments/verify/${transactionId}/`);
    return response.data;
  },

  // Get payment history
  getPaymentHistory: async (page?: number): Promise<{
    count: number;
    next: string | null;
    previous: string | null;
    results: PaymentTransaction[]
  }> => {
    const params = page ? { page } : {};
    const response = await apiClient.get('/products/payments/history/', { params });
    return response.data;
  },

  // Refund payment (admin only)
  refundPayment: async (transactionId: string, data: PaymentRefundData): Promise<PaymentResult> => {
    const response = await apiClient.post(`/products/payments/refund/${transactionId}/`, data);
    return response.data;
  },
};

export default apiClient;

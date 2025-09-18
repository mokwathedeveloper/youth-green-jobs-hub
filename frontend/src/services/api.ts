import axios from 'axios';
import type { AxiosInstance } from 'axios';
import type { AxiosResponse } from 'axios';
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
  DashboardStats as ProductDashboardStats
} from '../types/products';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const API_VERSION = 'v1';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api/${API_VERSION}`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
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
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

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
        // Refresh failed, redirect to login
        localStorage.removeItem('auth_tokens');
        localStorage.removeItem('auth_user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Authentication API
export const authApi = {
  // User registration
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response: AxiosResponse<AuthResponse> = await apiClient.post('/auth/register/', data);
    return response.data;
  },

  // User login
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response: AxiosResponse<AuthResponse> = await apiClient.post('/auth/login/', credentials);
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
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        }
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

  // ===== ECO PRODUCTS API =====

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

export default apiClient;

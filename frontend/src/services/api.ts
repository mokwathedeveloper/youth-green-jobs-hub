import axios, { AxiosInstance } from 'axios';
import type { AxiosResponse } from 'axios';
import { 
  LoginCredentials, 
  RegisterData, 
  AuthResponse, 
  User, 
  AuthTokens 
} from '../types/auth';

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

export default apiClient;

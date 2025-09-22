import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { AuthState, AuthContextType, User, AuthTokens, LoginCredentials, RegisterData } from '../types/auth';
import { authApi, subscribeToLoadingState, type ApiError } from '../services/api';

// Initial state
const initialState: AuthState = {
  user: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Action types
type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; tokens: AuthTokens } }
  | { type: 'AUTH_FAILURE'; payload: ApiError }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'UPDATE_TOKENS'; payload: AuthTokens }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_GLOBAL_LOADING'; payload: boolean };

// Reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        tokens: action.payload.tokens,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        tokens: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload.message,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        tokens: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      };
    case 'UPDATE_TOKENS':
      return {
        ...state,
        tokens: action.payload,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'SET_GLOBAL_LOADING':
      return {
        ...state,
        globalLoading: action.payload,
      };
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Token storage utilities
const TOKEN_STORAGE_KEY = 'auth_tokens';
const USER_STORAGE_KEY = 'auth_user';

const saveToStorage = (tokens: AuthTokens, user: User) => {
  localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokens));
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
};

const loadFromStorage = (): { tokens: AuthTokens | null; user: User | null } => {
  try {
    const tokensStr = localStorage.getItem(TOKEN_STORAGE_KEY);
    const userStr = localStorage.getItem(USER_STORAGE_KEY);
    
    const tokens = tokensStr ? JSON.parse(tokensStr) : null;
    const user = userStr ? JSON.parse(userStr) : null;
    
    return { tokens, user };
  } catch (error) {
    console.error('Error loading auth data from storage:', error);
    return { tokens: null, user: null };
  }
};

const clearStorage = () => {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(USER_STORAGE_KEY);
};

// Provider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Subscribe to global loading state
  useEffect(() => {
    const unsubscribe = subscribeToLoadingState((loading) => {
      dispatch({ type: 'SET_GLOBAL_LOADING', payload: loading });
    });
    return unsubscribe;
  }, []);

  // Initialize auth state from storage
  useEffect(() => {
    const initializeAuth = async () => {
      const { tokens, user } = loadFromStorage();
      
      if (tokens && user) {
        // Verify token is still valid
        try {
          await authApi.verifyToken(tokens.access);
          dispatch({
            type: 'AUTH_SUCCESS',
            payload: { user, tokens },
          });
        } catch (error) {
          // Token invalid, try to refresh
          try {
            const newTokens = await authApi.refreshToken(tokens.refresh);
            const updatedTokens = { ...tokens, access: newTokens.access };
            
            dispatch({
              type: 'AUTH_SUCCESS',
              payload: { user, tokens: updatedTokens },
            });
            saveToStorage(updatedTokens, user);
          } catch (refreshError) {
            // Refresh failed, clear storage
            clearStorage();
            dispatch({ type: 'LOGOUT' });
          }
        }
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    initializeAuth();
  }, []);

  // Auth methods
  const login = useCallback(async (credentials: LoginCredentials) => {
    dispatch({ type: 'AUTH_START' });

    try {
      const response = await authApi.login(credentials);
      const tokens = {
        access: response.access!,
        refresh: response.refresh!,
      };

      // Get user profile
      const user = await authApi.getProfile(tokens.access);

      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user, tokens },
      });

      saveToStorage(tokens, user);
    } catch (error: any) {
      const apiError: ApiError = error.message ? error : {
        message: error.response?.data?.non_field_errors?.[0] ||
                error.response?.data?.detail ||
                'Login failed. Please try again.',
        status: error.response?.status,
        code: error.response?.data?.code,
      };
      dispatch({ type: 'AUTH_FAILURE', payload: apiError });
    }
  }, []);

  const register = async (data: RegisterData) => {
    dispatch({ type: 'AUTH_START' });

    try {
      // Clean the data - remove empty strings for optional fields
      const cleanedData = Object.fromEntries(
        Object.entries(data).filter(([key, value]) => {
          // Keep required fields even if empty (they'll be validated by backend)
          const requiredFields = ['username', 'email', 'password', 'password_confirm', 'first_name', 'last_name'];
          if (requiredFields.includes(key)) return true;
          // For optional fields, only include if they have a value
          return value !== '' && value !== null && value !== undefined;
        })
      ) as RegisterData;

      console.log('Registration data being sent:', cleanedData);
      await authApi.register(cleanedData);

      // Registration successful - do NOT auto-login
      // User should be redirected to login form to authenticate manually
      dispatch({ type: 'SET_LOADING', payload: false });

      // Return success to indicate registration completed
      return { success: true, message: 'Registration successful! Please log in with your credentials.' };
    } catch (error: any) {
      console.error('Registration error:', error);
      console.error('Registration error response:', error.response?.data);
      const apiError: ApiError = error.message ? error : {
        message: error.response?.data?.non_field_errors?.[0] ||
                'Registration failed. Please try again.',
        status: error.response?.status,
        code: error.response?.data?.code,
      };
      dispatch({ type: 'AUTH_FAILURE', payload: apiError });
    }
  };

  const logout = useCallback(async () => {
    if (state.tokens?.refresh) {
      try {
        await authApi.logout(state.tokens.refresh);
      } catch (error) {
        console.error('Logout API call failed:', error);
      }
    }

    clearStorage();
    dispatch({ type: 'LOGOUT' });
  }, [state.tokens?.refresh]);

  const refreshToken = async () => {
    if (!state.tokens?.refresh) {
      throw new Error('No refresh token available');
    }
    
    try {
      const response = await authApi.refreshToken(state.tokens.refresh);
      const newTokens = {
        access: response.access,
        refresh: response.refresh || state.tokens.refresh,
      };
      
      dispatch({ type: 'UPDATE_TOKENS', payload: newTokens });
      
      if (state.user) {
        saveToStorage(newTokens, state.user);
      }
    } catch (error) {
      // Refresh failed, logout user
      logout();
      throw error;
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!state.tokens?.access) {
      throw new Error('No access token available');
    }
    
    try {
      const updatedUser = await authApi.updateProfile(data, state.tokens.access);
      dispatch({ type: 'UPDATE_USER', payload: updatedUser });
      
      if (state.tokens) {
        saveToStorage(state.tokens, updatedUser);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.non_field_errors?.[0] || 
                          'Profile update failed. Please try again.';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  // Utility functions
  const getFullName = useCallback(() => {
    if (!state.user) return '';
    return `${state.user.first_name || ''} ${state.user.last_name || ''}`.trim() || state.user.username;
  }, [state.user]);

  const getInitials = useCallback(() => {
    if (!state.user) return '';
    const firstName = state.user.first_name || '';
    const lastName = state.user.last_name || '';
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    return state.user.username?.[0]?.toUpperCase() || '';
  }, [state.user]);

  const contextValue: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    refreshToken,
    updateProfile,
    clearError,
    getFullName,
    getInitials,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { AuthContext };
export default AuthContext;

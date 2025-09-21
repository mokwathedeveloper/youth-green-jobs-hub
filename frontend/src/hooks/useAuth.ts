import { useContext, useCallback } from 'react';
import AuthContext from '../contexts/AuthContext';
import { authApi } from '../services/api';
import { useApi } from './useApi';
import type { LoginCredentials, RegisterData, User } from '../types/auth';

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  const { user, isAuthenticated, isLoading, login: contextLogin, logout: contextLogout } = context;

  // Login API hook
  const loginApi = useApi(authApi.login, {
    onSuccess: (response) => {
      contextLogin(response.user, response.tokens);
    },
  });

  // Register API hook
  const registerApi = useApi(authApi.register, {
    onSuccess: (response) => {
      contextLogin(response.user, response.tokens);
    },
  });

  // Profile update API hook
  const updateProfileApi = useApi(authApi.updateProfile, {
    onSuccess: (updatedUser) => {
      // Update user in context
      if (user) {
        contextLogin(updatedUser, null);
      }
    },
  });

  // Change password API hook
  const changePasswordApi = useApi(authApi.changePassword);

  // Logout API hook
  const logoutApi = useApi(authApi.logout, {
    onSuccess: () => {
      contextLogout();
    },
    onError: () => {
      // Even if logout fails on server, clear local state
      contextLogout();
    },
  });

  // Convenience methods
  const login = useCallback(
    (credentials: LoginCredentials) => {
      return loginApi.execute(credentials);
    },
    [loginApi]
  );

  const register = useCallback(
    (data: RegisterData) => {
      return registerApi.execute(data);
    },
    [registerApi]
  );

  const updateProfile = useCallback(
    (data: Partial<User>) => {
      return updateProfileApi.execute(data);
    },
    [updateProfileApi]
  );

  const changePassword = useCallback(
    (data: { current_password: string; new_password: string; new_password_confirm: string }) => {
      return changePasswordApi.execute(data);
    },
    [changePasswordApi]
  );

  const logout = useCallback(() => {
    const tokens = localStorage.getItem('auth_tokens');
    if (tokens) {
      try {
        const parsedTokens = JSON.parse(tokens);
        if (parsedTokens.refresh) {
          return logoutApi.execute(parsedTokens.refresh);
        }
      } catch (error) {
        console.error('Error parsing tokens for logout:', error);
      }
    }
    // Fallback to context logout
    contextLogout();
  }, [logoutApi, contextLogout]);

  // Check if user has specific role
  const hasRole = useCallback(
    (role: string) => {
      return user?.role === role;
    },
    [user]
  );

  // Check if user is youth (18-35)
  const isYouth = useCallback(() => {
    return user?.is_youth || false;
  }, [user]);

  // Check if user is verified
  const isVerified = useCallback(() => {
    return user?.is_verified || false;
  }, [user]);

  // Get user's full name
  const getFullName = useCallback(() => {
    if (!user) return '';
    return `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username;
  }, [user]);

  // Get user's initials for avatar
  const getInitials = useCallback(() => {
    if (!user) return '';
    const firstName = user.first_name || '';
    const lastName = user.last_name || '';
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    return user.username?.[0]?.toUpperCase() || '';
  }, [user]);

  return {
    // State
    user,
    isAuthenticated,
    isLoading: isLoading || loginApi.loading || registerApi.loading,
    
    // Actions
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    
    // API states
    loginError: loginApi.error,
    registerError: registerApi.error,
    updateProfileError: updateProfileApi.error,
    changePasswordError: changePasswordApi.error,
    
    loginLoading: loginApi.loading,
    registerLoading: registerApi.loading,
    updateProfileLoading: updateProfileApi.loading,
    changePasswordLoading: changePasswordApi.loading,
    
    // Utility methods
    hasRole,
    isYouth,
    isVerified,
    getFullName,
    getInitials,
    
    // Reset methods
    resetLoginError: loginApi.reset,
    resetRegisterError: registerApi.reset,
    resetUpdateProfileError: updateProfileApi.reset,
    resetChangePasswordError: changePasswordApi.reset,
  };
};

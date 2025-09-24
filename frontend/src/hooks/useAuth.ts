import { useCallback } from 'react';
import { useAuth as useAuthContext } from '../contexts/AuthContext';
import { authApi } from '../services/api';
import { useApi } from './useApi';
import type {
  LoginCredentials,
  RegisterData,
  User,
  ChangePasswordData,
} from '../types/auth';

/**
 * Enhanced useAuth hook that extends AuthContext with additional functionality
 * This hook provides extra features like profile updates, password changes, etc.
 */
export const useAuth = () => {
  // Get the base auth context
  const authContext = useAuthContext();

  // Additional API hooks for extended functionality
  const updateProfileApi = useApi(authApi.updateProfile, {
    onSuccess: (updatedUser: User) => {
      // The AuthContext will handle updating the user state
      console.log('Profile updated successfully:', updatedUser);
    },
  });

  const changePasswordApi = useApi(authApi.changePassword, {
    onSuccess: () => {
      console.log('Password changed successfully');
    },
  });

  // Enhanced login function that handles the complete flow
  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      // Use the AuthContext login function
      await authContext.login(credentials);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }, [authContext]);

  // Enhanced register function
  const register = useCallback(async (data: RegisterData) => {
    try {
      // Use the AuthContext register function
      await authContext.register(data);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  }, [authContext]);

  // Profile update function
  const updateProfile = useCallback(async (data: Partial<User>) => {
    try {
      const updatedUser = await updateProfileApi.execute(data);
      // Refresh the auth context to get updated user data
      if (updatedUser) {
        await authContext.refreshToken();
      }
      return updatedUser;
    } catch (error) {
      console.error('Profile update failed:', error);
      throw error;
    }
  }, [updateProfileApi, authContext]);

  // Change password function
  const changePassword = useCallback(async (data: ChangePasswordData) => {
    try {
      await changePasswordApi.execute(data);
    } catch (error) {
      console.error('Password change failed:', error);
      throw error;
    }
  }, [changePasswordApi]);

  // User role checking functions (based on available user properties)
  const hasRole = useCallback((role: string) => {
    // Since there's no role field, we can check based on other properties
    if (role === 'youth') return authContext.user?.is_youth || false;
    if (role === 'verified') return authContext.user?.is_verified || false;
    return false;
  }, [authContext.user]);

  const isYouth = useCallback(() => {
    return authContext.user?.is_youth || false;
  }, [authContext.user]);

  const isVerified = useCallback(() => {
    return authContext.user?.is_verified || false;
  }, [authContext.user]);

  const isAdmin = useCallback(() => {
    return authContext.user?.is_staff || authContext.user?.is_superuser || false;
  }, [authContext.user]);

  const isSuperuser = useCallback(() => {
    return authContext.user?.is_superuser || false;
  }, [authContext.user]);

  const isStaff = useCallback(() => {
    return authContext.user?.is_staff || false;
  }, [authContext.user]);

  return {
    // Core auth state from context
    ...authContext,

    // Enhanced functions
    login,
    register,
    updateProfile,
    changePassword,

    // User utility functions
    hasRole,
    isYouth,
    isVerified,
    isAdmin,
    isSuperuser,
    isStaff,

    // Additional loading states
    updateProfileLoading: updateProfileApi.loading,
    changePasswordLoading: changePasswordApi.loading,

    // Additional error states
    updateProfileError: updateProfileApi.error,
    changePasswordError: changePasswordApi.error,

    // Reset methods for additional APIs
    resetUpdateProfileError: updateProfileApi.reset,
    resetChangePasswordError: changePasswordApi.reset,
  };
};
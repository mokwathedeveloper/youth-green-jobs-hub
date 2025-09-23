// Authentication types for the Youth Green Jobs Hub

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  date_of_birth?: string;
  age?: number;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  bio?: string;
  county?: string;
  sub_county?: string;
  address?: string;
  education_level?: 'primary' | 'secondary' | 'tertiary' | 'university' | 'vocational' | 'other';
  skills?: string;
  skills_list?: string[];
  interests?: string;
  interests_list?: string[];
  employment_status?: 'employed' | 'unemployed' | 'seeking_work' | 'student' | 'self_employed';
  profile_picture?: string;
  is_verified?: boolean;
  preferred_language?: 'en' | 'sw';
  receive_sms_notifications?: boolean;
  receive_email_notifications?: boolean;
  is_youth?: boolean;
  is_staff?: boolean;
  is_superuser?: boolean;
  profile_completion_percentage?: number;
  date_joined?: string;
  last_activity?: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  county?: string;
  sub_county?: string;
  education_level?: 'primary' | 'secondary' | 'tertiary' | 'university' | 'vocational' | 'other';
  employment_status?: 'employed' | 'unemployed' | 'seeking_work' | 'student' | 'self_employed';
  preferred_language?: 'en' | 'sw';
}

export interface ChangePasswordData {
  current_password: string;
  new_password: string;
  new_password_confirm: string;
}

export interface AuthResponse {
  message?: string;
  user?: User;
  tokens?: AuthTokens;
  access?: string;
  refresh?: string;
}

export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  globalLoading?: boolean;
  error: string | null;
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<{ success: boolean; message: string } | void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  clearError: () => void;
  getFullName: () => string;
  getInitials: () => string;
}

export interface ApiError {
  message: string;
  field_errors?: Record<string, string[]>;
  non_field_errors?: string[];
}

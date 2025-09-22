# Frontend Authentication System Documentation

## Overview

The Youth Green Jobs Hub frontend authentication system provides a comprehensive, secure, and user-friendly authentication experience built with React, TypeScript, and modern web standards.

## Architecture

### Core Components

1. **AuthContext** - Centralized authentication state management
2. **API Service Layer** - HTTP client with automatic token management
3. **Protected Routing** - Route guards and access control
4. **Authentication Components** - Login, Register, and Profile forms
5. **UI Components** - Reusable form elements and feedback components

### Technology Stack

- **React 18.3.1** - Component framework
- **TypeScript** - Type safety and developer experience
- **React Router DOM 7.9.1** - Client-side routing
- **React Hook Form 7.62.0** - Form state management
- **Zod 4.1.9** - Schema validation
- **Axios 1.12.2** - HTTP client
- **Tailwind CSS 4.x** - Styling framework
- **Lucide React** - Icon library

## Authentication Flow

### 1. User Registration

```typescript
// Registration with immediate JWT token generation
const registerUser = async (data: RegisterFormData) => {
  const response = await authApi.register(data);
  // Automatic login after successful registration
  if (response.tokens && response.user) {
    setAuthState({ user: response.user, tokens: response.tokens });
    saveToStorage(response.tokens, response.user);
  }
};
```

### 2. User Login

```typescript
// Login with username/password
const login = async (credentials: LoginCredentials) => {
  const response = await authApi.login(credentials);
  const tokens = { access: response.access!, refresh: response.refresh! };
  const user = await authApi.getProfile(tokens.access);
  
  setAuthState({ user, tokens });
  saveToStorage(tokens, user);
};
```

### 3. Token Management

- **Access Token**: 60-minute lifetime for API requests
- **Refresh Token**: 7-day lifetime with automatic rotation
- **Automatic Refresh**: Interceptors handle token refresh transparently
- **Secure Storage**: localStorage with error handling

### 4. Logout

```typescript
const logout = async () => {
  if (refreshToken) {
    await authApi.logout(refreshToken); // Blacklist token on server
  }
  clearStorage();
  setAuthState(initialState);
};
```

## Components Documentation

### AuthContext

**Location**: `src/contexts/AuthContext.tsx`

Provides centralized authentication state management using React Context API.

**State Properties**:
- `user: User | null` - Current user data
- `tokens: AuthTokens | null` - JWT access and refresh tokens
- `isAuthenticated: boolean` - Authentication status
- `isLoading: boolean` - Loading state for async operations
- `error: string | null` - Error messages

**Methods**:
- `login(credentials)` - Authenticate user
- `register(data)` - Register new user
- `logout()` - Sign out user
- `refreshToken()` - Refresh access token
- `updateProfile(data)` - Update user profile
- `clearError()` - Clear error state

### Protected Routing

**ProtectedRoute Component**: `src/components/routing/ProtectedRoute.tsx`

Provides flexible route protection with multiple access control options:

```typescript
<ProtectedRoute 
  requireAuth={true}
  redirectTo="/login"
  minAge={18}
  maxAge={35}
>
  <YouthOnlyComponent />
</ProtectedRoute>
```

**AuthGuard Component**: `src/components/routing/AuthGuard.tsx`

Simple authentication requirement for protected pages:

```typescript
<AuthGuard>
  <DashboardPage />
</AuthGuard>
```

**GuestGuard Component**: `src/components/routing/GuestGuard.tsx`

Redirects authenticated users away from guest-only pages:

```typescript
<GuestGuard>
  <LoginForm />
</GuestGuard>
```

### Authentication Forms

#### LoginForm

**Location**: `src/components/auth/LoginForm.tsx`

Features:
- Username/password authentication
- Form validation with Zod schema
- Password visibility toggle
- Error handling and display
- Responsive design

#### RegisterForm

**Location**: `src/components/auth/RegisterForm.tsx`

Features:
- Multi-section registration form
- Youth-specific profile fields
- Kenya-specific validation (phone numbers, locations)
- Real-time form validation
- Progressive disclosure of form sections

#### ProfileForm

**Location**: `src/components/auth/ProfileForm.tsx`

Features:
- Complete profile management
- Profile completion percentage tracking
- Notification preferences
- Skills and interests management
- Real-time validation and updates

### API Service Layer

**Location**: `src/services/api.ts`

Provides a comprehensive HTTP client with:

- **Automatic Token Injection**: Adds Bearer tokens to requests
- **Token Refresh**: Automatic refresh on 401 responses
- **Error Handling**: Standardized error processing
- **Type Safety**: Full TypeScript integration

**Key Methods**:

```typescript
// Authentication endpoints
authApi.register(data: RegisterData): Promise<AuthResponse>
authApi.login(credentials: LoginCredentials): Promise<AuthResponse>
authApi.logout(refreshToken: string): Promise<void>
authApi.refreshToken(refreshToken: string): Promise<AuthTokens>
authApi.getProfile(): Promise<User>
authApi.updateProfile(data: Partial<User>): Promise<User>

// Generic API methods
api.get<T>(endpoint: string, params?: any): Promise<T>
api.post<T>(endpoint: string, data?: any): Promise<T>
api.put<T>(endpoint: string, data?: any): Promise<T>
api.delete<T>(endpoint: string): Promise<T>
```

### Form Validation

**Location**: `src/schemas/auth.ts`

Comprehensive Zod schemas for form validation:

#### Login Schema
- Username: 3+ characters, alphanumeric + special chars
- Password: 8+ characters, complexity requirements

#### Registration Schema
- All login fields plus:
- Email validation
- Password confirmation matching
- Phone number: Kenya format (+254XXXXXXXXX)
- Age validation: 16-50 years
- Youth eligibility: 18-35 years

#### Profile Update Schema
- All user profile fields
- Optional field validation
- Skills and interests as comma-separated strings
- Notification preferences

## UI Components

### Reusable Form Components

**Button**: `src/components/ui/Button.tsx`
- Multiple variants (primary, secondary, outline, ghost, danger)
- Loading states with spinner
- Size options (sm, md, lg)

**Input**: `src/components/ui/Input.tsx`
- Label and error message support
- Password visibility toggle
- Consistent styling and validation states

**Select**: `src/components/ui/Select.tsx`
- Dropdown with options
- Placeholder support
- Error handling

**Alert**: `src/components/ui/Alert.tsx`
- Multiple types (success, error, warning, info)
- Dismissible with close button
- Icon integration

## Layout System

### DashboardLayout

**Location**: `src/components/layout/DashboardLayout.tsx`

Features:
- Responsive sidebar navigation
- Mobile-friendly hamburger menu
- User profile display
- Active route highlighting
- Logout functionality

### PublicLayout

**Location**: `src/components/layout/PublicLayout.tsx`

Features:
- Public header with navigation
- Call-to-action buttons
- Footer with branding

## Environment Configuration

**File**: `frontend/.env`

```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:8000

# App Configuration
VITE_APP_NAME="Youth Green Jobs Hub"
VITE_APP_VERSION=1.0.0

# Features
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DEBUG=true
```

## Security Features

### Token Security
- JWT tokens with short expiration (60 minutes)
- Automatic token rotation on refresh
- Secure token storage with error handling
- Token blacklisting on logout

### Form Security
- Client-side validation with Zod schemas
- CSRF protection through Django backend
- Input sanitization and validation
- Error message sanitization

### Route Security
- Protected routes with authentication checks
- Age-based access control
- Role-based routing (extensible)
- Automatic redirects for unauthorized access

## Error Handling

### API Errors
```typescript
const handleApiError = (error: any): string => {
  // Field-specific errors
  if (error.response?.data?.field_errors) {
    return error.response.data.field_errors[firstField][0];
  }
  
  // General errors
  if (error.response?.data?.non_field_errors) {
    return error.response.data.non_field_errors[0];
  }
  
  // Fallback
  return 'An unexpected error occurred. Please try again.';
};
```

### Form Errors
- Real-time validation with Zod
- Field-specific error messages
- Form-level error display
- User-friendly error formatting

## Integration with Backend

### API Endpoints
- **POST** `/api/v1/auth/register/` - User registration
- **POST** `/api/v1/auth/login/` - User login
- **POST** `/api/v1/auth/logout/` - User logout
- **POST** `/api/v1/auth/token/refresh/` - Token refresh
- **GET** `/api/v1/auth/profile/` - Get user profile
- **PUT** `/api/v1/auth/profile/` - Update user profile

### CORS Configuration
Backend configured to accept requests from frontend origin with proper headers.

## Testing Strategy

### Manual Testing Checklist
- [ ] User registration with valid data
- [ ] User registration with invalid data
- [ ] User login with correct credentials
- [ ] User login with incorrect credentials
- [ ] Profile update functionality
- [ ] Token refresh on expiration
- [ ] Logout functionality
- [ ] Protected route access
- [ ] Guest route redirects
- [ ] Mobile responsiveness

### Automated Testing (Future)
- Unit tests for components
- Integration tests for authentication flow
- E2E tests for complete user journeys

## Performance Considerations

### Code Splitting
- Lazy loading of authentication components
- Route-based code splitting
- Dynamic imports for large dependencies

### Bundle Optimization
- Tree-shaking with proper imports
- Type-only imports for TypeScript
- Minimal bundle size for authentication

### Caching Strategy
- Token storage in localStorage
- User data persistence
- API response caching (future enhancement)

## Accessibility

### Form Accessibility
- Proper label associations
- ARIA attributes for form validation
- Keyboard navigation support
- Screen reader compatibility

### Visual Accessibility
- High contrast color scheme
- Focus indicators
- Responsive text sizing
- Color-blind friendly design

## Future Enhancements

### Planned Features
- Social authentication (Google, Facebook)
- Two-factor authentication (2FA)
- Password reset functionality
- Email verification
- Remember me functionality
- Session management
- Advanced role-based access control

### Performance Improvements
- Service worker for offline support
- Progressive Web App (PWA) features
- Advanced caching strategies
- Real-time notifications

## Troubleshooting

### Common Issues

1. **Import Errors**: Use `import type` for TypeScript types
2. **Token Expiration**: Check automatic refresh implementation
3. **CORS Issues**: Verify backend CORS configuration
4. **Form Validation**: Check Zod schema definitions
5. **Route Protection**: Verify AuthContext integration

### Debug Mode
Enable debug mode in environment variables to see detailed logs and error information.

## Conclusion

The frontend authentication system provides a robust, secure, and user-friendly foundation for the Youth Green Jobs Hub. It follows modern React patterns, implements comprehensive security measures, and provides an excellent developer experience with TypeScript integration.

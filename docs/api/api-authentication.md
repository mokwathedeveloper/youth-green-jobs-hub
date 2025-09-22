# Authentication API Documentation

## Overview

The Youth Green Jobs & Waste Recycling Hub authentication system provides secure JWT-based authentication for youth users in Kisumu, Kenya. The API supports user registration, login, profile management, and comprehensive user directory features.

## Base URL

```
http://localhost:8000/api/v1/auth/
```

## Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <access_token>
```

## Endpoints

### 1. User Registration

**POST** `/register/`

Register a new youth user with immediate JWT token generation.

#### Request Body

```json
{
  "username": "string (required, unique)",
  "email": "string (required, unique, valid email)",
  "password": "string (required, min 8 chars)",
  "password_confirm": "string (required, must match password)",
  "first_name": "string (required)",
  "last_name": "string (required)",
  "phone_number": "string (optional, format: +254XXXXXXXXX)",
  "date_of_birth": "string (required, format: YYYY-MM-DD, age 16-50)",
  "gender": "string (optional, choices: male, female, other, prefer_not_to_say)",
  "county": "string (optional, default: Kisumu)",
  "sub_county": "string (optional)",
  "address": "string (optional)",
  "education_level": "string (optional, choices: none, primary, secondary, tertiary, university, postgraduate)",
  "employment_status": "string (optional, choices: employed, unemployed, seeking_work, student, self_employed)"
}
```

#### Response (201 Created)

```json
{
  "message": "Registration successful! Welcome to Youth Green Jobs Hub.",
  "user": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com",
    "first_name": "Test",
    "last_name": "User",
    "phone_number": "+254712345678",
    "date_of_birth": "1995-05-15",
    "age": 30,
    "gender": "male",
    "bio": null,
    "county": "Kisumu",
    "sub_county": null,
    "address": null,
    "education_level": "university",
    "skills": null,
    "skills_list": [],
    "interests": null,
    "interests_list": [],
    "employment_status": "seeking_work",
    "profile_picture": null,
    "is_verified": false,
    "preferred_language": "en",
    "receive_sms_notifications": true,
    "receive_email_notifications": true,
    "is_youth": true,
    "profile_completion_percentage": 100,
    "date_joined": "2025-09-18T14:43:58.265708+03:00",
    "last_activity": "2025-09-18T14:43:58.834913+03:00"
  },
  "tokens": {
    "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 2. User Login

**POST** `/login/`

Authenticate user and receive JWT tokens.

#### Request Body

```json
{
  "username": "string (required, username)",
  "password": "string (required)"
}
```

#### Response (200 OK)

```json
{
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 3. Token Refresh

**POST** `/token/refresh/`

Generate new access token using refresh token.

#### Request Body

```json
{
  "refresh": "string (required, valid refresh token)"
}
```

#### Response (200 OK)

```json
{
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 4. User Profile

**GET** `/profile/` (Protected)

Get current user's complete profile information.

#### Response (200 OK)

```json
{
  "id": 1,
  "username": "testuser",
  "email": "test@example.com",
  "first_name": "Test",
  "last_name": "User",
  "phone_number": "+254712345678",
  "date_of_birth": "1995-05-15",
  "age": 30,
  "gender": "male",
  "bio": null,
  "county": "Kisumu",
  "sub_county": null,
  "address": null,
  "education_level": "university",
  "skills": null,
  "skills_list": [],
  "interests": null,
  "interests_list": [],
  "employment_status": "seeking_work",
  "profile_picture": null,
  "is_verified": false,
  "preferred_language": "en",
  "receive_sms_notifications": true,
  "receive_email_notifications": true,
  "is_youth": true,
  "profile_completion_percentage": 100,
  "date_joined": "2025-09-18T14:43:58.265708+03:00",
  "last_activity": "2025-09-18T14:43:58.834913+03:00"
}
```

**PUT** `/profile/` (Protected)

Update current user's profile information.

#### Request Body

```json
{
  "first_name": "string (optional)",
  "last_name": "string (optional)",
  "phone_number": "string (optional)",
  "bio": "string (optional, max 500 chars)",
  "county": "string (optional)",
  "sub_county": "string (optional)",
  "address": "string (optional)",
  "education_level": "string (optional)",
  "skills": "string (optional, comma-separated)",
  "interests": "string (optional, comma-separated)",
  "employment_status": "string (optional)",
  "preferred_language": "string (optional, choices: en, sw)",
  "receive_sms_notifications": "boolean (optional)",
  "receive_email_notifications": "boolean (optional)"
}
```

### 5. User Directory

**GET** `/users/` (Protected)

Get paginated list of users with filtering options.

#### Query Parameters

- `county`: Filter by county (e.g., `?county=Kisumu`)
- `employment_status`: Filter by employment status
- `education_level`: Filter by education level
- `youth_only`: Show only youth users (age 18-35) (`?youth_only=true`)
- `page`: Page number for pagination
- `page_size`: Number of results per page (max 50)

#### Response (200 OK)

```json
{
  "count": 1,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "username": "testuser",
      "first_name": "Test",
      "last_name": "User",
      "county": "Kisumu",
      "age": 30,
      "is_youth": true,
      "education_level": "university",
      "employment_status": "seeking_work",
      "profile_picture": null,
      "date_joined": "2025-09-18T14:43:58.265708+03:00"
    }
  ]
}
```

### 6. Logout

**POST** `/logout/` (Protected)

Blacklist refresh token for secure logout.

#### Request Body

```json
{
  "refresh": "string (required, refresh token to blacklist)"
}
```

#### Response (200 OK)

```json
{
  "message": "Successfully logged out. Token has been blacklisted."
}
```

## Error Responses

### Validation Errors (400 Bad Request)

```json
{
  "field_name": ["Error message for this field"],
  "another_field": ["Another error message"]
}
```

### Authentication Errors (401 Unauthorized)

```json
{
  "detail": "Given token not valid for any token type",
  "code": "token_not_valid",
  "messages": [
    {
      "token_class": "AccessToken",
      "token_type": "access",
      "message": "Token is invalid or expired"
    }
  ]
}
```

### Permission Errors (403 Forbidden)

```json
{
  "detail": "You do not have permission to perform this action."
}
```

## Token Configuration

- **Access Token Lifetime**: 60 minutes
- **Refresh Token Lifetime**: 7 days
- **Token Rotation**: Enabled (new refresh token on each refresh)
- **Token Blacklisting**: Enabled for secure logout
- **Issuer**: `youth-green-jobs-hub`

## User Model Fields

### Required Fields
- `username`: Unique username
- `email`: Unique email address
- `password`: Secure password (min 8 characters)
- `first_name`: User's first name
- `last_name`: User's last name
- `date_of_birth`: Birth date (age validation 16-50)

### Optional Profile Fields
- `phone_number`: Kenyan phone number format
- `gender`: Gender identity
- `bio`: Personal biography (max 500 chars)
- `county`: County of residence (default: Kisumu)
- `sub_county`: Sub-county of residence
- `address`: Physical address
- `education_level`: Highest education level
- `skills`: Comma-separated skills list
- `interests`: Comma-separated interests list
- `employment_status`: Current employment status
- `profile_picture`: Profile image upload
- `preferred_language`: Interface language (en/sw)
- `receive_sms_notifications`: SMS notification preference
- `receive_email_notifications`: Email notification preference

### Computed Fields
- `age`: Calculated from date_of_birth
- `is_youth`: True if age between 18-35
- `skills_list`: Parsed skills array
- `interests_list`: Parsed interests array
- `profile_completion_percentage`: Profile completeness score

## Security Features

1. **JWT Authentication**: Secure token-based authentication
2. **Token Blacklisting**: Secure logout with token invalidation
3. **Password Validation**: Strong password requirements
4. **Age Validation**: Youth eligibility verification
5. **Rate Limiting**: Protection against brute force attacks
6. **CORS Configuration**: Secure cross-origin requests
7. **Input Validation**: Comprehensive data validation
8. **Permission Classes**: Role-based access control

## Integration Examples

### Frontend Login Flow

```javascript
// 1. Login
const loginResponse = await fetch('/api/v1/auth/login/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'testuser',
    password: 'TestPassword123!'
  })
});

const { access, refresh } = await loginResponse.json();

// 2. Store tokens
localStorage.setItem('access_token', access);
localStorage.setItem('refresh_token', refresh);

// 3. Use access token for API calls
const profileResponse = await fetch('/api/v1/auth/profile/', {
  headers: {
    'Authorization': `Bearer ${access}`,
    'Content-Type': 'application/json'
  }
});
```

### Token Refresh Implementation

```javascript
async function refreshToken() {
  const refresh = localStorage.getItem('refresh_token');
  
  const response = await fetch('/api/v1/auth/token/refresh/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh })
  });
  
  if (response.ok) {
    const { access, refresh: newRefresh } = await response.json();
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', newRefresh);
    return access;
  } else {
    // Redirect to login
    window.location.href = '/login';
  }
}
```

## Next Steps

1. **Frontend Integration**: Connect React components to authentication API
2. **Email Verification**: Implement email verification system
3. **Password Reset**: Add password reset functionality
4. **Social Authentication**: Add Google/Facebook login options
5. **Two-Factor Authentication**: Implement 2FA for enhanced security
6. **User Analytics**: Track user engagement and activity
7. **Admin Dashboard**: Create admin interface for user management

---

**API Version**: v1  
**Last Updated**: September 18, 2025  
**Contact**: support@youthgreenjobs.ke

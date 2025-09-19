# Configuration Guide

## Overview

This guide covers all configuration options for the Youth Green Jobs & Waste Recycling Hub platform. The system uses environment variables for configuration, making it easy to deploy across different environments.

## Quick Start

1. **Backend Configuration**:
   ```bash
   cp .env.example .env
   # Edit .env with your specific values
   ```

2. **Frontend Configuration**:
   ```bash
   cd frontend
   cp .env.example .env.local
   # Edit .env.local with your specific values
   ```

## Backend Configuration (.env)

### Core Django Settings

| Variable | Default | Description |
|----------|---------|-------------|
| `SECRET_KEY` | - | Django secret key (required) |
| `DEBUG` | `True` | Enable debug mode |
| `ALLOWED_HOSTS` | `localhost,127.0.0.1` | Comma-separated allowed hosts |

### Database Configuration

#### Option 1: DATABASE_URL (Recommended for Production)
```env
DATABASE_URL=postgresql://user:password@host:port/database
```

#### Option 2: Individual Settings
```env
DB_ENGINE=django.db.backends.postgresql
DB_NAME=youth_green_jobs_db
DB_USER=your_user
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
```

### Platform Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `DEFAULT_COUNTY` | `Kisumu` | Default county for the platform |
| `DEFAULT_COUNTRY` | `Kenya` | Default country |
| `PLATFORM_NAME` | `Youth Green Jobs & Waste Recycling Hub` | Platform name |
| `PLATFORM_VERSION` | `1.0.0` | Platform version |
| `SUPPORT_EMAIL` | `support@youthgreenjobs.ke` | Support email |
| `SUPPORT_WEBSITE` | `https://youthgreenjobs.ke` | Support website |

### Youth Eligibility

| Variable | Default | Description |
|----------|---------|-------------|
| `YOUTH_MIN_AGE` | `18` | Minimum age for youth eligibility |
| `YOUTH_MAX_AGE` | `35` | Maximum age for youth eligibility |

### File Upload Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `WASTE_REPORTS_UPLOAD_DIR` | `waste_reports/` | Directory for waste report photos |
| `PRODUCTS_UPLOAD_DIR` | `products/` | Directory for product images |
| `VERIFICATION_DOCS_UPLOAD_DIR` | `verification_documents/` | Directory for verification documents |
| `PROFILE_PICTURES_UPLOAD_DIR` | `profile_pictures/` | Directory for profile pictures |
| `MAX_UPLOAD_SIZE_MB` | `10` | Maximum file upload size in MB |

### Security Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `SECURE_SSL_REDIRECT` | `False` | Redirect HTTP to HTTPS |
| `SECURE_HSTS_SECONDS` | `0` | HTTP Strict Transport Security max age |
| `SESSION_COOKIE_SECURE` | `False` | Use secure cookies (HTTPS only) |
| `CSRF_COOKIE_SECURE` | `False` | Use secure CSRF cookies |
| `CSRF_TRUSTED_ORIGINS` | - | Comma-separated trusted origins |

### JWT Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `JWT_ACCESS_TOKEN_LIFETIME_MINUTES` | `60` | Access token lifetime in minutes |
| `JWT_REFRESH_TOKEN_LIFETIME_DAYS` | `7` | Refresh token lifetime in days |
| `JWT_ROTATE_REFRESH_TOKENS` | `True` | Rotate refresh tokens |
| `JWT_ISSUER` | `youth-green-jobs-hub` | JWT issuer |

### API Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `DRF_PAGE_SIZE` | `20` | Default pagination page size |
| `API_DEFAULT_TIMEOUT_SECONDS` | `30` | Default API timeout |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:3000,http://localhost:5173` | Comma-separated CORS origins |

### Geolocation Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `DEFAULT_LATITUDE` | `-0.0917` | Default latitude (Kisumu) |
| `DEFAULT_LONGITUDE` | `34.7680` | Default longitude (Kisumu) |
| `GEOLOCATION_TIMEOUT_MS` | `10000` | Geolocation timeout in milliseconds |
| `GEOLOCATION_MAX_AGE_MS` | `300000` | Geolocation cache max age |

## Frontend Configuration (.env.local)

### API Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_BASE_URL` | `http://localhost:8000` | Backend API base URL |
| `VITE_API_VERSION` | `v1` | API version |
| `VITE_API_TIMEOUT_MS` | `30000` | API request timeout |

### App Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_APP_NAME` | `Youth Green Jobs Hub` | Application name |
| `VITE_APP_VERSION` | `1.0.0` | Application version |
| `VITE_APP_DESCRIPTION` | - | Application description |

### Feature Flags

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_ENABLE_ANALYTICS` | `false` | Enable analytics features |
| `VITE_ENABLE_DEBUG` | `true` | Enable debug mode |
| `VITE_ENABLE_GEOLOCATION` | `true` | Enable geolocation features |

### UI Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_DEFAULT_PAGE_SIZE` | `20` | Default pagination size |
| `VITE_MAX_FILE_SIZE_MB` | `10` | Maximum file upload size |
| `VITE_SUPPORTED_IMAGE_FORMATS` | `jpg,jpeg,png,webp` | Supported image formats |
| `VITE_SUPPORTED_DOCUMENT_FORMATS` | `pdf,doc,docx` | Supported document formats |

## Environment-Specific Configurations

### Development Environment

```env
# Backend (.env)
DEBUG=True
SECRET_KEY=your-dev-secret-key
DATABASE_URL=sqlite:///db.sqlite3
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# Frontend (.env.local)
VITE_API_BASE_URL=http://localhost:8000
VITE_ENABLE_DEBUG=true
VITE_ENABLE_ANALYTICS=false
```

### Production Environment

```env
# Backend (.env)
DEBUG=False
SECRET_KEY=your-production-secret-key
DATABASE_URL=postgresql://user:pass@host:port/db
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
SECURE_SSL_REDIRECT=True
SECURE_HSTS_SECONDS=31536000
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True
CORS_ALLOWED_ORIGINS=https://yourdomain.com

# Frontend (.env.local)
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_ENABLE_DEBUG=false
VITE_ENABLE_ANALYTICS=true
```

## Configuration Validation

The system includes built-in configuration validation:

### Backend Validation
- Run `python manage.py check` to validate Django configuration
- The configuration manager validates settings on startup

### Frontend Validation
- Configuration is validated when the app starts
- Check browser console for validation errors in development

## Best Practices

1. **Never commit .env files** - Use .env.example as templates
2. **Use strong secret keys** in production
3. **Enable HTTPS** in production environments
4. **Set appropriate CORS origins** for your domains
5. **Configure proper database connections** for production
6. **Use environment-specific feature flags**
7. **Set reasonable timeout values** based on your infrastructure
8. **Configure proper file upload limits** based on your storage capacity

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Check DATABASE_URL format
   - Verify database server is running
   - Check network connectivity

2. **CORS Errors**
   - Add your frontend URL to CORS_ALLOWED_ORIGINS
   - Check protocol (http vs https)

3. **File Upload Issues**
   - Check MAX_UPLOAD_SIZE_MB setting
   - Verify upload directory permissions
   - Check available disk space

4. **JWT Token Issues**
   - Verify SECRET_KEY is consistent
   - Check token lifetime settings
   - Ensure system clocks are synchronized

For more help, check the logs or contact support at the configured support email.

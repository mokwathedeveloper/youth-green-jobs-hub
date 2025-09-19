# Configuration Migration Guide

## Overview

This guide helps you migrate from hardcoded configurations to the new environment-based configuration system.

## What Changed

### Backend Changes

1. **Hardcoded values replaced with environment variables**:
   - Default county: `'Kisumu'` → `get_default_county()`
   - CORS origins: Hardcoded URLs → `CORS_ALLOWED_ORIGINS` env var
   - JWT settings: Hardcoded values → Configurable via env vars
   - File upload paths: Hardcoded → Configurable directories
   - Age limits: Hardcoded 18-35 → `YOUTH_MIN_AGE`/`YOUTH_MAX_AGE`

2. **New configuration utilities**:
   - `youth_green_jobs_backend/config.py` - Configuration manager
   - Validation functions for configuration
   - Helper functions for common operations

3. **Enhanced database configuration**:
   - Support for `DATABASE_URL` (production)
   - Individual database settings (development)
   - Connection pooling and health checks

4. **Improved security settings**:
   - Environment-specific security headers
   - Configurable HTTPS/SSL settings
   - Cookie security options

### Frontend Changes

1. **New configuration system**:
   - `frontend/src/config/index.ts` - Centralized configuration
   - Environment-based API settings
   - Configurable timeouts and limits

2. **Replaced hardcoded values**:
   - API base URL: Hardcoded fallback → Environment variable
   - Timeout values: Hardcoded → Configurable
   - Geolocation settings: Hardcoded → Configurable

## Migration Steps

### Step 1: Update Environment Files

1. **Backend**: Update your `.env` file:
   ```bash
   # Backup existing .env
   cp .env .env.backup
   
   # Copy new template
   cp .env.example .env
   
   # Migrate your existing values
   # Compare .env.backup with new .env and update accordingly
   ```

2. **Frontend**: Update your environment file:
   ```bash
   cd frontend
   # Backup existing environment file
   cp .env.local .env.local.backup 2>/dev/null || true
   
   # Copy new template
   cp .env.example .env.local
   
   # Update with your values
   ```

### Step 2: Update Custom Configurations

If you had custom modifications, update them:

#### Backend Custom Values

**Before (hardcoded)**:
```python
# In models.py
county = models.CharField(max_length=100, default='Kisumu')

# In views.py
min_birth_date = today - timedelta(days=35*365)  # 35 years ago
max_birth_date = today - timedelta(days=18*365)  # 18 years ago
```

**After (configurable)**:
```python
# In models.py
from youth_green_jobs_backend.config import get_default_county
county = models.CharField(max_length=100, default=get_default_county)

# In views.py
from youth_green_jobs_backend.config import get_youth_age_range
min_age, max_age = get_youth_age_range()
min_birth_date = today - timedelta(days=max_age*365)
max_birth_date = today - timedelta(days=min_age*365)
```

#### Frontend Custom Values

**Before (hardcoded)**:
```typescript
const API_BASE_URL = 'http://localhost:8000';
const timeout = 10000;
```

**After (configurable)**:
```typescript
import { API_CONFIG } from '../config';
const apiClient = axios.create({
  baseURL: API_CONFIG.FULL_BASE_URL,
  timeout: API_CONFIG.TIMEOUT_MS,
});
```

### Step 3: Database Migration (if needed)

If you're switching database configurations:

1. **Backup your data**:
   ```bash
   python manage.py dumpdata > backup.json
   ```

2. **Update database settings** in `.env`

3. **Run migrations**:
   ```bash
   python manage.py migrate
   ```

4. **Load data** (if needed):
   ```bash
   python manage.py loaddata backup.json
   ```

### Step 4: Validate Configuration

1. **Backend validation**:
   ```bash
   python manage.py check
   python manage.py shell -c "from youth_green_jobs_backend.config import ConfigManager; print(ConfigManager.validate_config())"
   ```

2. **Frontend validation**:
   ```bash
   cd frontend
   npm run dev
   # Check browser console for configuration validation messages
   ```

### Step 5: Test Your Application

1. **Start the backend**:
   ```bash
   python manage.py runserver
   ```

2. **Start the frontend**:
   ```bash
   cd frontend
   npm run dev
   ```

3. **Test key functionality**:
   - User registration/login
   - File uploads
   - API calls
   - Geolocation features

## Configuration Mapping

### Environment Variable Mapping

| Old Hardcoded Value | New Environment Variable | Default |
|-------------------|-------------------------|---------|
| `'Kisumu'` (county) | `DEFAULT_COUNTY` | `Kisumu` |
| `18` (min age) | `YOUTH_MIN_AGE` | `18` |
| `35` (max age) | `YOUTH_MAX_AGE` | `35` |
| `'waste_reports/'` | `WASTE_REPORTS_UPLOAD_DIR` | `waste_reports/` |
| `'products/'` | `PRODUCTS_UPLOAD_DIR` | `products/` |
| `20` (page size) | `DRF_PAGE_SIZE` | `20` |
| `10000` (timeout) | `API_DEFAULT_TIMEOUT_SECONDS` | `30` |

### Frontend Mapping

| Old Hardcoded Value | New Environment Variable | Default |
|-------------------|-------------------------|---------|
| `'http://localhost:8000'` | `VITE_API_BASE_URL` | `http://localhost:8000` |
| `10000` (timeout) | `VITE_API_TIMEOUT_MS` | `30000` |
| `300000` (max age) | `VITE_GEOLOCATION_MAX_AGE_MS` | `300000` |

## Rollback Plan

If you need to rollback:

1. **Restore backup files**:
   ```bash
   # Backend
   cp .env.backup .env
   
   # Frontend
   cd frontend
   cp .env.local.backup .env.local
   ```

2. **Revert code changes** (if you made custom modifications)

3. **Restart services**

## Common Migration Issues

### Issue 1: Missing Environment Variables

**Symptom**: Application fails to start or uses unexpected defaults

**Solution**: 
- Check `.env` file exists and is readable
- Verify all required variables are set
- Use `python manage.py check` to validate

### Issue 2: Database Connection Issues

**Symptom**: Database connection errors after migration

**Solution**:
- Verify `DATABASE_URL` format
- Check database server is running
- Test connection manually

### Issue 3: CORS Errors

**Symptom**: Frontend can't connect to backend

**Solution**:
- Update `CORS_ALLOWED_ORIGINS` with your frontend URL
- Check protocol (http vs https)
- Restart backend after changes

### Issue 4: File Upload Issues

**Symptom**: File uploads fail or go to wrong directory

**Solution**:
- Check upload directory configuration
- Verify directory permissions
- Ensure directories exist

## Post-Migration Checklist

- [ ] All environment variables are set
- [ ] Application starts without errors
- [ ] Database connections work
- [ ] File uploads work correctly
- [ ] API calls succeed
- [ ] Authentication works
- [ ] Geolocation features work
- [ ] Configuration validation passes
- [ ] All tests pass

## Getting Help

If you encounter issues during migration:

1. Check the logs for specific error messages
2. Validate your configuration using the built-in validators
3. Compare your settings with the examples in this guide
4. Check the main configuration guide for detailed explanations
5. Contact support if needed

## Benefits After Migration

- **Flexibility**: Easy to configure for different environments
- **Security**: Sensitive values in environment variables
- **Maintainability**: Centralized configuration management
- **Scalability**: Easy deployment across multiple environments
- **Validation**: Built-in configuration validation
- **Documentation**: Clear documentation of all options

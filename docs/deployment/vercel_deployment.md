# 🌐 Vercel Frontend Deployment Guide

## Prerequisites
1. Install Vercel CLI: `npm install -g vercel`
2. Create Vercel account
3. Have your backend deployed and URL ready

## Step 1: Prepare Frontend for Vercel

### 1. Update Environment Variables
Create `.env.production` in frontend folder:
```bash
# Backend API URL (from your Heroku deployment)
VITE_API_BASE_URL=https://your-youth-green-jobs-api.herokuapp.com

# Google Maps (if using)
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key

# App Configuration
VITE_APP_NAME="Youth Green Jobs Hub"
VITE_APP_VERSION="1.0.0"
```

### 2. Update API Configuration
In your frontend code, make sure you're using the environment variable:
```javascript
// src/config/api.js or similar
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api/v1/`,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

### 3. Create `vercel.json` (if needed)
```json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "env": {
    "VITE_API_BASE_URL": "@vite_api_base_url"
  }
}
```

## Step 2: Deploy to Vercel

### 1. Login and Deploy
```bash
cd frontend
vercel login
vercel
```

### 2. Configure Environment Variables in Vercel Dashboard
1. Go to your project in Vercel dashboard
2. Go to Settings → Environment Variables
3. Add:
   - `VITE_API_BASE_URL` = `https://your-youth-green-jobs-api.herokuapp.com`
   - `VITE_GOOGLE_MAPS_API_KEY` = `your_google_maps_key`

### 3. Redeploy with Environment Variables
```bash
vercel --prod
```

## Step 3: Update Backend CORS Settings

After getting your Vercel URL, update your Heroku backend:

```bash
# Add your Vercel URL to CORS settings
heroku config:set CORS_ALLOWED_ORIGINS="https://your-frontend-app.vercel.app,http://localhost:3000,http://localhost:5173"

heroku config:set CSRF_TRUSTED_ORIGINS="https://your-frontend-app.vercel.app,https://your-youth-green-jobs-api.herokuapp.com"
```

## Step 4: Test Full Integration

1. **Test Backend API:**
   ```bash
   curl https://your-youth-green-jobs-api.herokuapp.com/api/v1/
   ```

2. **Test Frontend:**
   - Visit `https://your-frontend-app.vercel.app`
   - Check browser console for any CORS errors
   - Test API calls from frontend

## Your Final URLs:
- **Backend API:** `https://your-youth-green-jobs-api.herokuapp.com`
- **Frontend App:** `https://your-frontend-app.vercel.app`
- **Admin Panel:** `https://your-youth-green-jobs-api.herokuapp.com/admin/`

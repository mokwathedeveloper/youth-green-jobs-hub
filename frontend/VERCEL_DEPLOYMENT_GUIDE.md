# 🚀 Vercel Deployment Guide
## Youth Green Jobs Hub Frontend

This guide will help you deploy the React frontend to Vercel and connect it with the Django backend on Render.

## 📋 Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Your code should be pushed to GitHub
3. **Backend Running**: Ensure your Django backend is deployed on Render

## 🔧 Step-by-Step Deployment

### Step 1: Connect GitHub to Vercel

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click **"New Project"**
3. Import your GitHub repository: `mokwathedeveloper/youth-green-jobs-hub`
4. Select the **frontend** folder as the root directory

### Step 2: Configure Build Settings

Vercel should auto-detect the settings, but verify:

- **Framework Preset**: Vite
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### Step 3: Environment Variables

Add these environment variables in Vercel dashboard:

```
VITE_API_BASE_URL=https://youth-green-jobs-hub.onrender.com
VITE_API_VERSION=v1
VITE_APP_NAME=Youth Green Jobs Hub
VITE_DEFAULT_COUNTY=Kisumu
VITE_DEFAULT_COUNTRY=Kenya
VITE_ENABLE_GEOLOCATION=true
VITE_DEFAULT_LATITUDE=-0.0917
VITE_DEFAULT_LONGITUDE=34.7680
```

### Step 4: Deploy

1. Click **"Deploy"**
2. Wait for the build to complete (2-3 minutes)
3. Your app will be available at: `https://your-project-name.vercel.app`

## 🔗 Backend Connection

The frontend is configured to automatically connect to your Render backend:

- **Backend URL**: `https://youth-green-jobs-hub.onrender.com`
- **API Endpoints**: `/api/v1/auth/`, `/api/v1/waste/`, etc.
- **CORS**: Already configured to allow Vercel domains

## 🧪 Testing the Connection

After deployment, test these key features:

1. **Registration**: Create a new user account
2. **Login**: Sign in with credentials
3. **Dashboard**: Access the main dashboard
4. **API Calls**: Verify data loading from backend

## 🔧 Custom Domain (Optional)

To use a custom domain:

1. Go to your Vercel project settings
2. Click **"Domains"**
3. Add your custom domain
4. Update DNS records as instructed
5. Update CORS settings in backend if needed

## 🚨 Troubleshooting

### Common Issues:

1. **CORS Errors**: 
   - Check backend CORS settings include your Vercel domain
   - Verify environment variables are set correctly

2. **API Connection Failed**:
   - Ensure backend is running on Render
   - Check API base URL in environment variables

3. **Build Failures**:
   - Check Node.js version compatibility
   - Verify all dependencies are in package.json

### Debug Steps:

1. Check Vercel build logs
2. Test API endpoints directly in browser
3. Use browser developer tools to inspect network requests
4. Verify environment variables in Vercel dashboard

## 📱 Mobile Responsiveness

The app is fully responsive and will work on:
- Desktop browsers
- Mobile devices (iOS/Android)
- Tablets
- Progressive Web App (PWA) features

## 🔄 Automatic Deployments

Vercel automatically deploys when you:
- Push to the main branch
- Merge pull requests
- Make changes to the frontend folder

## 📊 Performance

Expected performance metrics:
- **First Load**: < 3 seconds
- **Lighthouse Score**: 90+
- **Core Web Vitals**: All green
- **Bundle Size**: < 2MB

## 🎯 Next Steps

After successful deployment:

1. Test all user flows
2. Set up monitoring and analytics
3. Configure custom domain
4. Set up staging environment
5. Implement CI/CD pipeline

## 📞 Support

If you encounter issues:
1. Check Vercel documentation
2. Review backend logs on Render
3. Test API endpoints independently
4. Contact support if needed

---

**Deployment URL**: Will be provided after deployment
**Backend API**: https://youth-green-jobs-hub.onrender.com
**Status**: Ready for deployment ✅

# 🚀 Deployment Checklist: Heroku + Vercel

## 📋 **Deployment Order: Backend First, Then Frontend**

### **Why This Order?**
1. ✅ Frontend needs backend API URL to function
2. ✅ Backend deployment takes longer and has more configuration
3. ✅ You can test API endpoints before connecting frontend
4. ✅ CORS settings need to be updated after getting frontend URL

---

## 🔧 **Phase 1: Deploy Backend to Heroku**

### **Pre-deployment Checklist:**
- [ ] ✅ PostgreSQL working locally
- [ ] ✅ All migrations applied
- [ ] ✅ Superuser created
- [ ] ✅ API endpoints tested
- [ ] ✅ Heroku CLI installed
- [ ] ✅ Git repository ready

### **Files Created for Heroku:**
- [ ] ✅ `Procfile` - Heroku process configuration
- [ ] ✅ `runtime.txt` - Python version specification
- [ ] ✅ `youth_green_jobs_backend/heroku_settings.py` - Heroku-specific settings
- [ ] ✅ `requirements.txt` - Updated with production dependencies

### **Heroku Deployment Steps:**

#### 1. **Create Heroku App**
```bash
heroku login
heroku create youth-green-jobs-api  # Choose your own name
```

#### 2. **Add PostgreSQL with PostGIS**
```bash
heroku addons:create heroku-postgresql:essential-0
heroku pg:psql -c "CREATE EXTENSION IF NOT EXISTS postgis;"
```

#### 3. **Set Environment Variables**
```bash
# Core Django settings
heroku config:set DJANGO_SETTINGS_MODULE=youth_green_jobs_backend.heroku_settings
heroku config:set SECRET_KEY="M@nnV$96)y+E^5eIndW&OYs5Lk50_SdMc29Zd_8Zbn&bb=!Gz7"

# Platform settings
heroku config:set PLATFORM_NAME="Youth Green Jobs Hub"
heroku config:set DEFAULT_COUNTY="Kisumu"
heroku config:set DEFAULT_COUNTRY="Kenya"
heroku config:set SUPPORT_EMAIL="support@youthgreenjobs.ke"

# Email settings (update with your credentials)
heroku config:set EMAIL_HOST_USER="your-email@gmail.com"
heroku config:set EMAIL_HOST_PASSWORD="your-gmail-app-password"

# Payment settings (add when ready)
# heroku config:set MPESA_CONSUMER_KEY="your_mpesa_key"
# heroku config:set PAYSTACK_PUBLIC_KEY="your_paystack_key"

# Google Maps (add when ready)
# heroku config:set GOOGLE_MAPS_API_KEY="your_google_maps_key"
```

#### 4. **Deploy to Heroku**
```bash
git add .
git commit -m "Prepare for Heroku deployment"
git push heroku main
```

#### 5. **Run Post-deployment Commands**
```bash
heroku run python manage.py migrate
heroku run python manage.py createsuperuser
heroku run python manage.py collectstatic --noinput
```

#### 6. **Test Backend Deployment**
```bash
# Test API root
curl https://your-app-name.herokuapp.com/api/v1/

# Test admin (in browser)
# https://your-app-name.herokuapp.com/admin/
```

### **Backend Deployment Checklist:**
- [ ] App created on Heroku
- [ ] PostgreSQL addon added with PostGIS
- [ ] Environment variables set
- [ ] Code deployed successfully
- [ ] Migrations run successfully
- [ ] Superuser created
- [ ] Static files collected
- [ ] API endpoints responding
- [ ] Admin panel accessible

**🎯 Backend URL:** `https://your-app-name.herokuapp.com`

---

## 🌐 **Phase 2: Deploy Frontend to Vercel**

### **Pre-deployment Checklist:**
- [ ] Backend deployed and working
- [ ] Backend URL obtained
- [ ] Vercel CLI installed
- [ ] Frontend code ready

### **Frontend Preparation:**

#### 1. **Update Frontend Environment Variables**
Create/update `frontend/.env.production`:
```bash
VITE_API_BASE_URL=https://your-app-name.herokuapp.com
VITE_APP_NAME="Youth Green Jobs Hub"
VITE_APP_VERSION="1.0.0"
# VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key
```

#### 2. **Verify API Configuration**
Check that your frontend uses the environment variable:
```javascript
// In your API configuration file
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
```

### **Vercel Deployment Steps:**

#### 1. **Deploy to Vercel**
```bash
cd frontend
vercel login
vercel  # Follow prompts
```

#### 2. **Configure Environment Variables**
In Vercel Dashboard:
1. Go to your project → Settings → Environment Variables
2. Add:
   - `VITE_API_BASE_URL` = `https://your-app-name.herokuapp.com`
   - `VITE_GOOGLE_MAPS_API_KEY` = `your_key` (when ready)

#### 3. **Redeploy with Environment Variables**
```bash
vercel --prod
```

**🎯 Frontend URL:** `https://your-frontend-app.vercel.app`

---

## 🔄 **Phase 3: Connect Frontend and Backend**

### **Update Backend CORS Settings:**
```bash
# Add your Vercel URL to backend CORS settings
heroku config:set CORS_ALLOWED_ORIGINS="https://your-frontend-app.vercel.app,http://localhost:3000,http://localhost:5173"

heroku config:set CSRF_TRUSTED_ORIGINS="https://your-frontend-app.vercel.app,https://your-app-name.herokuapp.com"
```

### **Update Heroku Settings File:**
Edit `youth_green_jobs_backend/heroku_settings.py` and update:
```python
CORS_ALLOWED_ORIGINS = [
    "https://your-actual-frontend-url.vercel.app",  # Update this
    "http://localhost:3000",
    "http://localhost:5173",
]

CSRF_TRUSTED_ORIGINS = [
    "https://your-actual-frontend-url.vercel.app",  # Update this
    "https://*.herokuapp.com",
]
```

Then redeploy:
```bash
git add .
git commit -m "Update CORS settings for Vercel frontend"
git push heroku main
```

---

## ✅ **Final Testing Checklist**

### **Backend Tests:**
- [ ] API root endpoint: `https://your-app-name.herokuapp.com/api/v1/`
- [ ] Admin panel: `https://your-app-name.herokuapp.com/admin/`
- [ ] Authentication endpoints working
- [ ] Database queries working
- [ ] No CORS errors in browser console

### **Frontend Tests:**
- [ ] App loads: `https://your-frontend-app.vercel.app`
- [ ] API calls working from frontend
- [ ] No CORS errors
- [ ] Authentication flow working
- [ ] All features functional

### **Integration Tests:**
- [ ] User registration works
- [ ] User login works
- [ ] API calls from frontend to backend work
- [ ] File uploads work (if applicable)
- [ ] Payment integration works (when configured)

---

## 🎉 **Success! Your App is Live**

### **Your Live URLs:**
- **Frontend:** `https://your-frontend-app.vercel.app`
- **Backend API:** `https://your-app-name.herokuapp.com/api/v1/`
- **Admin Panel:** `https://your-app-name.herokuapp.com/admin/`

### **Next Steps:**
1. 🔐 Set up custom domain (optional)
2. 📧 Configure email settings
3. 💳 Set up payment gateways
4. 🗺️ Add Google Maps API key
5. 📊 Set up monitoring and analytics
6. 🔒 Configure SSL certificates (Heroku provides free SSL)

---

## 🆘 **Troubleshooting**

### **Common Issues:**
1. **CORS Errors:** Update CORS_ALLOWED_ORIGINS in backend
2. **Database Errors:** Check Heroku PostgreSQL addon
3. **Static Files:** Run `heroku run python manage.py collectstatic`
4. **Environment Variables:** Check `heroku config` output

### **Useful Commands:**
```bash
# Check Heroku logs
heroku logs --tail

# Check Heroku config
heroku config

# Restart Heroku app
heroku restart

# Run Django commands on Heroku
heroku run python manage.py shell
```

**🌱 Your Youth Green Jobs Hub is now live and ready to make an impact!**

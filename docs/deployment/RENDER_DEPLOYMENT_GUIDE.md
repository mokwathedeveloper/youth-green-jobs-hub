# 🚀 Render Deployment Guide
## Youth Green Jobs Hub - Backend Deployment

Render is an excellent alternative to Heroku with better free tier and easier setup.

---

## ✅ **Why Render is Better:**

- **🆓 Free Tier:** No credit card required
- **🚀 Faster:** Better performance than Heroku free
- **🔄 Auto Deploy:** Automatic deployments from GitHub
- **🗄️ PostgreSQL:** Free PostgreSQL with PostGIS support
- **🛡️ SSL:** Free SSL certificates
- **📊 Monitoring:** Built-in monitoring and logs

---

## 📋 **Step-by-Step Deployment**

### **Step 1: Prepare Your Code**

✅ **Already Done:**
- [x] `render.yaml` - Render configuration
- [x] `build.sh` - Build script
- [x] `youth_green_jobs_backend/render_settings.py` - Render settings
- [x] `requirements.txt` - Dependencies
- [x] Payment gateways configured

### **Step 2: Push to GitHub**

1. **Initialize Git (if not done):**
   ```bash
   git init
   git add .
   git commit -m "Initial commit for Render deployment"
   ```

2. **Create GitHub Repository:**
   - Go to https://github.com/
   - Create new repository: `youth-green-jobs-hub`
   - Make it public (required for free tier)

3. **Push to GitHub:**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/youth-green-jobs-hub.git
   git branch -M main
   git push -u origin main
   ```

### **Step 3: Deploy on Render**

1. **Go to Render:**
   - Visit: https://render.com/
   - Sign up with GitHub account
   - Connect your GitHub account

2. **Create New Web Service:**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select `youth-green-jobs-hub`

3. **Configure Web Service:**
   ```
   Name: youth-green-jobs-api
   Environment: Python 3
   Build Command: ./build.sh
   Start Command: gunicorn youth_green_jobs_backend.wsgi:application
   ```

4. **Add Environment Variables:**
   Click "Advanced" and add these:
   ```
   DJANGO_SETTINGS_MODULE=youth_green_jobs_backend.render_settings
   SECRET_KEY=your-secret-key-here
   EMAIL_HOST_USER=moffatmokwa12@gmail.com
   EMAIL_HOST_PASSWORD=submvqaqehrsafag
   MPESA_CONSUMER_KEY=Ke64cGWZwtUkTVxthjAAlBMifiOnS3zgwQLLoBVGRLHJs4kv
   MPESA_CONSUMER_SECRET=cAlHJM16AkWBIDnnOlAYQIqyG9FDmiBy4mAfXiOTAKfjPHlwAYIK7H72dMCocYLE
   MPESA_BUSINESS_SHORT_CODE=174379
   MPESA_PASSKEY=bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919
   MPESA_SANDBOX=True
   PAYSTACK_PUBLIC_KEY=pk_test_d915e01d46c506ba76e7b594e7c4aa0632754596
   PAYSTACK_SECRET_KEY=sk_test_b5881958a5fe756e92a31e141ed0a870b6accda5
   PAYSTACK_SANDBOX=True
   ```

5. **Create PostgreSQL Database:**
   - Click "New +" → "PostgreSQL"
   - Name: `youth-green-jobs-db`
   - Plan: Free
   - Click "Create Database"

6. **Connect Database:**
   - Copy the "Internal Database URL"
   - Add to web service environment variables:
   ```
   DATABASE_URL=postgresql://username:password@host:port/database
   ```

7. **Deploy:**
   - Click "Create Web Service"
   - Wait for deployment (5-10 minutes)

---

## 🎯 **Your Live URLs**

After deployment, you'll get:
- **Backend API:** `https://youth-green-jobs-api.onrender.com/api/v1/`
- **Admin Panel:** `https://youth-green-jobs-api.onrender.com/admin/`

---

## 🧪 **Testing Your Deployment**

### **Test API Endpoints:**
```bash
# Test API root
curl https://youth-green-jobs-api.onrender.com/api/v1/

# Test admin (in browser)
https://youth-green-jobs-api.onrender.com/admin/
```

### **Test Payments:**
- **M-Pesa:** Use test phone `254708374149`, PIN `1234`
- **Paystack:** Use test cards from earlier

---

## 🔧 **Post-Deployment Setup**

### **1. Create Superuser:**
In Render dashboard → Shell:
```bash
python manage.py createsuperuser
```

### **2. Update Frontend URLs:**
Update your frontend to use:
```javascript
const API_BASE_URL = 'https://youth-green-jobs-api.onrender.com';
```

### **3. Add Google Maps (Optional):**
Add these environment variables when you get the keys:
```
GOOGLE_MAPS_API_KEY=your_server_api_key
GOOGLE_MAPS_JS_API_KEY=your_frontend_api_key
```

---

## 📊 **Render Free Tier Limits**

### **Web Service:**
- **Hours:** 750 hours/month (enough for 24/7)
- **Sleep:** Sleeps after 15 minutes of inactivity
- **Wake:** ~30 seconds to wake up
- **Bandwidth:** 100GB/month

### **PostgreSQL:**
- **Storage:** 1GB
- **Connections:** 97 concurrent
- **Backup:** 90 days retention

### **Upgrade Options:**
- **Starter:** $7/month (no sleep)
- **Standard:** $25/month (more resources)

---

## 🚨 **Troubleshooting**

### **Build Fails:**
- Check build logs in Render dashboard
- Verify `requirements.txt` is correct
- Ensure `build.sh` is executable

### **Database Connection:**
- Verify DATABASE_URL is correct
- Check PostgreSQL service is running
- Ensure PostGIS extension is installed

### **Static Files:**
- Check `collectstatic` runs in build
- Verify WhiteNoise is configured
- Check STATIC_ROOT setting

### **Environment Variables:**
- Verify all required vars are set
- Check for typos in variable names
- Ensure sensitive data is not in code

---

## 🎯 **Advantages Over Heroku**

| Feature | Render | Heroku |
|---------|--------|--------|
| **Free Tier** | 750 hours | 550 hours |
| **Sleep Time** | 15 minutes | 30 minutes |
| **Wake Time** | ~30 seconds | ~30 seconds |
| **PostgreSQL** | 1GB free | 10k rows free |
| **SSL** | Free | Free |
| **Custom Domain** | Free | Paid |
| **Build Time** | Faster | Slower |
| **Setup** | Easier | More complex |

---

## ✅ **Deployment Checklist**

- [ ] Code pushed to GitHub
- [ ] Render account created
- [ ] Web service configured
- [ ] PostgreSQL database created
- [ ] Environment variables set
- [ ] Deployment successful
- [ ] API endpoints working
- [ ] Admin panel accessible
- [ ] Payments tested
- [ ] Frontend updated

---

## 🎉 **Success!**

Once deployed, your Youth Green Jobs Hub will be live at:
**https://youth-green-jobs-api.onrender.com**

**Ready to deploy to Render? It's much easier than Heroku!** 🚀

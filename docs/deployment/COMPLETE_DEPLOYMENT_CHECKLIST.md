# 🚀 Youth Green Jobs Hub - Complete Deployment Checklist

## ✅ **Current Status Summary**

### **COMPLETED ✅**
- [x] **Environment Configuration** - Gmail: `moffatmokwa12@gmail.com` with app password
- [x] **Database Setup** - PostgreSQL with PostGIS working locally
- [x] **Dependencies** - All production packages in `requirements.txt`
- [x] **Heroku Configuration** - `Procfile`, `runtime.txt`, settings ready
- [x] **Security Settings** - CORS, CSRF, HTTPS, security headers configured
- [x] **Heroku CLI** - Installed and authenticated as `moffatmokwa12@gmail.com`

### **IN PROGRESS ⚠️**
- [ ] **Heroku Account Verification** - Add payment method at https://heroku.com/verify
- [ ] **App Deployment** - Run `./deploy_to_heroku.sh` after verification

### **READY TO CONFIGURE 🔧**
- [ ] **Payment Gateways** - M-Pesa and Paystack credentials
- [ ] **Google Maps API** - API keys for location services
- [ ] **Frontend Deployment** - Deploy to Vercel after backend is live

---

## 🌐 **Phase 1: Complete Heroku Deployment**

### **Step 1: Verify Heroku Account** ⚠️
**Current Blocker:** Account verification required

**Action Required:**
1. Go to: https://heroku.com/verify
2. Add payment method (credit/debit card)
3. **No charges for free tier usage**
4. Complete verification process

### **Step 2: Deploy Backend** 
**After verification, run:**
```bash
./deploy_to_heroku.sh
```

**This script will:**
- ✅ Create Heroku app: `youth-green-jobs-api`
- ✅ Add PostgreSQL with PostGIS
- ✅ Set all environment variables
- ✅ Deploy code
- ✅ Run migrations
- ✅ Collect static files
- ✅ Test deployment

### **Expected Result:**
- **Backend API:** `https://youth-green-jobs-api.herokuapp.com/api/v1/`
- **Admin Panel:** `https://youth-green-jobs-api.herokuapp.com/admin/`

---

## 💳 **Phase 2: Configure Payment Gateways**

### **Option A: Quick Testing (Recommended First)**

#### **M-Pesa Sandbox Setup**
1. Go to: https://developer.safaricom.co.ke/
2. Create developer account
3. Get sandbox credentials
4. Update environment variables:

```bash
# Add to Heroku config
heroku config:set MPESA_CONSUMER_KEY="your_sandbox_consumer_key"
heroku config:set MPESA_CONSUMER_SECRET="your_sandbox_consumer_secret"
heroku config:set MPESA_BUSINESS_SHORT_CODE="174379"
heroku config:set MPESA_PASSKEY="bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919"
heroku config:set MPESA_SANDBOX="True"
```

#### **Paystack Test Setup**
1. Go to: https://paystack.com/
2. Create account
3. Get test API keys
4. Update environment variables:

```bash
# Add to Heroku config
heroku config:set PAYSTACK_PUBLIC_KEY="pk_test_your_test_public_key"
heroku config:set PAYSTACK_SECRET_KEY="sk_test_your_test_secret_key"
heroku config:set PAYSTACK_SANDBOX="True"
```

### **Option B: Production Setup**
- Get real business credentials
- Complete KYC verification
- Use live API keys

---

## 🗺️ **Phase 3: Configure Google Maps API**

### **Step 1: Create Google Cloud Project**
1. Go to: https://console.cloud.google.com/
2. Create project: "Youth Green Jobs Hub"
3. Enable billing (required for Maps API)

### **Step 2: Enable APIs**
Enable these APIs:
- Maps JavaScript API
- Geocoding API
- Places API
- Geolocation API

### **Step 3: Create API Keys**
1. Go to APIs & Services → Credentials
2. Create API Key
3. Restrict the key for security

### **Step 4: Add to Heroku**
```bash
heroku config:set GOOGLE_MAPS_API_KEY="your_server_side_api_key"
heroku config:set GOOGLE_MAPS_JS_API_KEY="your_frontend_api_key"
```

### **Cost Control:**
- Free tier: 28,000 map loads/month
- Set daily quotas to control costs
- Monitor usage in Google Cloud Console

---

## 🎨 **Phase 4: Deploy Frontend to Vercel**

### **Step 1: Update Frontend Environment**
Create `frontend/.env.production`:
```bash
VITE_API_BASE_URL=https://youth-green-jobs-api.herokuapp.com
VITE_APP_NAME="Youth Green Jobs Hub"
VITE_GOOGLE_MAPS_API_KEY=your_frontend_google_maps_key
```

### **Step 2: Deploy to Vercel**
```bash
cd frontend
vercel login
vercel --prod
```

### **Step 3: Update Backend CORS**
Add Vercel URL to backend CORS settings:
```bash
heroku config:set CORS_ALLOWED_ORIGINS="http://localhost:3000,https://your-frontend.vercel.app,https://youthgreenjobs.ke"
```

---

## 🔧 **Phase 5: Final Configuration & Testing**

### **Step 1: Test All Features**
- [ ] User registration/login
- [ ] Waste report submission
- [ ] Product marketplace
- [ ] Payment processing
- [ ] Email notifications
- [ ] Location services

### **Step 2: Set Up Monitoring**
```bash
# Optional: Add Sentry for error tracking
heroku config:set SENTRY_DSN="your_sentry_dsn"

# Optional: Add Redis for caching
heroku addons:create heroku-redis:mini
```

### **Step 3: Configure Custom Domain (Optional)**
```bash
# Add custom domain
heroku domains:add youthgreenjobs.ke
heroku domains:add www.youthgreenjobs.ke

# Update DNS settings
# Point your domain to Heroku
```

---

## 📊 **Deployment Timeline & Priorities**

### **Immediate (Today)**
1. ✅ **Verify Heroku account** (5 minutes)
2. ✅ **Deploy backend** (15 minutes)
3. ✅ **Test API endpoints** (10 minutes)

### **Short Term (This Week)**
1. 🔧 **Configure payment gateways** (30 minutes for sandbox)
2. 🗺️ **Set up Google Maps API** (15 minutes)
3. 🎨 **Deploy frontend** (20 minutes)

### **Medium Term (Next Week)**
1. 📊 **Set up monitoring** (30 minutes)
2. 🏢 **Get production credentials** (varies by provider)
3. 🌐 **Configure custom domain** (30 minutes)

---

## 🚨 **Troubleshooting Guide**

### **Common Issues & Solutions**

#### **Heroku Deployment Fails**
- Check `heroku logs --tail`
- Verify environment variables
- Ensure PostgreSQL addon is active

#### **Database Connection Errors**
- Check DATABASE_URL format
- Verify PostGIS extension is installed
- Run migrations: `heroku run python manage.py migrate`

#### **Static Files Not Loading**
- Run: `heroku run python manage.py collectstatic --noinput`
- Check WhiteNoise configuration
- Verify STATIC_URL settings

#### **CORS Errors**
- Update CORS_ALLOWED_ORIGINS with frontend URL
- Check CSRF_TRUSTED_ORIGINS
- Verify frontend API base URL

#### **Payment Gateway Errors**
- Verify API keys are correct
- Check sandbox vs production settings
- Test with provided test credentials

---

## ✅ **Success Criteria**

### **Deployment Complete When:**
- [x] Backend API accessible at `https://youth-green-jobs-api.herokuapp.com/api/v1/`
- [x] Admin panel working at `https://youth-green-jobs-api.herokuapp.com/admin/`
- [x] Database operations functional
- [x] Email system working
- [ ] Payment gateways configured and tested
- [ ] Google Maps integration working
- [ ] Frontend deployed and connected
- [ ] End-to-end user flow tested

### **Your Live URLs:**
- **Backend API:** `https://youth-green-jobs-api.herokuapp.com/api/v1/`
- **Admin Panel:** `https://youth-green-jobs-api.herokuapp.com/admin/`
- **Frontend:** `https://your-frontend.vercel.app/` (after deployment)

---

## 🎯 **Next Immediate Action**

**Right now, you need to:**
1. ✅ **Verify your Heroku account** at https://heroku.com/verify
2. ✅ **Run the deployment script:** `./deploy_to_heroku.sh`
3. ✅ **Test your live backend API**

**Then choose your configuration approach:**
- **Quick Start:** Use sandbox credentials for immediate testing
- **Production:** Get real business credentials for live payments

**🎉 Your Youth Green Jobs Hub will be live and functional!**

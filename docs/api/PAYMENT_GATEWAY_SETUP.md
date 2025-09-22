# 💳 Payment Gateway & API Setup Guide

## 🚀 **Quick Setup Overview**

Your Youth Green Jobs Hub needs these API credentials for full functionality:

1. **🇰🇪 M-Pesa** - For Kenyan mobile payments
2. **🌍 Paystack** - For card payments across Africa
3. **🗺️ Google Maps** - For location services
4. **☁️ AWS S3** - For file storage (optional)

---

## 📱 **1. M-Pesa Setup (Safaricom Kenya)**

### **Step 1: Get M-Pesa Developer Account**
1. Go to: https://developer.safaricom.co.ke/
2. Create account with your business details
3. Apply for M-Pesa API access

### **Step 2: Get Production Credentials**
After approval, you'll receive:
```bash
MPESA_CONSUMER_KEY=your_production_mpesa_consumer_key
MPESA_CONSUMER_SECRET=your_production_mpesa_consumer_secret
MPESA_BUSINESS_SHORT_CODE=your_production_short_code
MPESA_PASSKEY=your_production_mpesa_passkey
```

### **Step 3: For Testing (Sandbox)**
For immediate testing, use sandbox:
```bash
MPESA_CONSUMER_KEY=Ke64cGWZwtUkTVxthjAAlBMifiOnS3zgwQLLoBVGRLHJs4kv
MPESA_CONSUMER_SECRET=cAlHJM16AkWBIDnnOlAYQIqyG9FDmiBy4mAfXiOTAKfjPHlwAYIK7H72dMCocYLE
MPESA_BUSINESS_SHORT_CODE=174379
MPESA_PASSKEY=bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919
MPESA_SANDBOX=True
```

### **Step 4: Test Numbers (Sandbox)**
- **Test Phone:** 254708374149
- **Test Amount:** Any amount
- **PIN:** 1234

---

## 💳 **2. Paystack Setup**

### **Step 1: Create Paystack Account**
1. Go to: https://paystack.com/
2. Sign up with business details
3. Complete KYC verification

### **Step 2: Get API Keys**
1. Go to Settings → API Keys & Webhooks
2. Copy your keys:

**For Testing:**
```bash
PAYSTACK_PUBLIC_KEY=pk_test_your_test_public_key
PAYSTACK_SECRET_KEY=sk_test_your_test_secret_key
PAYSTACK_SANDBOX=True
```

**For Production:**
```bash
PAYSTACK_PUBLIC_KEY=pk_live_your_live_public_key
PAYSTACK_SECRET_KEY=sk_live_your_live_secret_key
PAYSTACK_SANDBOX=False
```

### **Step 3: Test Cards**
```
Visa: 4084084084084081
Mastercard: 5060666666666666666
Verve: 5061020000000000094
CVV: 408
PIN: 1234
```

---

## 🗺️ **3. Google Maps API Setup**

### **Step 1: Create Google Cloud Project**
1. Go to: https://console.cloud.google.com/
2. Create new project: "Youth Green Jobs Hub"
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
3. Restrict the key:
   - **Application restrictions:** HTTP referrers
   - **API restrictions:** Select the enabled APIs above

### **Step 4: Get Your Keys**
```bash
GOOGLE_MAPS_API_KEY=your_server_side_api_key
GOOGLE_MAPS_JS_API_KEY=your_frontend_api_key
```

### **Step 5: Set Usage Limits**
- Set daily quotas to control costs
- Start with 1000 requests/day
- Monitor usage in Google Cloud Console

---

## ☁️ **4. AWS S3 Setup (Optional)**

### **Step 1: Create AWS Account**
1. Go to: https://aws.amazon.com/
2. Create account
3. Set up billing

### **Step 2: Create S3 Bucket**
1. Go to S3 service
2. Create bucket: `youth-green-jobs-media`
3. Set region: `us-east-1`
4. Enable public read access

### **Step 3: Create IAM User**
1. Go to IAM service
2. Create user: `youth-green-jobs-s3`
3. Attach policy: `AmazonS3FullAccess`
4. Generate access keys

### **Step 4: Get Credentials**
```bash
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_STORAGE_BUCKET_NAME=youth-green-jobs-media
```

---

## 🔧 **Quick Start: Testing Mode**

For immediate testing, use these sandbox credentials:

### **M-Pesa Sandbox**
```bash
MPESA_CONSUMER_KEY=your_sandbox_key
MPESA_CONSUMER_SECRET=your_sandbox_secret
MPESA_BUSINESS_SHORT_CODE=174379
MPESA_PASSKEY=bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919
MPESA_SANDBOX=True
```

### **Paystack Test**
```bash
PAYSTACK_PUBLIC_KEY=pk_test_your_test_key
PAYSTACK_SECRET_KEY=sk_test_your_test_key
PAYSTACK_SANDBOX=True
```

### **Google Maps (Free Tier)**
```bash
GOOGLE_MAPS_API_KEY=your_api_key_with_restrictions
GOOGLE_MAPS_JS_API_KEY=your_frontend_api_key
```

---

## 📋 **Next Steps**

1. **Choose your approach:**
   - 🚀 **Quick Start:** Use sandbox/test credentials
   - 🏢 **Production:** Get real business credentials

2. **Update environment variables**
3. **Test payments in your app**
4. **Monitor usage and costs**

**Ready to configure? Let me know which service you want to set up first!** 🎯

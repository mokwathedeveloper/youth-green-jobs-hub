# 🔧 Frontend Debugging Guide - Add to Cart & Place Order Issues

## 🎯 **ISSUE SUMMARY**
The backend order creation functionality has been fixed, but the frontend may still have integration issues. Here's a comprehensive debugging guide.

## ✅ **BACKEND FIXES COMPLETED**
1. **Order Creation Serializer** - Fixed validation issues
2. **Database Constraints** - Added default values
3. **API Endpoints** - All working correctly
4. **Component Integration** - Verified working

## 🔍 **FRONTEND DEBUGGING STEPS**

### **Step 1: Check Browser Console**
1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Look for JavaScript errors when:
   - Clicking "Add to Cart" button
   - Clicking "Place Order" button
4. Common errors to look for:
   ```
   - Network request failed
   - 401 Unauthorized
   - CORS policy error
   - Token expired
   ```

### **Step 2: Check Network Requests**
1. Open DevTools → **Network** tab
2. Try adding a product to cart
3. Look for the request to: `/api/v1/products/cart/add/`
4. Check:
   - **Status Code**: Should be 200/201
   - **Request Headers**: Should include `Authorization: Bearer <token>`
   - **Request Body**: Should have `product_id` and `quantity`
   - **Response**: Should return cart item data

### **Step 3: Check Authentication**
1. Open DevTools → **Application** tab → **Local Storage**
2. Look for `auth_tokens` key
3. Verify it contains valid JWT tokens:
   ```json
   {
     "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
     "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
   }
   ```
4. If missing or expired, try logging out and back in

### **Step 4: Test API Endpoints Manually**

#### **Test Add to Cart:**
```bash
curl -X POST "https://youth-green-jobs-hub.onrender.com/api/v1/products/cart/add/" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "product_id": "PRODUCT_UUID_HERE",
    "quantity": 1
  }'
```

#### **Test Create Order:**
```bash
curl -X POST "https://youth-green-jobs-hub.onrender.com/api/v1/products/orders/create/" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "payment_method": "credits",
    "delivery_address": "123 Test Street",
    "delivery_county": "Nairobi",
    "delivery_phone": "+254712345678",
    "items": [
      {
        "product_id": "PRODUCT_UUID_HERE",
        "quantity": 1
      }
    ]
  }'
```

## 🐛 **COMMON FRONTEND ISSUES & FIXES**

### **Issue 1: "Add to Cart" Button Not Working**

**Symptoms:**
- Button click does nothing
- No network request in DevTools
- No console errors

**Possible Causes & Fixes:**
1. **Event Handler Not Attached**
   - Check if `onClick` handler is properly set
   - Verify component is not disabled

2. **Product Out of Stock**
   - Check `product.is_in_stock` property
   - Button should be disabled if out of stock

3. **Loading State**
   - Check if button is stuck in loading state
   - Verify loading state is reset after API call

### **Issue 2: "Place Order" Button Not Working**

**Symptoms:**
- Form submission fails
- Validation errors
- Network request fails

**Possible Causes & Fixes:**
1. **Form Validation Errors**
   - Check required fields are filled
   - Verify form schema validation

2. **Empty Cart**
   - Ensure cart has items before checkout
   - Check cart state in React DevTools

3. **API Request Format**
   - Verify request body matches expected format
   - Check item structure: `{product_id, quantity}`

### **Issue 3: Authentication Errors**

**Symptoms:**
- 401 Unauthorized responses
- "Token not valid" errors

**Fixes:**
1. **Check Token Storage**
   ```javascript
   const tokens = localStorage.getItem('auth_tokens');
   console.log('Stored tokens:', tokens);
   ```

2. **Verify Token Format**
   ```javascript
   // Should be sent as:
   headers: {
     'Authorization': `Bearer ${accessToken}`
   }
   ```

3. **Handle Token Refresh**
   - Check if refresh logic is working
   - Verify refresh token is valid

## 🔧 **FRONTEND CODE CHECKS**

### **Check API Configuration**
File: `frontend/src/config/index.ts` or similar
```typescript
// Verify API base URL is correct
export const API_CONFIG = {
  BASE_URL: 'https://youth-green-jobs-hub.onrender.com/api/v1',
  // ...
};
```

### **Check Add to Cart Implementation**
File: `frontend/src/services/api.ts`
```typescript
addToCart: async (data: AddToCartData): Promise<CartItem> => {
  const response = await apiClient.post('/products/cart/add/', data);
  return response.data;
},
```

### **Check Order Creation Implementation**
File: `frontend/src/services/api.ts`
```typescript
createOrder: async (data: OrderCreateData): Promise<Order> => {
  const response = await apiClient.post('/products/orders/create/', data);
  return response.data;
},
```

## 🚀 **QUICK FIXES TO TRY**

### **Fix 1: Clear Browser Cache**
1. Open DevTools → **Application** tab
2. Click **Clear Storage**
3. Refresh the page and try again

### **Fix 2: Re-login**
1. Logout from the application
2. Clear localStorage
3. Login again with fresh tokens

### **Fix 3: Check Service Status**
1. Visit: https://youth-green-jobs-hub.onrender.com/api/v1/products/products/
2. Should return JSON with products list
3. If 500 error, backend service needs restart

### **Fix 4: Test with Different Product**
1. Try adding different products to cart
2. Some products might have stock issues
3. Check product `is_active` and `is_in_stock` status

## 📱 **MOBILE DEBUGGING**
If testing on mobile:
1. Use remote debugging tools
2. Check for touch event issues
3. Verify responsive design doesn't hide buttons

## 🔍 **ADVANCED DEBUGGING**

### **React DevTools**
1. Install React DevTools extension
2. Check component state and props
3. Verify cart state updates after API calls

### **Redux DevTools** (if using Redux)
1. Check action dispatching
2. Verify state updates
3. Look for middleware errors

### **Network Throttling**
1. Test with slow network in DevTools
2. Check loading states and timeouts
3. Verify error handling for network failures

## 📞 **GETTING HELP**
If issues persist:
1. **Provide Console Errors**: Copy exact error messages
2. **Share Network Requests**: Screenshot of failed requests
3. **Include Browser Info**: Chrome/Firefox version
4. **Test Environment**: Desktop/Mobile, OS version

## ✅ **SUCCESS INDICATORS**
When everything works correctly:
1. **Add to Cart**: Product appears in cart, counter updates
2. **Place Order**: Redirects to order confirmation page
3. **Network Requests**: All return 200/201 status codes
4. **No Console Errors**: Clean browser console

---

**Remember**: The backend is working correctly. Most issues will be in frontend authentication, API calls, or state management.

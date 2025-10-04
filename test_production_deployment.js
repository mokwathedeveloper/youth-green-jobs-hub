// Production Deployment Test Script
// Tests communication between Vercel frontend and Render backend

const axios = require('axios');

const BACKEND_URL = 'https://youth-green-jobs-hub.onrender.com';
const FRONTEND_URLS = [
    'https://frontend-three-ashy-66.vercel.app',
    'https://frontend-1aygxoocr-moracios-projects.vercel.app',
    'https://frontend-jjlupadi3-moracios-projects.vercel.app'
];

async function testBackendAPI() {
    console.log('🔍 Testing Backend API on Render...\n');
    
    try {
        // Test API root
        console.log('1. Testing API Root...');
        const rootResponse = await axios.get(`${BACKEND_URL}/api/v1/`);
        console.log('✅ API Root Status:', rootResponse.status);
        console.log('✅ API Version:', rootResponse.data.version);
        console.log('✅ API Status:', rootResponse.data.status);
        
        // Test products endpoint
        console.log('\n2. Testing Products Endpoint...');
        const productsResponse = await axios.get(`${BACKEND_URL}/api/v1/products/products/`);
        console.log('✅ Products Status:', productsResponse.status);
        console.log('✅ Total Products:', productsResponse.data.count);
        console.log('✅ Products Returned:', productsResponse.data.results.length);
        
        if (productsResponse.data.results.length > 0) {
            const firstProduct = productsResponse.data.results[0];
            console.log('✅ Sample Product:', {
                name: firstProduct.name,
                price: firstProduct.price,
                vendor: firstProduct.vendor?.business_name || 'No vendor'
            });
        } else {
            console.log('⚠️ No products found - deployment might still be in progress');
        }
        
        // Test categories endpoint
        console.log('\n3. Testing Categories Endpoint...');
        const categoriesResponse = await axios.get(`${BACKEND_URL}/api/v1/products/categories/`);
        console.log('✅ Categories Status:', categoriesResponse.status);
        console.log('✅ Total Categories:', categoriesResponse.data.count || categoriesResponse.data.length);
        
        // Test vendors endpoint
        console.log('\n4. Testing Vendors Endpoint...');
        const vendorsResponse = await axios.get(`${BACKEND_URL}/api/v1/products/vendors/`);
        console.log('✅ Vendors Status:', vendorsResponse.status);
        console.log('✅ Total Vendors:', vendorsResponse.data.count || vendorsResponse.data.length);
        
        return {
            status: 'success',
            products: productsResponse.data.count,
            categories: categoriesResponse.data.count || categoriesResponse.data.length,
            vendors: vendorsResponse.data.count || vendorsResponse.data.length
        };
        
    } catch (error) {
        console.error('❌ Backend API Test Failed:');
        if (error.response) {
            console.error(`- Status: ${error.response.status}`);
            console.error(`- Message: ${error.response.data?.message || error.message}`);
        } else if (error.request) {
            console.error('- No response received from backend');
            console.error('- Backend might be down or redeploying');
        } else {
            console.error(`- Error: ${error.message}`);
        }
        return { status: 'failed', error: error.message };
    }
}

async function testFrontendAccess() {
    console.log('\n🌐 Testing Frontend Access on Vercel...\n');
    
    for (let i = 0; i < FRONTEND_URLS.length; i++) {
        const url = FRONTEND_URLS[i];
        try {
            console.log(`${i + 1}. Testing ${url}...`);
            const response = await axios.get(url, { timeout: 10000 });
            console.log(`✅ Frontend ${i + 1} Status:`, response.status);
            
            // Check if it contains the app title
            if (response.data.includes('Youth Green Jobs Hub')) {
                console.log(`✅ Frontend ${i + 1} Content: Valid React app loaded`);
            } else {
                console.log(`⚠️ Frontend ${i + 1} Content: Unexpected content`);
            }
            
        } catch (error) {
            console.error(`❌ Frontend ${i + 1} Failed:`, error.message);
        }
    }
}

async function testCORSConfiguration() {
    console.log('\n🔒 Testing CORS Configuration...\n');
    
    try {
        // Test CORS headers
        const response = await axios.options(`${BACKEND_URL}/api/v1/products/products/`, {
            headers: {
                'Origin': FRONTEND_URLS[0],
                'Access-Control-Request-Method': 'GET',
                'Access-Control-Request-Headers': 'Content-Type'
            }
        });
        
        console.log('✅ CORS Preflight Status:', response.status);
        console.log('✅ CORS Headers Present:', !!response.headers['access-control-allow-origin']);
        
    } catch (error) {
        console.log('⚠️ CORS Test Note: Preflight might not be required for simple requests');
    }
}

async function runFullTest() {
    console.log('🚀 Youth Green Jobs Hub - Production Deployment Test');
    console.log('=' .repeat(60));
    console.log(`Backend URL: ${BACKEND_URL}`);
    console.log(`Frontend URLs: ${FRONTEND_URLS.length} configured`);
    console.log('=' .repeat(60));
    
    // Test backend
    const backendResult = await testBackendAPI();
    
    // Test frontend
    await testFrontendAccess();
    
    // Test CORS
    await testCORSConfiguration();
    
    // Summary
    console.log('\n📊 Test Summary');
    console.log('=' .repeat(40));
    
    if (backendResult.status === 'success') {
        console.log('✅ Backend API: Working');
        console.log(`✅ Products Available: ${backendResult.products}`);
        console.log(`✅ Categories Available: ${backendResult.categories}`);
        console.log(`✅ Vendors Available: ${backendResult.vendors}`);
        
        if (backendResult.products > 0) {
            console.log('\n🎉 SUCCESS: Backend has sample data and is ready!');
            console.log('🔗 Frontend should be able to fetch and display products');
        } else {
            console.log('\n⏳ WAITING: Backend is working but sample data not yet populated');
            console.log('💡 Render deployment might still be in progress');
            console.log('💡 Try running this test again in 2-3 minutes');
        }
    } else {
        console.log('❌ Backend API: Failed');
        console.log('🔧 Check Render deployment logs for issues');
    }
    
    console.log('\n🔗 Quick Links:');
    console.log(`📱 Frontend: ${FRONTEND_URLS[0]}`);
    console.log(`🔧 Backend API: ${BACKEND_URL}/api/v1/`);
    console.log(`📊 Products API: ${BACKEND_URL}/api/v1/products/products/`);
}

// Run the test
runFullTest().catch(console.error);

#!/usr/bin/env node
/**
 * Test script to verify frontend configuration and API endpoints
 */
const axios = require('axios');

async function testFrontendConfig() {
    console.log('🔍 Testing Frontend Configuration');
    console.log('=' * 50);
    
    const frontendUrl = 'https://frontend-three-ashy-66.vercel.app';
    const expectedBackendUrl = 'https://youth-green-jobs-hub.onrender.com';
    
    try {
        // Test if frontend loads
        console.log('1. Testing frontend accessibility...');
        const frontendResponse = await axios.get(frontendUrl);
        console.log(`✅ Frontend Status: ${frontendResponse.status}`);
        
        // Check if frontend HTML contains the correct API URL
        const htmlContent = frontendResponse.data;
        if (htmlContent.includes('youth-green-jobs-hub.onrender.com')) {
            console.log('✅ Frontend contains production backend URL');
        } else if (htmlContent.includes('localhost:8000')) {
            console.log('❌ Frontend still contains localhost:8000 URL');
        } else {
            console.log('⚠️  Cannot determine backend URL from frontend HTML');
        }
        
        // Test backend API directly
        console.log('\n2. Testing backend API...');
        const backendResponse = await axios.get(`${expectedBackendUrl}/api/v1/`);
        console.log(`✅ Backend Status: ${backendResponse.status}`);
        console.log(`✅ Backend Version: ${backendResponse.data.version}`);
        
        // Test products endpoint
        console.log('\n3. Testing products endpoint...');
        const productsResponse = await axios.get(`${expectedBackendUrl}/api/v1/products/products/`);
        console.log(`✅ Products Status: ${productsResponse.status}`);
        console.log(`📦 Products Count: ${productsResponse.data.count}`);
        
        if (productsResponse.data.count === 0) {
            console.log('⚠️  No products found - this explains why frontend shows empty');
            console.log('💡 The frontend is correctly configured, but backend database is empty');
        } else {
            console.log('✅ Products are available - frontend should display them');
        }
        
        // Test CORS
        console.log('\n4. Testing CORS configuration...');
        try {
            const corsResponse = await axios.options(`${expectedBackendUrl}/api/v1/products/products/`, {
                headers: {
                    'Origin': frontendUrl,
                    'Access-Control-Request-Method': 'GET'
                }
            });
            console.log(`✅ CORS Status: ${corsResponse.status}`);
        } catch (corsError) {
            console.log(`⚠️  CORS Test: ${corsError.response?.status || 'Failed'}`);
        }
        
    } catch (error) {
        console.error(`❌ Test Error: ${error.message}`);
    }
}

async function testDirectAPICall() {
    console.log('\n🔗 Testing Direct API Calls');
    console.log('=' * 30);
    
    const endpoints = [
        '/api/v1/',
        '/api/v1/products/products/',
        '/api/v1/products/categories/',
        '/api/v1/products/vendors/'
    ];
    
    for (const endpoint of endpoints) {
        try {
            const url = `https://youth-green-jobs-hub.onrender.com${endpoint}`;
            const response = await axios.get(url);
            console.log(`✅ ${endpoint}: ${response.status} (${response.data.count || 'OK'})`);
        } catch (error) {
            console.log(`❌ ${endpoint}: ${error.response?.status || 'Failed'}`);
        }
    }
}

async function main() {
    console.log('🚀 Youth Green Jobs Hub - Frontend Configuration Test');
    console.log('=' * 60);
    
    await testFrontendConfig();
    await testDirectAPICall();
    
    console.log('\n📊 Summary');
    console.log('=' * 20);
    console.log('If products count is 0, the issue is backend database population');
    console.log('If products count > 0, the issue might be frontend caching or build');
    console.log('\n🔗 Test URLs:');
    console.log('Frontend: https://frontend-three-ashy-66.vercel.app/dashboard/products');
    console.log('Backend API: https://youth-green-jobs-hub.onrender.com/api/v1/products/products/');
}

main().catch(console.error);

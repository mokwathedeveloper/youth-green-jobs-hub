#!/usr/bin/env node

/**
 * Integration Test Script
 * Tests the communication between frontend and backend
 */

const axios = require('axios');

// Configuration
const BACKEND_URL = 'http://127.0.0.1:8000';
const FRONTEND_URL = 'http://localhost:5173';

async function testBackendHealth() {
  console.log('🔍 Testing Backend Health...');
  
  try {
    // Test API root endpoint
    const response = await axios.get(`${BACKEND_URL}/api/v1/`);
    console.log('✅ Backend API Root:', response.status, response.statusText);
    console.log('📋 Available Endpoints:', Object.keys(response.data.endpoints));
    
    return true;
  } catch (error) {
    console.error('❌ Backend Health Check Failed:', error.message);
    return false;
  }
}

async function testFrontendHealth() {
  console.log('\n🔍 Testing Frontend Health...');
  
  try {
    const response = await axios.get(FRONTEND_URL, {
      timeout: 5000,
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    });
    console.log('✅ Frontend Server:', response.status, response.statusText);
    
    return true;
  } catch (error) {
    console.error('❌ Frontend Health Check Failed:', error.message);
    return false;
  }
}

async function testCORS() {
  console.log('\n🔍 Testing CORS Configuration...');
  
  try {
    // Test preflight request
    const response = await axios.options(`${BACKEND_URL}/api/v1/`, {
      headers: {
        'Origin': FRONTEND_URL,
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type,Authorization'
      }
    });
    
    console.log('✅ CORS Preflight:', response.status, response.statusText);
    
    // Check CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': response.headers['access-control-allow-origin'],
      'Access-Control-Allow-Methods': response.headers['access-control-allow-methods'],
      'Access-Control-Allow-Headers': response.headers['access-control-allow-headers']
    };
    
    console.log('📋 CORS Headers:', corsHeaders);
    
    return true;
  } catch (error) {
    console.error('❌ CORS Test Failed:', error.message);
    return false;
  }
}

async function testAPIEndpoints() {
  console.log('\n🔍 Testing API Endpoints...');
  
  const endpoints = [
    '/api/v1/',
    '/api/v1/auth/register/',
    '/api/v1/waste/categories/',
    '/api/v1/products/categories/'
  ];
  
  for (const endpoint of endpoints) {
    try {
      const response = await axios.get(`${BACKEND_URL}${endpoint}`, {
        validateStatus: (status) => status < 500 // Accept 4xx as valid responses
      });
      
      if (response.status === 200) {
        console.log(`✅ ${endpoint}: ${response.status} ${response.statusText}`);
      } else if (response.status === 401) {
        console.log(`🔐 ${endpoint}: ${response.status} (Authentication Required - Expected)`);
      } else if (response.status === 405) {
        console.log(`📝 ${endpoint}: ${response.status} (Method Not Allowed - Expected for POST endpoints)`);
      } else {
        console.log(`⚠️  ${endpoint}: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error(`❌ ${endpoint}: ${error.message}`);
    }
  }
}

async function testEnvironmentConfiguration() {
  console.log('\n🔍 Testing Environment Configuration...');
  
  try {
    // Test backend configuration
    const backendResponse = await axios.get(`${BACKEND_URL}/api/v1/`);
    const backendData = backendResponse.data;
    
    console.log('✅ Backend Configuration:');
    console.log(`   - Platform: ${backendData.message}`);
    console.log(`   - Version: ${backendData.version}`);
    console.log(`   - Support Email: ${backendData.support.email}`);
    
    return true;
  } catch (error) {
    console.error('❌ Environment Configuration Test Failed:', error.message);
    return false;
  }
}

async function runIntegrationTests() {
  console.log('🚀 Starting Integration Tests for Youth Green Jobs Hub\n');
  console.log('=' .repeat(60));
  
  const results = {
    backend: await testBackendHealth(),
    frontend: await testFrontendHealth(),
    cors: await testCORS(),
    environment: await testEnvironmentConfiguration()
  };
  
  await testAPIEndpoints();
  
  console.log('\n' + '=' .repeat(60));
  console.log('📊 Integration Test Results:');
  console.log('=' .repeat(60));
  
  Object.entries(results).forEach(([test, passed]) => {
    const status = passed ? '✅ PASSED' : '❌ FAILED';
    console.log(`${test.toUpperCase().padEnd(15)}: ${status}`);
  });
  
  const allPassed = Object.values(results).every(result => result);
  
  if (allPassed) {
    console.log('\n🎉 All integration tests passed! Frontend and Backend are communicating properly.');
    console.log('\n📋 Next Steps:');
    console.log('   1. Frontend is running on: http://localhost:5173/');
    console.log('   2. Backend API is running on: http://127.0.0.1:8000/api/v1/');
    console.log('   3. You can now test user registration, login, and other features');
    console.log('   4. Check the browser console for any frontend errors');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the configuration and try again.');
  }
  
  console.log('\n' + '=' .repeat(60));
}

// Run the tests
runIntegrationTests().catch(console.error);

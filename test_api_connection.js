// Simple test script to verify API connection
const axios = require('axios');

const API_BASE_URL = 'http://localhost:8000/api/v1';

async function testProductsAPI() {
    try {
        console.log('Testing Products API...');
        
        // Test products endpoint
        const response = await axios.get(`${API_BASE_URL}/products/products/`);
        console.log('✅ Products API Response:');
        console.log(`- Status: ${response.status}`);
        console.log(`- Total Products: ${response.data.count}`);
        console.log(`- Products Returned: ${response.data.results.length}`);
        
        if (response.data.results.length > 0) {
            const firstProduct = response.data.results[0];
            console.log('- First Product:', {
                id: firstProduct.id,
                name: firstProduct.name,
                price: firstProduct.price,
                vendor: firstProduct.vendor.business_name
            });
        }
        
        // Test categories endpoint
        const categoriesResponse = await axios.get(`${API_BASE_URL}/products/categories/`);
        console.log('\n✅ Categories API Response:');
        console.log(`- Status: ${categoriesResponse.status}`);
        console.log(`- Total Categories: ${categoriesResponse.data.length}`);
        
        if (categoriesResponse.data.length > 0) {
            console.log('- Categories:', categoriesResponse.data.map(cat => cat.name));
        }
        
        console.log('\n🎉 All API tests passed! Backend is working correctly.');
        
    } catch (error) {
        console.error('❌ API Test Failed:');
        if (error.response) {
            console.error(`- Status: ${error.response.status}`);
            console.error(`- Message: ${error.response.data?.message || error.message}`);
        } else if (error.request) {
            console.error('- No response received from server');
            console.error('- Make sure the backend server is running on http://localhost:8000');
        } else {
            console.error(`- Error: ${error.message}`);
        }
    }
}

// Run the test
testProductsAPI();

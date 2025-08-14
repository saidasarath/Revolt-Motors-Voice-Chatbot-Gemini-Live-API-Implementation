// Simple test script to verify server functionality
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';

async function testServer() {
    console.log('🧪 Testing Revolt Motors Voice Chatbot Server...\n');
    
    try {
        // Test 1: Check if server is running
        console.log('1️⃣ Testing server health endpoint...');
        const healthResponse = await fetch(`${BASE_URL}/health`);
        
        if (healthResponse.ok) {
            const healthData = await healthResponse.json();
            console.log('✅ Health check passed');
            console.log('   Status:', healthData.status);
            console.log('   Gemini API Key:', healthData.gemini_api_key);
            console.log('   Model:', healthData.model);
        } else {
            console.log('❌ Health check failed:', healthResponse.status);
        }
        
        // Test 2: Check main page
        console.log('\n2️⃣ Testing main page...');
        const mainResponse = await fetch(`${BASE_URL}/`);
        
        if (mainResponse.ok) {
            console.log('✅ Main page accessible');
            console.log('   Content-Type:', mainResponse.headers.get('content-type'));
        } else {
            console.log('❌ Main page failed:', mainResponse.status);
        }
        
        // Test 3: Check static files
        console.log('\n3️⃣ Testing static files...');
        const cssResponse = await fetch(`${BASE_URL}/styles.css`);
        const jsResponse = await fetch(`${BASE_URL}/script.js`);
        
        if (cssResponse.ok && jsResponse.ok) {
            console.log('✅ Static files accessible');
        } else {
            console.log('❌ Static files failed');
        }
        
        console.log('\n🎉 Server test completed successfully!');
        console.log('\n📱 Next steps:');
        console.log('   1. Create .env file with your Gemini API key');
        console.log('   2. Open http://localhost:3000 in your browser');
        console.log('   3. Grant microphone permissions');
        console.log('   4. Start testing voice interactions!');
        
    } catch (error) {
        console.log('❌ Server test failed:', error.message);
        console.log('\n💡 Make sure the server is running with: npm start');
    }
}

// Run the test
testServer();

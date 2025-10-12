#!/usr/bin/env node

/**
 * Local Cron Job Tester
 * 
 * This script simulates the Vercel cron job locally for testing
 * Run with: node test-cron-local.js
 */

const https = require('https');
const http = require('http');

const BASE_URL = 'http://localhost:3000';
const CRON_ENDPOINT = '/api/cron/send';

async function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https://');
    const client = isHttps ? https : http;
    
    const req = client.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });
    
    req.on('error', reject);
    req.end();
  });
}

async function testCronJob() {
  console.log('🚀 Testing Local Cron Job...\n');
  
  // Test 1: Check if server is running
  console.log('1. Checking if local server is running...');
  try {
    const healthResponse = await makeRequest(`${BASE_URL}/api/health`);
    if (healthResponse.status === 200) {
      console.log('✅ Local server is running');
      console.log('📊 Health check:', healthResponse.data);
    } else {
      console.log('❌ Local server health check failed:', healthResponse.status);
      return;
    }
  } catch (error) {
    console.log('❌ Cannot connect to local server. Make sure to run: npm run dev');
    console.log('   Error:', error.message);
    return;
  }
  
  console.log('\n2. Testing cron job endpoint...');
  
  // Test 2: Manual trigger (should work)
  console.log('   Testing manual trigger...');
  try {
    const manualResponse = await makeRequest(`${BASE_URL}${CRON_ENDPOINT}?source=manual`);
    console.log('   Status:', manualResponse.status);
    console.log('   Response:', JSON.stringify(manualResponse.data, null, 2));
    
    if (manualResponse.status === 200) {
      console.log('✅ Manual trigger works');
    } else {
      console.log('❌ Manual trigger failed');
    }
  } catch (error) {
    console.log('❌ Manual trigger error:', error.message);
  }
  
  // Test 3: Simulate Vercel cron (should work with our fix)
  console.log('\n   Testing simulated Vercel cron...');
  try {
    const vercelResponse = await makeRequest(`${BASE_URL}${CRON_ENDPOINT}?source=vercel-cron`, {
      headers: {
        'User-Agent': 'vercel-cron',
        'X-Vercel-Cron': '1'
      }
    });
    console.log('   Status:', vercelResponse.status);
    console.log('   Response:', JSON.stringify(vercelResponse.data, null, 2));
    
    if (vercelResponse.status === 200) {
      console.log('✅ Simulated Vercel cron works');
    } else {
      console.log('❌ Simulated Vercel cron failed');
    }
  } catch (error) {
    console.log('❌ Simulated Vercel cron error:', error.message);
  }
  
  // Test 4: Check user delivery status
  console.log('\n3. Checking user delivery status...');
  const testEmail = process.env.TEST_EMAIL || 'your-email@example.com';
  if (testEmail === 'your-email@example.com') {
    console.log('⚠️  Set TEST_EMAIL environment variable to test with real user:');
    console.log('   TEST_EMAIL=your-actual-email@example.com node test-cron-local.js');
  } else {
    try {
      const userResponse = await makeRequest(`${BASE_URL}/api/debug/user-delivery?email=${encodeURIComponent(testEmail)}`);
      console.log('   User Status:', userResponse.status);
      console.log('   User Data:', JSON.stringify(userResponse.data, null, 2));
    } catch (error) {
      console.log('❌ User delivery check error:', error.message);
    }
  }
  
  console.log('\n🎯 Next Steps:');
  console.log('1. If manual trigger works but Vercel cron fails, the issue is in Vercel configuration');
  console.log('2. If both work locally, deploy to Vercel and check the Function logs');
  console.log('3. Check Vercel dashboard > Functions > /api/cron/send for execution logs');
  console.log('4. Verify CRON_SECRET environment variable is set in Vercel');
}

// Run the test
testCronJob().catch(console.error);

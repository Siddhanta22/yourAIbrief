#!/usr/bin/env node

/**
 * Test User Creator
 * 
 * Creates a test user in the local database for testing cron functionality
 */

const https = require('https');
const http = require('http');

const BASE_URL = 'http://localhost:3000';

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
    
    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

async function createTestUser() {
  console.log('👤 Creating Test User for Cron Testing...\n');
  
  const testUser = {
    name: 'Test User',
    email: 'test@example.com',
    interests: ['AI', 'Machine Learning', 'Tech'],
    preferredSendTime: '8:00 AM',
    frequency: 'daily'
  };
  
  console.log('Creating user:', testUser);
  
  try {
    const response = await makeRequest(`${BASE_URL}/api/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testUser)
    });
    
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    if (response.status === 200 && response.data.success) {
      console.log('✅ Test user created successfully!');
      
      // Now test the cron job
      console.log('\n🧪 Testing cron job with new user...');
      const cronResponse = await makeRequest(`${BASE_URL}/api/cron/send?source=vercel-cron`, {
        headers: {
          'User-Agent': 'vercel-cron',
          'X-Vercel-Cron': '1'
        }
      });
      
      console.log('Cron Status:', cronResponse.status);
      console.log('Cron Response:', JSON.stringify(cronResponse.data, null, 2));
      
      if (cronResponse.data.sent > 0) {
        console.log('✅ Cron job successfully sent email to test user!');
      } else {
        console.log('⚠️  Cron job ran but no emails sent. Check user preferences.');
      }
      
    } else {
      console.log('❌ Failed to create test user');
    }
    
  } catch (error) {
    console.log('❌ Error creating test user:', error.message);
  }
}

// Run the test
createTestUser().catch(console.error);

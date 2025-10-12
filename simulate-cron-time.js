#!/usr/bin/env node

/**
 * Cron Time Simulator
 * 
 * This script simulates different times to test the cron logic
 * Run with: node simulate-cron-time.js
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
    req.end();
  });
}

function formatTime(date, timezone = 'UTC') {
  const options = {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  };
  return date.toLocaleTimeString('en-US', options);
}

async function simulateTimeConditions() {
  console.log('🕐 Simulating Cron Time Conditions\n');
  
  const now = new Date();
  console.log('Current time:', now.toISOString());
  console.log('Current UTC time:', formatTime(now, 'UTC'));
  console.log('Current local time:', formatTime(now, Intl.DateTimeFormat().resolvedOptions().timeZone));
  
  // Test different user time preferences
  const testTimes = [
    '6:00 AM',  // Should work (morning window)
    '7:00 AM',  // Should work (morning window)
    '8:00 AM',  // Should work (morning window)
    '9:00 AM',  // Should work (morning window)
    '10:00 AM', // Should work (morning window)
    '11:00 AM', // Should NOT work (outside window)
    '2:00 PM',  // Should NOT work (outside window)
    '8:00 PM',  // Should NOT work (outside window)
  ];
  
  console.log('\n📋 Testing User Time Preferences:');
  console.log('Morning window: 6:00 AM - 10:00 AM UTC');
  console.log('Cron runs at: 8:00 AM UTC daily\n');
  
  for (const testTime of testTimes) {
    const timeMatch = testTime.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!timeMatch) continue;
    
    const [, hour, minute, ampm] = timeMatch;
    let hour24 = parseInt(hour);
    if (ampm.toUpperCase() === 'PM' && hour24 !== 12) {
      hour24 += 12;
    } else if (ampm.toUpperCase() === 'AM' && hour24 === 12) {
      hour24 = 0;
    }
    
    const isMorningTime = hour24 >= 6 && hour24 <= 10;
    const status = isMorningTime ? '✅ WILL RECEIVE' : '❌ WILL SKIP';
    
    console.log(`${testTime.padEnd(10)} → ${status} (${hour24}:00 UTC)`);
  }
  
  // Test the actual cron endpoint
  console.log('\n🧪 Testing Cron Endpoint with Current Time...');
  
  try {
    const response = await makeRequest(`${BASE_URL}/api/cron/send?source=vercel-cron`, {
      headers: {
        'User-Agent': 'vercel-cron',
        'X-Vercel-Cron': '1'
      }
    });
    
    console.log('Status:', response.status);
    if (response.status === 200) {
      console.log('✅ Cron endpoint responded successfully');
      console.log('Response:', JSON.stringify(response.data, null, 2));
    } else {
      console.log('❌ Cron endpoint failed');
      console.log('Error:', response.data);
    }
  } catch (error) {
    console.log('❌ Cannot connect to cron endpoint:', error.message);
    console.log('Make sure to run: npm run dev');
  }
  
  console.log('\n💡 Tips:');
  console.log('1. Vercel cron runs at 8:00 AM UTC daily');
  console.log('2. Users with preferred times 6:00-10:00 AM UTC will receive emails');
  console.log('3. Check your user preferences match this window');
  console.log('4. Verify your user account is active and has interests set');
}

// Run the simulation
simulateTimeConditions().catch(console.error);

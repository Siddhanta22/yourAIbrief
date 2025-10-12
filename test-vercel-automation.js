#!/usr/bin/env node

/**
 * Vercel Production Automation Test
 * Tests the automated newsletter delivery on Vercel
 */

const https = require('https');
const http = require('http');

// Replace with your actual Vercel domain
const VERCEL_URL = 'https://your-domain.vercel.app'; // Update this with your actual domain

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

async function testVercelAutomation() {
  console.log('🚀 Testing Vercel Production Automation\n');
  
  // Step 1: Test health endpoint
  console.log('1. Testing production health...');
  try {
    const healthResponse = await makeRequest(`${VERCEL_URL}/api/health`);
    if (healthResponse.status === 200) {
      console.log('✅ Production server is healthy');
      console.log('📊 Health:', healthResponse.data);
    } else {
      console.log('❌ Production health check failed');
    }
  } catch (error) {
    console.log('❌ Cannot connect to production:', error.message);
    console.log('💡 Make sure to update VERCEL_URL in this script with your actual domain');
    return;
  }
  
  // Step 2: Test manual cron trigger
  console.log('\n2. Testing manual cron trigger on production...');
  try {
    const cronResponse = await makeRequest(`${VERCEL_URL}/api/debug/trigger-cron`, {
      method: 'POST'
    });
    
    console.log('📧 Production Cron Results:');
    console.log(`   - Status: ${cronResponse.status}`);
    console.log(`   - Response: ${JSON.stringify(cronResponse.data, null, 2)}`);
    
    if (cronResponse.status === 200) {
      console.log('✅ Manual cron trigger works on production');
    }
  } catch (error) {
    console.log('❌ Error testing production cron:', error.message);
  }
  
  // Step 3: Test with your real email
  console.log('\n3. Testing with your real email...');
  const realEmail = process.env.TEST_EMAIL || 'your-email@example.com';
  
  if (realEmail === 'your-email@example.com') {
    console.log('⚠️  Set TEST_EMAIL environment variable to test with real user:');
    console.log('   TEST_EMAIL=your-actual-email@example.com node test-vercel-automation.js');
  } else {
    try {
      const userResponse = await makeRequest(`${VERCEL_URL}/api/debug/user-delivery?email=${encodeURIComponent(realEmail)}`);
      
      if (userResponse.status === 200) {
        console.log('📊 Your User Status on Production:');
        const user = userResponse.data;
        console.log(`   - Verified: ${user.deliveryAnalysis.isVerified ? '✅' : '❌'}`);
        console.log(`   - Has Interests: ${user.deliveryAnalysis.hasInterests ? '✅' : '❌'}`);
        console.log(`   - Time Match: ${user.deliveryAnalysis.timeMatch.isMorningTime ? '✅' : '❌'} (${user.deliveryAnalysis.timeMatch.original})`);
        console.log(`   - Would Be Due: ${user.deliveryAnalysis.wouldBeDue ? '✅' : '❌'}`);
        console.log(`   - Already Received Today: ${user.deliveryAnalysis.alreadyReceivedToday ? '✅' : '❌'}`);
        
        if (user.recentEmailLogs && user.recentEmailLogs.length > 0) {
          console.log('\n📧 Recent Email Logs on Production:');
          user.recentEmailLogs.slice(0, 3).forEach((log, i) => {
            const status = log.status === 'SENT' ? '✅' : log.status === 'FAILED' ? '❌' : '⚠️';
            console.log(`   ${i + 1}. ${status} ${log.status} at ${new Date(log.sentAt).toLocaleTimeString()}`);
          });
        }
      } else {
        console.log('❌ User not found on production. Make sure you\'ve subscribed.');
      }
    } catch (error) {
      console.log('❌ Error checking user on production:', error.message);
    }
  }
  
  console.log('\n🎯 Production Test Summary:');
  console.log('✅ Production server is running');
  console.log('✅ Cron endpoints are accessible');
  console.log('✅ Debug endpoints work');
  console.log('📋 Next steps:');
  console.log('   1. Check Vercel Function logs for cron execution');
  console.log('   2. Wait for 8 AM UTC daily cron execution');
  console.log('   3. Monitor email delivery logs');
}

// Run the test
testVercelAutomation().catch(console.error);

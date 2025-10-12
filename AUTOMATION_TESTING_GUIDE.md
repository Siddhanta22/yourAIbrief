# 🤖 Automated Newsletter Delivery Testing Guide

## 🧪 **Local Testing (Development)**

### 1. **Basic Automation Test**
```bash
node test-automation.js
```
This will:
- Create a test user
- Check user status
- Test cron job manually
- Show email logs

### 2. **Manual Cron Trigger**
Visit in browser:
```
http://localhost:3000/api/debug/trigger-cron
```
Or use curl:
```bash
curl -X POST http://localhost:3000/api/debug/trigger-cron
```

### 3. **Check User Status**
Visit in browser:
```
http://localhost:3000/api/debug/user-delivery?email=test@example.com
```

## 🚀 **Vercel Production Testing**

### 1. **Update Vercel URL**
Edit `test-vercel-automation.js` and replace:
```javascript
const VERCEL_URL = 'https://your-domain.vercel.app';
```
With your actual Vercel domain.

### 2. **Run Production Test**
```bash
TEST_EMAIL=your-actual-email@example.com node test-vercel-automation.js
```

### 3. **Direct API Testing**
Replace `your-domain.vercel.app` with your actual domain:

**Health Check:**
```
https://your-domain.vercel.app/api/health
```

**Manual Cron Trigger:**
```
POST https://your-domain.vercel.app/api/debug/trigger-cron
```

**User Status Check:**
```
https://your-domain.vercel.app/api/debug/user-delivery?email=your-email@example.com
```

## 📊 **Monitoring Production**

### 1. **Vercel Dashboard**
- Go to your Vercel dashboard
- Navigate to Functions
- Check `/api/cron/send` logs
- Look for daily execution at 8 AM UTC

### 2. **Function Logs**
Check for these log entries:
```
[Cron] Starting newsletter delivery at 2025-10-13T08:00:00.000Z
[Cron] Found X total active users with send times
[Cron] Sample user: user@example.com, time: 8:00 AM, interests: 3 (AI, Machine Learning, Tech)
[Cron] Sent email to user@example.com
```

### 3. **Email Delivery Tracking**
Check your SendGrid dashboard for:
- Email delivery status
- Open rates
- Click rates
- Bounce rates

## 🎯 **Expected Results**

### ✅ **Local Testing (without SendGrid API key)**
- User creation: ✅ Success
- User verification: ✅ Success  
- Time matching: ✅ Success
- Cron processing: ✅ Success
- Email sending: ❌ Failed (expected)

### ✅ **Production Testing (with SendGrid API key)**
- User creation: ✅ Success
- User verification: ✅ Success
- Time matching: ✅ Success
- Cron processing: ✅ Success
- Email sending: ✅ Success

## 🕐 **Cron Schedule**

- **Schedule**: Daily at 8:00 AM UTC
- **Time Window**: Users with preferred times 6:00 AM - 10:00 AM UTC
- **Frequency**: Daily, Weekly, or Monthly based on user preferences

## 🔧 **Troubleshooting**

### **Issue: No emails sent**
1. Check if user is verified (has interests)
2. Check if user's preferred time is in morning window (6-10 AM UTC)
3. Check if user already received email today
4. Check SendGrid API key configuration

### **Issue: Cron job not running**
1. Check Vercel cron configuration in `vercel.json`
2. Check Vercel Function logs
3. Verify `CRON_SECRET` environment variable is set

### **Issue: Users not verified**
1. Check if user has interests in preferences
2. Check if `emailVerified` is set (optional)
3. Verify user creation process

## 📋 **Testing Checklist**

- [ ] Local automation test passes
- [ ] User verification works
- [ ] Time matching works
- [ ] Cron job processes users
- [ ] Production deployment successful
- [ ] Environment variables set in Vercel
- [ ] SendGrid API key configured
- [ ] Manual cron trigger works on production
- [ ] User status check works on production
- [ ] Vercel Function logs show cron execution
- [ ] Emails delivered successfully

## 🎉 **Success Indicators**

When everything is working correctly, you should see:
1. ✅ Users created and verified
2. ✅ Cron job runs daily at 8 AM UTC
3. ✅ Emails sent to matching users
4. ✅ Delivery logs show successful sends
5. ✅ Users receive newsletters in their inbox

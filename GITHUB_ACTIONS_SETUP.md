# GitHub Actions Setup for Hourly Newsletter Delivery

## Why GitHub Actions?

Vercel Hobby plan only allows **daily** cron jobs, but we need **hourly** delivery for 24/7 functionality. GitHub Actions provides **free** hourly cron jobs!

## Setup Instructions

### 1. Add GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions → New repository secret

Add these secrets:

1. **`VERCEL_URL`** (or `VERCEL`)
   - Value: Your Vercel deployment URL (e.g., `https://your-a-ibrief.vercel.app`)
   - This is your production domain

2. **`CRON_SECRET`** (or `CRON`)
   - Value: The same `CRON_SECRET` you have in Vercel environment variables
   - Used to authenticate the cron job requests

3. **`VERCEL_BYPASS_TOKEN`** (Required if Deployment Protection is enabled)
   - Value: Vercel Protection Bypass Token
   - How to get it:
     1. Go to Vercel Dashboard → Your Project → Settings → Security
     2. Scroll to "Deployment Protection"
     3. Click "Create Bypass Token"
     4. Copy the token and add it to GitHub Secrets
   - This allows GitHub Actions to bypass Vercel's authentication page

### 2. Enable GitHub Actions

The workflow file (`.github/workflows/hourly-newsletter.yml`) is already created. GitHub Actions will automatically:
- Run every hour at :00 minutes (1:00, 2:00, 3:00, etc.)
- Call your Vercel endpoint with proper authentication
- Log success/failure

### 3. Verify It's Working

1. Go to your GitHub repo → Actions tab
2. You should see "Hourly Newsletter Delivery" workflow
3. It will run automatically every hour
4. You can also manually trigger it using "Run workflow" button

### 4. Monitor Logs

- **GitHub Actions**: Check the Actions tab for execution logs
- **Vercel Logs**: Check your Vercel dashboard → Functions → `/api/cron/send` for delivery logs

## Benefits

✅ **Free** - GitHub Actions is free for public repos  
✅ **Reliable** - Runs on GitHub's infrastructure  
✅ **24/7** - Hourly execution, not limited to daily  
✅ **No Code Changes** - Your existing code already supports it  
✅ **Manual Trigger** - Can trigger manually for testing  

## Fallback

The Vercel cron is still configured to run **daily at 8 AM UTC** as a backup, in case GitHub Actions fails.

## Testing

To test manually:
1. Go to GitHub repo → Actions
2. Click "Hourly Newsletter Delivery"
3. Click "Run workflow" → "Run workflow"
4. Check the logs to verify it called your endpoint successfully


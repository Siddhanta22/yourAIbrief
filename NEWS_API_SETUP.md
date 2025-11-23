# NewsAPI Setup Guide

## Why You're Seeing the Same Articles

If you're seeing the same articles and images across different pages, it means the system is using **fallback static content** instead of real news from NewsAPI. This happens when:

1. `NEWS_API_KEY` is not set in Vercel environment variables
2. The NewsAPI key is invalid or expired
3. NewsAPI rate limit has been reached
4. Network issues preventing API calls

## How to Fix It

### Step 1: Get a NewsAPI Key

1. Go to [https://newsapi.org/](https://newsapi.org/)
2. Sign up for a free account (100 requests/day) or paid plan
3. Copy your API key from the dashboard

### Step 2: Add to Vercel Environment Variables

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Click **Add New**
4. Add:
   - **Name**: `NEWS_API_KEY`
   - **Value**: Your NewsAPI key (e.g., `abc123def456...`)
   - **Environment**: Select all (Production, Preview, Development)
5. Click **Save**

### Step 3: Redeploy

After adding the environment variable, you need to redeploy:

1. Go to **Deployments** tab
2. Click the **⋯** menu on the latest deployment
3. Select **Redeploy**
4. Or push a new commit to trigger a new deployment

### Step 4: Verify It's Working

After redeployment, check:

1. Open your site
2. Navigate to the news preview section
3. You should see **real, up-to-date news articles** with different content on each page
4. Check the browser console (F12) for any errors
5. Check Vercel function logs for NewsAPI calls

## What Happens When It's Working

✅ **Real News**: Articles are fetched from NewsAPI with current headlines  
✅ **Different Content**: Each page shows different articles  
✅ **Fresh Images**: Real article images from news sources  
✅ **Updated Daily**: Content updates automatically as new articles are published  

## Troubleshooting

### Still seeing fallback content?

1. **Check Vercel logs**: Look for errors mentioning `NEWS_API_KEY`
2. **Verify key is set**: Go to Vercel → Settings → Environment Variables
3. **Check API key validity**: Test your key at [https://newsapi.org/docs/endpoints](https://newsapi.org/docs/endpoints)
4. **Check rate limits**: Free tier has 100 requests/day
5. **Check network**: Ensure Vercel can reach newsapi.org

### Rate Limit Reached?

- Free tier: 100 requests/day
- Upgrade to a paid plan for more requests
- Or wait until the next day for the limit to reset

## Alternative: Use a Different News Source

If NewsAPI doesn't work for you, you can:
- Use RSS feeds from news sources
- Integrate with other news APIs (Google News, Bing News, etc.)
- Use a news aggregation service

---

**Note**: The system will always show fallback content if `NEWS_API_KEY` is not configured. This ensures the site works even without the API key, but you'll see the same static articles.


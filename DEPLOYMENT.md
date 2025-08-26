# 🚀 AI Newsletter Platform - Deployment Guide

## Quick Deploy Options

### Option 1: Vercel (Recommended - 5 minutes)

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm install -g vercel
   ```

2. **Deploy to Vercel**:
   ```bash
   npx vercel
   ```

3. **Follow the prompts**:
   - Link to existing project or create new
   - Set project name (e.g., `ai-newsletter-platform`)
   - Choose your team/account

4. **Set Environment Variables** in Vercel Dashboard:
   - Go to your project settings
   - Add all variables from your `.env` file

### Option 2: Railway (Alternative)

1. **Connect your GitHub repo** to Railway
2. **Set environment variables** in Railway dashboard
3. **Deploy automatically** on git push

## Required Environment Variables

```bash
# Database
DATABASE_URL="your-production-database-url"

# Authentication
NEXTAUTH_URL="https://your-domain.vercel.app"
NEXTAUTH_SECRET="your-production-secret-key"

# Email Services
SENDGRID_API_KEY="your-sendgrid-api-key"
SENDGRID_FROM_EMAIL="newsletter@youraibrief.com"
SENDGRID_FROM_NAME="AI Newsletter"

# Content Sources
NEWS_API_KEY="your-news-api-key"

# Cron Job
CRON_SECRET="your-cron-secret"

# Development
NODE_ENV="production"
NEXT_PUBLIC_APP_URL="https://your-domain.vercel.app"
```

## Database Setup

### Option 1: Vercel Postgres
1. Create a Postgres database in Vercel
2. Copy the connection string to `DATABASE_URL`
3. Run migrations: `npx prisma db push`

### Option 2: Supabase (Free tier available)
1. Create a Supabase project
2. Get the connection string
3. Run migrations: `npx prisma db push`

## Domain Setup

1. **Custom Domain** (Optional):
   - Add your domain in Vercel dashboard
   - Update DNS records
   - Update `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL`

2. **Default Domain**:
   - Vercel provides: `your-project.vercel.app`

## Cron Job Setup

1. **Set up automated newsletter delivery**:
   - Use a service like cron-job.org
   - Set up daily cron job to hit: `https://your-domain.vercel.app/api/cron/send?key=your-cron-secret`

2. **Recommended schedule**:
   - Every 30 minutes to check for users due for newsletters

## Post-Deployment Checklist

- [ ] Environment variables set correctly
- [ ] Database migrations run
- [ ] Test email delivery
- [ ] Test user signup flow
- [ ] Test newsletter delivery
- [ ] Custom domain configured (if desired)
- [ ] Cron job set up for automated delivery

## Monitoring

- **Vercel Analytics**: Built-in performance monitoring
- **SendGrid Dashboard**: Email delivery tracking
- **Database Monitoring**: Check your database provider's dashboard

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Verify environment variables
3. Test API endpoints individually
4. Check database connectivity 
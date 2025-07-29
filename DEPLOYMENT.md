# Deployment Guide for AI Newsletter Platform

This guide covers deploying your AI newsletter platform to various platforms with your custom domain.

## Prerequisites

1. **Domain**: You already have a domain ready
2. **Database**: PostgreSQL database (managed or self-hosted)
3. **Email Service**: SendGrid account for email delivery
4. **API Keys**: OpenAI, News API, and other required services

## Environment Variables Setup

Create a `.env.local` file with the following variables:

```bash
# Database
DATABASE_URL="postgresql://username:password@host:port/database"

# Authentication
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="your-secret-key-here"

# Email Services
SENDGRID_API_KEY="your-sendgrid-api-key"
SENDGRID_FROM_EMAIL="noreply@yourdomain.com"
SENDGRID_FROM_NAME="AI Newsletter"

# OpenAI (for content curation)
OPENAI_API_KEY="your-openai-api-key"

# Redis (for caching)
REDIS_URL="redis://host:port"

# Analytics
GOOGLE_ANALYTICS_ID="your-ga-id"

# Content Sources
NEWS_API_KEY="your-news-api-key"
RSS_FEEDS="https://feeds.feedburner.com/TechCrunch,https://rss.cnn.com/rss/edition_technology.rss"

# Email Templates
WELCOME_EMAIL_TEMPLATE_ID="d-welcome-template-id"
NEWSLETTER_TEMPLATE_ID="d-newsletter-template-id"

# Feature Flags
ENABLE_AI_CURATION="true"
ENABLE_PREMIUM_FEATURES="false"
ENABLE_ANALYTICS="true"

# Production
NODE_ENV="production"
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
```

## Deployment Options

### Option 1: Vercel (Recommended for Next.js)

**Pros**: Native Next.js support, automatic deployments, edge functions
**Cons**: Need external PostgreSQL database

#### Steps:

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Deploy to Vercel**:
   ```bash
   vercel
   ```

3. **Set up PostgreSQL**:
   - Use [Neon](https://neon.tech) (free tier available)
   - Or [Supabase](https://supabase.com) (free tier available)
   - Or [Railway](https://railway.app) PostgreSQL

4. **Configure Environment Variables**:
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add all variables from the `.env.local` file

5. **Set up Custom Domain**:
   - Go to Vercel Dashboard → Your Project → Settings → Domains
   - Add your domain and follow DNS instructions

6. **Deploy Database Schema**:
   ```bash
   npx prisma db push
   ```

### Option 2: Railway (Full-Stack)

**Pros**: Full-stack deployment, PostgreSQL included, easy environment management
**Cons**: Can be more expensive at scale

#### Steps:

1. **Connect GitHub Repository**:
   - Go to [Railway](https://railway.app)
   - Connect your GitHub account
   - Select your repository

2. **Add PostgreSQL Database**:
   - Click "New Service" → "Database" → "PostgreSQL"
   - Railway will automatically set `DATABASE_URL`

3. **Deploy Application**:
   - Click "New Service" → "GitHub Repo"
   - Select your repository
   - Railway will auto-detect Next.js

4. **Configure Environment Variables**:
   - Go to your app service → Variables
   - Add all required environment variables

5. **Set up Custom Domain**:
   - Go to your app service → Settings → Domains
   - Add your domain

6. **Deploy Database Schema**:
   ```bash
   npx prisma db push
   ```

### Option 3: DigitalOcean App Platform

**Pros**: Good pricing, PostgreSQL managed database, custom domains
**Cons**: Less Next.js optimized than Vercel

#### Steps:

1. **Create App**:
   - Go to DigitalOcean App Platform
   - Connect your GitHub repository
   - Select "Dockerfile" as build method

2. **Add PostgreSQL Database**:
   - Click "Create Resource" → "Database"
   - Select PostgreSQL
   - DigitalOcean will set `DATABASE_URL`

3. **Configure Environment Variables**:
   - Add all required environment variables

4. **Set up Custom Domain**:
   - Go to Settings → Domains
   - Add your domain

5. **Deploy Database Schema**:
   ```bash
   npx prisma db push
   ```

### Option 4: Docker + Any Cloud Provider

**Pros**: Maximum flexibility, works on any cloud
**Cons**: More complex setup

#### Steps:

1. **Build Docker Image**:
   ```bash
   docker build -t ai-newsletter .
   ```

2. **Deploy to your preferred cloud**:
   - AWS ECS/Fargate
   - Google Cloud Run
   - Azure Container Instances
   - DigitalOcean Droplets

3. **Set up PostgreSQL**:
   - Use managed database service
   - Or self-host PostgreSQL

4. **Configure Environment Variables**:
   - Set all required environment variables

5. **Set up Custom Domain**:
   - Configure DNS to point to your deployment

## Post-Deployment Setup

### 1. Database Migration
```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# (Optional) Seed initial data
npx prisma db seed
```

### 2. Email Templates Setup
1. Go to SendGrid Dashboard
2. Create email templates for:
   - Welcome email
   - Newsletter delivery
   - Password reset
3. Update template IDs in environment variables

### 3. Content Sources Configuration
1. Set up RSS feeds in environment variables
2. Configure News API key
3. Test content fetching

### 4. Analytics Setup
1. Set up Google Analytics
2. Configure tracking code
3. Test analytics events

### 5. SSL Certificate
- Most platforms provide automatic SSL
- For custom setups, use Let's Encrypt

## Monitoring & Maintenance

### 1. Health Checks
- Set up health check endpoints
- Monitor application uptime
- Set up alerts for downtime

### 2. Database Monitoring
- Monitor database performance
- Set up automated backups
- Monitor connection limits

### 3. Email Delivery
- Monitor SendGrid delivery rates
- Set up bounce handling
- Track email engagement

### 4. Content Curation
- Monitor AI content generation
- Track content quality metrics
- Set up content moderation

## Troubleshooting

### Common Issues:

1. **Database Connection Errors**:
   - Check `DATABASE_URL` format
   - Verify database is accessible
   - Check firewall settings

2. **Email Delivery Issues**:
   - Verify SendGrid API key
   - Check sender email verification
   - Monitor SendGrid dashboard

3. **Build Failures**:
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Check for TypeScript errors

4. **Domain Issues**:
   - Verify DNS configuration
   - Check SSL certificate status
   - Ensure proper redirects

## Cost Optimization

### Vercel + Neon:
- Vercel: Free tier (3 projects)
- Neon: Free tier (3GB storage)
- Total: ~$0/month for small scale

### Railway:
- Free tier: $5/month credit
- PostgreSQL: Included
- Total: ~$5-20/month

### DigitalOcean:
- App Platform: $5/month
- PostgreSQL: $15/month
- Total: ~$20/month

## Security Considerations

1. **Environment Variables**: Never commit secrets to Git
2. **Database**: Use connection pooling, enable SSL
3. **Authentication**: Use strong NEXTAUTH_SECRET
4. **Email**: Verify sender domains in SendGrid
5. **API Keys**: Rotate keys regularly
6. **HTTPS**: Always use SSL in production

## Recommended Stack for Production

- **Frontend + API**: Vercel
- **Database**: Neon PostgreSQL
- **Email**: SendGrid
- **Caching**: Upstash Redis
- **Monitoring**: Vercel Analytics + Sentry
- **Domain**: Your custom domain with Cloudflare DNS

This setup provides excellent performance, reliability, and cost-effectiveness for your AI newsletter platform. 
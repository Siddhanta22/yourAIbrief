# 🤖 YourAIbrief

<img width="1512" height="825" alt="Screenshot 2025-11-07 at 3 53 46 PM" src="https://github.com/user-attachments/assets/6ef43728-d4b3-431f-87d7-84db99701312" /><img width="1512" height="826" alt="Screenshot 2025-11-07 at 4 07 32 PM" src="https://github.com/user-attachments/assets/be72b4c4-38a3-4ac2-906c-be1e0377ff5f" /><img width="1512" height="766" alt="Screenshot 2025-11-07 at 4 08 13 PM" src="https://github.com/user-attachments/assets/6d600797-73e5-43cb-abbd-6df2cd48bcee" />

> **Your Daily AI Intelligence Hub** — A personalized newsletter platform that curates and delivers AI news based on your interests, frequency, and timing preferences.

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38B2AC?style=for-the-badge&logo=tailwind-css)
![Resend](https://img.shields.io/badge/Resend-Email-000000?style=for-the-badge)

## 🚀 Live Demo

**🌐 Production URL**: [https://your-a-ibrief.vercel.app](https://your-a-ibrief.vercel.app)

## ✨ Features

### 🎯 **Personalized Content Curation**
- **Automated filtering**: source and keyword blocklists strip sponsored posts, PR noise, and irrelevant finance content
- **Trusted-source curation**: newsletter content is drawn from a 50+ source allowlist (TechCrunch, MIT Technology Review, Nature, Bloomberg, arXiv, and more)
- **10 topic categories**: AI News, Startups & Funding, Crypto & Blockchain, Fintech & Business, EdTech & Learning, Autonomous & Robotics, HealthTech & BioAI, Policy & Ethics, Research Breakthroughs, Opinion & Analysis

### 📧 **Personalized Email Delivery**
- **Custom timing**: choose the exact hour you want your newsletter delivered
- **Passwordless sign-up**: no password to set — a one-time link confirms the account
- **Personalized content**: newsletters are sectioned by each subscriber's selected topics

### 👤 **Authentication & Account Management**
- **Magic-link sign-in**: single-use tokens sent by email, redeemed at `/auth/verify`
- **Google OAuth**: alternate sign-in path via NextAuth
- **Preference controls**: update topics, delivery time, and frequency anytime from the dashboard

### 📊 **Real Analytics & Archive**
- **Open/click tracking**: a tracking pixel and rewritten article links record engagement per issue
- **Newsletter archive**: every delivered issue is saved and re-readable from the dashboard
- **Delivery stats**: dashboard numbers are read from the database, not placeholders

### 🎨 **Modern UI/UX**
- **Responsive design**: works across desktop, tablet, and mobile
- **Dark/light mode**: theme toggle with animated icon transition
- **Motion**: Framer Motion powers page transitions, staggered card reveals, and micro-interactions

## 🏗️ Architecture

### **Frontend**
- **Next.js 15** (App Router) — React framework, serves both pages and API routes
- **TypeScript**
- **Tailwind CSS**
- **Framer Motion** — animation
- **Lucide React** — icons

### **Backend**
- **Next.js API Routes** — serverless functions, one per route handler
- **Prisma ORM** + **PostgreSQL** (hosted on Supabase, pooled via pgbouncer)
- **NextAuth v4** — JWT sessions, Google OAuth + a custom email `CredentialsProvider`
- **Resend** — transactional email delivery

### **Content**
- **NewsAPI** (`/v2/everything`) — raw article source
- **Content Curation Engine** (`src/lib/content-curation.ts`) — blocklist filtering, source-priority sorting, and a 15-minute in-memory cache to stay under NewsAPI's rate limit

### **Scheduling & Infrastructure**
- **Vercel** — hosting and deployment
- **GitHub Actions** (`.github/workflows/hourly-newsletter.yml`) — hourly workflow that calls the cron endpoint; the endpoint checks each subscriber's preferred hour and sends only to those due

## 🚀 Quick Start

### **Prerequisites**
- Node.js 18+
- A PostgreSQL database (e.g. [Supabase](https://supabase.com))
- A [Resend](https://resend.com) account
- A [NewsAPI](https://newsapi.org) key

### **Installation**

1. **Clone the repository**
   ```bash
   git clone https://github.com/Siddhanta22/yourAIbrief.git
   cd yourAIbrief
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Fill in your own values — see `.env.example` for the full list (database URLs, `NEXTAUTH_SECRET`, Google OAuth credentials, `RESEND_API_KEY`, `NEWS_API_KEY`, `CRON_SECRET`).

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
src/
├── app/                      # Next.js App Router
│   ├── api/                  # API routes
│   │   ├── auth/             # NextAuth + sign-in/logout endpoints
│   │   ├── cron/             # Scheduled newsletter delivery
│   │   ├── newsletter/       # Send, history, archive, retry
│   │   ├── track/            # Open/click tracking pixel + redirect
│   │   ├── user/             # User existence + preferences
│   │   └── admin/            # Admin-gated delivery stats
│   ├── dashboard/             # User dashboard (stats, past issues, preferences)
│   ├── newsletter/[id]/       # Single archived issue view
│   ├── auth/                  # Sign-in and magic-link verify pages
│   └── unsubscribe/           # Unsubscribe flow
├── components/
│   ├── forms/                # Subscribe form
│   ├── layout/                # Navigation, footer, preferences modal
│   ├── sections/              # Landing page sections
│   └── providers/              # SessionProvider, ThemeProvider
├── lib/                       # Core services
│   ├── content-curation.ts    # Fetching, filtering, and caching news content
│   ├── email-service.ts       # Newsletter HTML rendering + send
│   ├── simple-email.ts        # Transactional emails (welcome, sign-in)
│   ├── newsletterStore.ts     # Persists sent issues to the archive
│   ├── deliveryTime.ts        # Parses each user's preferred send hour
│   ├── verificationToken.ts   # One-time token creation/links
│   ├── authOptions.ts         # NextAuth configuration
│   └── requireAdmin.ts        # Admin route guard
└── types/                     # Shared TypeScript types
```

## 🔧 API Endpoints

### **Authentication**
- `POST /api/auth/request-signin` — send a one-time sign-in link to an existing account
- `GET /auth/verify` — redeem a sign-in link (issued by `/api/subscribe` or `/api/auth/request-signin`)
- `GET /api/user/exists` — check whether an account exists for an email
- `POST /api/auth/logout` — server-side session cleanup

### **User Management**
- `GET /api/user/preferences` — get the current user's preferences
- `POST /api/user/preferences` — update topics, frequency, delivery time

### **Newsletter**
- `POST /api/subscribe` — new user subscription
- `POST /api/newsletter/send-now` — admin-triggered manual send
- `GET /api/newsletter/history` — the current user's past issues
- `GET /api/newsletter/[id]` — a single archived issue (ownership-checked)
- `POST /api/newsletter/retry-failed` — admin: retry recent failed sends
- `POST /api/newsletter/send-afternoon` — admin: manual alternate-timeslot send

### **Content**
- `GET /api/news/preview` — curated article preview for the homepage

### **Tracking**
- `GET /api/track/open` — records an email open
- `GET /api/track/click` — records an article click, then redirects

### **Automation**
- `POST /api/cron/send` — checks due subscribers and sends their newsletter (called hourly by GitHub Actions, and once daily by Vercel's own cron)

### **Admin**
- `GET /api/admin/delivery-stats` — delivery stats across all users

## 🎯 Key Features Deep Dive

### **Smart Content Curation**
`src/lib/content-curation.ts` filters and prioritizes raw NewsAPI results:

```typescript
// A priority allowlist of 50+ reputable sources — real newsletter sections
// hard-filter to this list; the homepage preview uses it as a sort priority
// instead, so it never shows zero results.
const SOURCE_WHITELIST = [
  'TechCrunch', 'VentureBeat', 'The Verge', 'Wired',
  'MIT Technology Review', 'Nature', 'Science',
  'Bloomberg', 'Wall Street Journal', 'Financial Times',
  // ...50+ total
];

// Strips sponsored posts, deal aggregators, and PR-style content
const KEYWORD_BLOCKLIST: RegExp[] = [
  /\bsponsored\b/i, /\bpromo code\b/i, /\bdiscount code\b/i, /\d+%\s*off\b/i,
];
```

### **Personalized Delivery**
Each subscriber controls:
- **Frequency**: daily, weekly, or monthly
- **Timing**: an exact delivery hour, parsed via `parsePreferredHour()`
- **Topics**: any of the 10 interest categories, stored per-user in `UserInterest`

### **Real Analytics**
Every sent issue gets its own row in `NewsletterAnalytics`:

```prisma
model NewsletterAnalytics {
  id           String @id @default(cuid())
  newsletterId String @unique
  opens        Int    @default(0)
  clicks       Int    @default(0)
}
```

The tracking pixel and click-redirect routes increment these directly — the dashboard reads real counts, not estimates.

## 🚀 Deployment

### **Vercel**

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Connect your GitHub repository to Vercel
   - Set the environment variables from `.env.example` in the Vercel dashboard
   - Deploys automatically on push to `main`

3. **Production database**
   - Point `DATABASE_URL`/`DIRECT_URL` at your hosted Postgres instance (e.g. Supabase)
   - Run `npx prisma db push`

4. **Scheduled delivery**
   - `vercel.json` defines a daily cron hitting `/api/cron/send`
   - `.github/workflows/hourly-newsletter.yml` runs hourly and calls the same endpoint with `CRON_SECRET` — this is what actually lets each user's individually chosen delivery hour work, since the endpoint itself decides who's due each time it's called
   - Add `VERCEL_URL` and `CRON_SECRET` as GitHub Actions repository secrets for the workflow to run

## 🔒 Security

- **Single-use tokens**: sign-in/verification tokens are deleted immediately on redemption
- **Admin-gated routes**: `/api/admin/*`, `/api/newsletter/send-now`, `/api/newsletter/retry-failed`, `/api/newsletter/send-afternoon` all require an authenticated admin session
- **Open-redirect protection**: the click-tracking redirect only follows `http(s)` URLs
- **No enumeration leaks**: `/api/auth/request-signin` returns the same response whether or not an account exists
- **SQL injection protection**: Prisma's parameterized queries
- **Input validation**: Zod schemas on user-facing API routes

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

**Built by [Siddhanta Mohanty](https://github.com/Siddhanta22)**

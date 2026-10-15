# YourAIbrief

### Your daily AI news, curated for you and delivered on your schedule.

<img width="1512" height="825" alt="YourAIbrief homepage" src="https://github.com/user-attachments/assets/6ef43728-d4b3-431f-87d7-84db99701312" /><img width="1512" height="826" alt="YourAIbrief topic selection" src="https://github.com/user-attachments/assets/be72b4c4-38a3-4ac2-906c-be1e0377ff5f" /><img width="1512" height="766" alt="YourAIbrief dashboard" src="https://github.com/user-attachments/assets/6d600797-73e5-43cb-abbd-6df2cd48bcee" />

**Live now:** [https://your-a-ibrief.vercel.app](https://your-a-ibrief.vercel.app)

## What is YourAIbrief?

AI moves fast, and keeping up usually means checking a dozen websites, feeds, and newsletters, then wading through the noise. YourAIbrief fixes that. You pick the topics you care about and the time you want your brief, and a clean, ad free digest lands in your inbox. No searching, no scrolling, no FOMO.

## What you get

**News that matches your interests**
Choose from 10 topics: AI News, Research Breakthroughs, Startups and Funding, Crypto and Blockchain, Fintech and Business, EdTech and Learning, Autonomous and Robotics, HealthTech and BioAI, Policy and Ethics, and Opinion and Analysis.

**Delivery on your terms**
Pick the exact hour you want your brief, and choose daily, weekly, or monthly delivery. It arrives automatically, right when you want it.

**Trusted sources, less noise**
Stories come from more than 50 reputable outlets like TechCrunch, MIT Technology Review, Nature, and Bloomberg. Sponsored posts, press release fluff, and spam are filtered out before anything reaches you.

**A live preview before you sign up**
Browse a page by page feed of current stories right on the homepage, so you can see exactly what you would be getting.

**Sign in without a password**
Enter your email and click a one time link, or continue with Google. There is nothing to remember and nothing to leak.

**Your own dashboard**
Revisit every past issue, update your topics and delivery time whenever you like, and see how you engage with your briefs.

**A polished experience**
Responsive on every screen, with a light and dark theme and smooth animations throughout.

## How it works

1. You subscribe and choose your topics and delivery time.
2. A scheduled job checks every hour to see whose delivery time has arrived.
3. For each of those readers, the app gathers fresh articles, filters out the noise, and builds a personalized brief.
4. The brief is saved to your archive and emailed to you.
5. Opens and clicks are tracked per issue, so the dashboard shows real engagement.

## Built with

**Frontend**
Next.js 15, React, TypeScript, Tailwind CSS, Framer Motion

**Backend**
Next.js API routes, Prisma ORM, PostgreSQL (hosted on Supabase)

**Authentication**
NextAuth with Google OAuth and passwordless email links

**Email**
Resend

**News content**
NewsAPI, with a custom curation engine and a short lived in memory cache to stay within rate limits

**Scheduling and hosting**
GitHub Actions for the hourly delivery check, deployed on Vercel

## Run it locally

You will need Node.js 18 or newer, a PostgreSQL database, a Resend account, and a NewsAPI key.

```bash
git clone https://github.com/Siddhanta22/yourAIbrief.git
cd yourAIbrief
npm install
cp .env.example .env
```

Fill in `.env` with your own values (the template lists everything needed), then set up the database and start the app:

```bash
npx prisma generate
npx prisma db push
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and you are in.

## Deploying

Connect the repository to Vercel, add the same environment variables from `.env.example`, and deploy. For scheduled delivery, add `VERCEL_URL` and `CRON_SECRET` as GitHub Actions secrets so the hourly workflow can reach your app.

---

Built by [Siddhanta Mohanty](https://github.com/Siddhanta22)

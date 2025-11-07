# 🤖 AI Newsletter Platform
<img width="1512" height="825" alt="Screenshot 2025-11-07 at 3 53 46 PM" src="https://github.com/user-attachments/assets/6ef43728-d4b3-431f-87d7-84db99701312" /><img width="1512" height="826" alt="Screenshot 2025-11-07 at 4 07 32 PM" src="https://github.com/user-attachments/assets/be72b4c4-38a3-4ac2-906c-be1e0377ff5f" /><img width="1512" height="766" alt="Screenshot 2025-11-07 at 4 08 13 PM" src="https://github.com/user-attachments/assets/6d600797-73e5-43cb-abbd-6df2cd48bcee" />



> **Your Daily AI Intelligence Hub** - A personalized newsletter platform that curates and delivers AI news based on your interests, frequency, and timing preferences.

![AI Newsletter Platform](https://img.shields.io/badge/Next.js-14.0.4-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.3-38B2AC?style=for-the-badge&logo=tailwind-css)
![SendGrid](https://img.shields.io/badge/SendGrid-Email-1A73E8?style=for-the-badge&logo=sendgrid)

## 🚀 Live Demo

**🌐 Production URL**: [https://youraibrief.com](https://youraibrief.com) *(Coming Soon)*

## ✨ Features

### 🎯 **Personalized Content Curation**
- **AI-Powered Filtering**: Curates content from 50+ reputable sources
- **Smart Source Management**: Whitelist/blacklist system for quality control
- **Keyword Filtering**: Blocks irrelevant finance/press release content
- **12 Topic Categories**: AI News, Startups, Big Tech, Crypto, Fintech, and more

### 📧 **Intelligent Email Delivery**
- **Flexible Scheduling**: Daily, weekly, or monthly delivery
- **Custom Timing**: Choose your preferred delivery time (e.g., 8:30 AM)
- **Double Opt-in**: Email confirmation for new subscribers
- **Personalized Content**: Newsletters tailored to your selected interests

### 👤 **User Management**
- **Email-First Authentication**: Simple signup with email verification
- **Profile Management**: Update name, preferences, and topics anytime
- **Session Persistence**: Seamless login experience
- **Preference Controls**: Manage frequency, timing, and content topics

### 📊 **Real-Time Analytics**
- **Engagement Tracking**: Monitor newsletter opens and clicks
- **User Statistics**: Track total newsletters, active topics, delivery frequency
- **Performance Dashboard**: Real-time stats with auto-refresh
- **Newsletter History**: Complete archive of delivered content

### 🎨 **Modern UI/UX**
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Dark/Light Mode**: Toggle between themes
- **Smooth Animations**: Framer Motion powered transitions
- **Accessible Design**: WCAG compliant interface

## 🏗️ Architecture

### **Frontend Stack**
- **Next.js 14** (App Router) - React framework with server-side rendering
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations and transitions
- **Lucide React** - Beautiful, customizable icons

### **Backend Stack**
- **Next.js API Routes** - Serverless API endpoints
- **Prisma ORM** - Type-safe database operations
- **PostgreSQL** - Reliable relational database
- **SendGrid** - Professional email delivery service

### **AI & Content**
- **NewsAPI** - Real-time news aggregation
- **Content Curation Engine** - Smart filtering and categorization
- **Vector Search** - Similar content detection (planned)

### **Infrastructure**
- **Vercel** - Hosting and deployment
- **Cron Jobs** - Automated newsletter delivery
- **Environment Management** - Secure configuration handling

## 🚀 Quick Start

### **Prerequisites**
- Node.js 18+ 
- PostgreSQL database
- SendGrid account
- NewsAPI key

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
   cp .env.example .env.local
   ```
   
   Fill in your environment variables:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/ai_newsletter"
   
   # Authentication
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key"
   
   # Email Services
   SENDGRID_API_KEY="your-sendgrid-api-key"
   SENDGRID_FROM_EMAIL="newsletter@youraibrief.com"
   SENDGRID_FROM_NAME="AI Newsletter"
   
   # Content Sources
   NEWS_API_KEY="your-news-api-key"
   
   # Cron Job
   CRON_SECRET="your-cron-secret"
   ```

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
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── cron/          # Automated newsletter delivery
│   │   ├── newsletter/    # Newsletter management
│   │   ├── user/          # User management
│   │   └── debug/         # Development utilities
│   ├── dashboard/         # User dashboard
│   ├── member/            # Member home page
│   └── about/             # About page
├── components/            # React components
│   ├── forms/             # Form components
│   ├── layout/            # Layout components
│   ├── sections/          # Page sections
│   └── providers/         # Context providers
├── lib/                   # Utility libraries
│   ├── content-curation.ts # Content filtering & curation
│   ├── email-service.ts   # Email delivery service
│   └── utils.ts           # General utilities
└── types/                 # TypeScript type definitions
```

## 🔧 API Endpoints

### **Authentication**
- `POST /api/auth/confirm` - Email confirmation
- `GET /api/user/exists` - Check if user exists

### **User Management**
- `GET /api/user/preferences` - Get user preferences
- `POST /api/user/preferences` - Update user preferences
- `GET /api/user/stats` - Get user statistics

### **Newsletter**
- `POST /api/subscribe` - New user subscription
- `POST /api/newsletter/test` - Send test newsletter
- `POST /api/newsletter/send-now` - Manual newsletter delivery
- `GET /api/newsletter/history` - Newsletter history

### **Content**
- `GET /api/news` - Get curated news articles

### **Automation**
- `GET /api/cron/send` - Automated newsletter delivery

## 🎯 Key Features Deep Dive

### **Smart Content Curation**
The platform uses a sophisticated content curation system:

```typescript
// Whitelist of 50+ reputable sources
const SOURCE_WHITELIST = [
  'TechCrunch', 'VentureBeat', 'The Verge', 'Wired',
  'MIT Technology Review', 'Nature', 'Science',
  'Bloomberg', 'Wall Street Journal', 'Financial Times'
];

// Keyword filtering to block irrelevant content
const KEYWORD_BLOCKLIST = [
  /\betf[s]?\b/i, /\bdividend[s]?\b/i, /\bpress release\b/i
];
```

### **Personalized Delivery**
Users can customize their newsletter experience:

- **Frequency**: Daily, weekly, or monthly
- **Timing**: Choose delivery time (e.g., "08:30 AM")
- **Topics**: Select from 12 AI-related categories
- **Content Density**: Control article count per newsletter

### **Real-Time Analytics**
Track engagement and performance:

```typescript
interface UserStats {
  totalNewsletters: number;
  openRate: number;
  clickRate: number;
  activeTopics: string[];
  frequency: string;
  lastNewsletter: Date | null;
}
```

## 🚀 Deployment

### **Vercel (Recommended)**

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Connect your GitHub repository to Vercel
   - Set environment variables in Vercel dashboard
   - Deploy automatically on git push

3. **Set up production database**
   - Use Vercel Postgres or Supabase
   - Run migrations: `npx prisma db push`

4. **Configure cron job**
   - Set up automated delivery via cron-job.org
   - Target: `https://your-domain.vercel.app/api/cron/send?key=your-secret`

### **Environment Variables for Production**

```env
DATABASE_URL="your-production-database-url"
NEXTAUTH_URL="https://your-domain.vercel.app"
NEXTAUTH_SECRET="your-production-secret"
SENDGRID_API_KEY="your-sendgrid-key"
NEWS_API_KEY="your-news-api-key"
CRON_SECRET="your-cron-secret"
NODE_ENV="production"
```

## 📊 Performance

- **Build Time**: ~30 seconds
- **Bundle Size**: ~82KB (First Load JS)
- **Lighthouse Score**: 95+ (Performance, Accessibility, Best Practices)
- **Email Delivery**: 99.9% uptime via SendGrid

## 🔒 Security

- **Email Verification**: Double opt-in for new users
- **Environment Variables**: Secure configuration management
- **Input Validation**: Zod schema validation
- **SQL Injection Protection**: Prisma ORM with parameterized queries
- **HTTPS**: Automatic SSL certificates

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js Team** - For the amazing React framework
- **Vercel** - For seamless deployment and hosting
- **SendGrid** - For reliable email delivery
- **NewsAPI** - For comprehensive news aggregation
- **Tailwind CSS** - For the utility-first CSS framework

## 📞 Support

- **Email**: support@youraibrief.com
- **GitHub Issues**: [Report a bug](https://github.com/Siddhanta22/yourAIbrief/issues)
- **Documentation**: [Full documentation](https://docs.youraibrief.com)

---

**Built with ❤️ by [Siddhanta Mohanty](https://github.com/Siddhanta22)**

*Transform your daily AI news consumption with intelligent curation and personalized delivery.* 

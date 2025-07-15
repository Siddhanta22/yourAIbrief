// User types
export interface User {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  isActive: boolean;
  timezone?: string;
  preferences?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  preferredSendTime?: string;
}

export enum UserRole {
  ADMIN = 'ADMIN',
  EDITOR = 'EDITOR',
  SUBSCRIBER = 'SUBSCRIBER',
  PREMIUM = 'PREMIUM',
}

// Newsletter types
export interface Newsletter {
  id: string;
  title: string;
  content: NewsletterContent;
  summary?: string;
  publishedAt: Date;
  isPublished: boolean;
  isPremium: boolean;
  tags: string[];
  sections: NewsletterSection[];
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface NewsletterContent {
  sections: NewsletterSection[];
  summary?: string;
  metadata?: Record<string, any>;
}

export interface NewsletterSection {
  id: string;
  title: string;
  description?: string;
  articles: NewsletterArticle[];
  category: string;
  order: number;
}

export interface NewsletterArticle {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  publishedAt: Date;
  tags: string[];
  relevance: number;
  category: string;
  image?: string;
}

// Content source types
export interface ContentSource {
  id: string;
  name: string;
  url: string;
  type: SourceType;
  isActive: boolean;
  lastFetched?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export enum SourceType {
  RSS = 'RSS',
  API = 'API',
  SCRAPER = 'SCRAPER',
  MANUAL = 'MANUAL',
}

// User interest types
export interface UserInterest {
  id: string;
  userId: string;
  category: string;
  weight: number;
  createdAt: Date;
}

// Analytics types
export interface NewsletterAnalytics {
  id: string;
  newsletterId: string;
  opens: number;
  clicks: number;
  shares: number;
  unsubscribes: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserAnalytics {
  id: string;
  userId: string;
  eventType: string;
  eventData?: Record<string, any>;
  timestamp: Date;
}

// Email types
export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  variables?: Record<string, any>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmailLog {
  id: string;
  to: string;
  subject: string;
  status: EmailStatus;
  sentAt: Date;
  openedAt?: Date;
  clickedAt?: Date;
  metadata?: Record<string, any>;
}

export enum EmailStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  OPENED = 'OPENED',
  CLICKED = 'CLICKED',
  BOUNCED = 'BOUNCED',
  FAILED = 'FAILED',
}

// API response types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any[];
}

export interface SubscriptionRequest {
  email: string;
  interests: string[];
}

export interface SubscriptionResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    email: string;
    interests: string[];
  };
}

// Interest categories
export const INTEREST_CATEGORIES = [
  { id: 'ai-news', label: 'AI News (General)', icon: '📰' },
  { id: 'startups', label: 'Startups & Funding', icon: '🚀' },
  { id: 'big-tech', label: 'Big Tech & Industry', icon: '🏢' },
  { id: 'crypto', label: 'Crypto & Blockchain', icon: '🪙' },
  { id: 'fintech', label: 'Fintech & Business', icon: '💸' },
  { id: 'edtech', label: 'EdTech & Learning', icon: '🎓' },
  { id: 'autonomous', label: 'Autonomous & Robotics', icon: '🤖' },
  { id: 'healthtech', label: 'HealthTech & BioAI', icon: '🧬' },
  { id: 'tools', label: 'Tools & Productivity', icon: '🛠️' },
  { id: 'policy', label: 'Policy & Ethics', icon: '⚖️' },
  { id: 'research', label: 'Research Breakthroughs', icon: '🔬' },
  { id: 'opinion', label: 'Opinion & Analysis', icon: '💡' },
] as const;

export type InterestCategory = typeof INTEREST_CATEGORIES[number]['id'];

// Newsletter sections
export const NEWSLETTER_SECTIONS = [
  { id: 'breakthroughs', title: 'AI Breakthroughs & Research', description: 'Latest papers, discoveries, and scientific advances' },
  { id: 'industry', title: 'Industry News & Applications', description: 'Real-world AI implementations and company updates' },
  { id: 'ml-dl', title: 'Machine Learning & Deep Learning', description: 'Technical developments, new algorithms, frameworks' },
  { id: 'tools', title: 'AI Tools & Platforms', description: 'New releases, updates to existing tools, product launches' },
  { id: 'vision-robotics', title: 'Computer Vision & Robotics', description: 'Visual AI, autonomous systems, robotics developments' },
  { id: 'nlp', title: 'Natural Language Processing', description: 'Language models, conversational AI, text processing' },
  { id: 'ethics', title: 'AI Ethics & Regulation', description: 'Policy updates, ethical discussions, regulatory changes' },
  { id: 'startups', title: 'Startup Spotlight', description: 'Emerging AI companies, acquisitions, market trends' },
  { id: 'opinion', title: 'Opinion & Analysis', description: 'Expert insights, trend analysis, future predictions' },
] as const;

export type NewsletterSectionId = typeof NEWSLETTER_SECTIONS[number]['id']; 
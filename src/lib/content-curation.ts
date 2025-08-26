import { NewsletterArticle, NewsletterSection } from '@/types';
import axios from 'axios';

const NEWS_API_KEY = process.env.NEWS_API_KEY;
const NEWS_API_URL = 'https://newsapi.org/v2/everything';

// Add this mapping for display names at the top of the file or near the categorizeArticle function
const CATEGORY_LABELS: Record<string, string> = {
  'ai-news': 'Industry Pulse',
  'crypto': 'Crypto',
  'fintech': 'Fintech',
  'startups': 'Startups',
  'big-tech': 'Big Tech',
  'edtech': 'EdTech',
  'autonomous': 'Autonomous',
  'healthtech': 'HealthTech',
  'tools': 'Tools',
  'policy': 'Policy',
  'research': 'Research',
  'opinion': 'Opinion',
  'other': 'Other',
};

// Whitelist of reputable sources (finalized)
const SOURCE_WHITELIST = [
  // Tech & AI News
  'TechCrunch', 'VentureBeat', 'The Verge', 'Wired', 'Ars Technica', 'ZDNet', 'Engadget', 'The Register', 'TechRepublic', 'The Information', 'MarkTechPost', 'Analytics India Magazine', 'Towards Data Science', 'AI Weirdness', 'CurrentAI.news',
  // Business & Finance
  'Bloomberg', 'Wall Street Journal', 'WSJ', 'Financial Times', 'FT', 'CNBC', 'Reuters', 'Forbes', 'Business Insider', 'Yahoo Finance', 'Quartz',
  // Science & Academic
  'MIT Technology Review', 'Nature', 'Science', 'Scientific American', 'arXiv', 'Tech Xplore', 'Phys.org',
  // Industry & Policy
  'Fast Company', 'Harvard Business Review', 'McKinsey Insights', 'Gartner', 'CB Insights',
  // Mainstream/High-Frequency
  'Futurism', 'The Guardian', 'BBC', 'New York Times', 'LA Times', 'Associated Press', 'Axios',
  // Global/Emerging Market
  'Rest of World', 'Analytics Vidhya', 'SyncedReview',
  // Previously added sources
  'SiliconANGLE News', 'Just Jared', 'Biztoc.com', 'Raw Story', 'The Conversation Africa', 'The Drum', 'NBC News', 'Digital Journal', 'The Times of India', 'Malwarebytes.com',
];

// Blocklist of sources to exclude (add to this as you find spam/ads)
const SOURCE_BLOCKLIST: string[] = [
  'Just Jared',
  'Onefootball',
  'Bleeding Cool',
  'Biztoc',
  'PBS',
  'PAUL TAN\'S AUTOMOTIVE NEWS',
  'CarScoops',
  'Motor1',
  'AutoBlog',
  'Car and Driver',
  'Motor Trend',
  'Automotive News',
  // Finance/press-release wires and low-signal feeds
  'GlobeNewswire',
  'PR Newswire',
  'Business Wire',
  'ETF Daily News',
  'American Banking News',
  'PYMNTS',
  'Poynter',
  // Example: 'Some Spam Source', 'Clickbait News',
];

// Hard keyword blocklist – drop if these look finance/ticker-centric or PR-only
const KEYWORD_BLOCKLIST: RegExp[] = [
  /\betf[s]?\b/i,
  /\bdividend[s]?\b/i,
  /\bdistribution[s]?\b/i,
  /\bearnings\b/i,
  /\beps\b/i,
  /\bprice target\b/i,
  /\boptions volume\b/i,
  /\bNYSE\b/i,
  /\bNASDAQ\b/i,
  /\bDow Jones\b/i,
  /\bpress release\b/i,
  /\bquarterly results\b/i,
];

// Helper for case-insensitive, partial source matching
function isSourceWhitelisted(sourceName: string): boolean {
  if (!sourceName) return false;
  return SOURCE_WHITELIST.some(whitelisted =>
    sourceName.toLowerCase().includes(whitelisted.toLowerCase())
  );
}

function isAIArticle(article: any): boolean {
  const text = `${article.title} ${article.description || ''}`.toLowerCase();
  return /\b(ai|artificial intelligence|machine learning|deep learning|llm|generative ai|neural network|openai|chatgpt|bard|deepmind|anthropic|gpt)\b/.test(text);
}

async function fetchNewsFromNewsAPI(topics: string[] = [], page: number = 1, pageSize: number = 12): Promise<{ articles: NewsletterArticle[], totalResults: number }> {
  console.log('[NewsAPI] fetchNewsFromNewsAPI called with topics:', topics, 'page:', page, 'pageSize:', pageSize);
  if (!NEWS_API_KEY) {
    console.error('NEWS_API_KEY is missing!');
    return { articles: [], totalResults: 0 };
  }
  const RAW_PAGE_SIZE = 50; // overfetch to keep post-filter pages filled
  const MAX_RAW_PAGES = 10; // safety cap

  function buildParams(rawPage: number) {
    return {
      apiKey: NEWS_API_KEY,
      language: 'en',
      pageSize: RAW_PAGE_SIZE,
      page: rawPage,
      sortBy: 'publishedAt',
      q: topics.length
        ? topics.join(' OR ')
        : '"artificial intelligence" OR AI OR "machine learning" OR "deep learning" OR "neural network" OR "generative ai" OR LLM',
    };
  }

  console.log('[NewsAPI] Using server-side filtered pagination. desired page:', page, 'size:', pageSize);

  try {
    function categorizeArticle(article: any): string {
      const text = `${article.title} ${article.description || ''}`.toLowerCase();
      const source = (article.source?.name || '').toLowerCase();
      if (/\bcrypto|blockchain|bitcoin|ethereum|web3|defi|nft\b/.test(text) || /coindesk|decrypt|cointelegraph/.test(source)) return 'crypto';
      if (/\bfintech|finance|bank|payment|stripe|visa|mastercard|paypal|square\b/.test(text) || /finextra/.test(source)) return 'fintech';
      if (/\bstartup|founder|venture|funding|seed|series a|series b|accelerator|incubator\b/.test(text) || /techcrunch/.test(source)) return 'startups';
      if (/\bgoogle|microsoft|apple|amazon|meta|facebook|big tech|samsung|nvidia|tesla|ibm|oracle|intel\b/.test(text) || /the verge|wired|cnet|gizmodo|venturebeat/.test(source)) return 'big-tech';
      if (/\bedtech|education|learning|upskilling|coursera|udemy|khan academy|byju\b/.test(text) || /edsurge/.test(source)) return 'edtech';
      if (/\bautonomous|robot|robotics|self-driving|driverless|drone|automation\b/.test(text) || /robot report/.test(source)) return 'autonomous';
      if (/\bhealthtech|health|biotech|bioai|medtech|medicine|healthcare|pharma|genomics\b/.test(text) || /medtech/.test(source)) return 'healthtech';
      if (/\btool|productivity|platform|app|software|saas|notion|slack|asana|trello\b/.test(text) || /product hunt/.test(source)) return 'tools';
      if (/\bpolicy|regulation|law|ethic|governance|compliance|privacy|gdpr\b/.test(text) || /policy/.test(source)) return 'policy';
      if (/\bresearch|arxiv|paper|study|breakthrough|discovery|scientist\b/.test(text) || /arxiv/.test(source)) return 'research';
      if (/\bopinion|analysis|editorial|column|perspective|viewpoint|commentary\b/.test(text) || /alignment forum/.test(source)) return 'opinion';
      if (/\b(ai|artificial intelligence|machine learning|openai|chatgpt|bard|llm|deepmind|anthropic|gpt)\b/.test(text)) return 'ai-news';
      return 'other';
    }
    // Accumulate filtered articles until we can serve the requested filtered page
    const filtered: any[] = [];
    let rawPage = 1;
    let reachedEnd = false;

    while (filtered.length < page * pageSize && rawPage <= MAX_RAW_PAGES && !reachedEnd) {
      const params = buildParams(rawPage);
      console.log('[NewsAPI] Request params:', params);
      const res = await axios.get(NEWS_API_URL, { params });
      console.log('[NewsAPI] Response status:', res.status);
      const raw = res.data?.articles || [];
      if (raw.length === 0) reachedEnd = true;

      const pageFiltered = raw
        .filter((a: any) => a.urlToImage && typeof a.urlToImage === 'string' && a.urlToImage.trim() !== '')
        .filter((a: any) => !SOURCE_BLOCKLIST.some(blocked => (a.source?.name || '').toLowerCase().includes(blocked.toLowerCase())))
        .filter((a: any) => !KEYWORD_BLOCKLIST.some(rx => rx.test(`${a.title} ${a.description || ''}`)))
        .filter((a: any) => isAIArticle(a))
        .map((a: any) => {
          const category = categorizeArticle(a);
          return {
            id: a.url,
            title: a.title,
            summary: a.description || a.content || '',
            url: a.url,
            source: a.source?.name || '',
            publishedAt: a.publishedAt ? new Date(a.publishedAt) : new Date(),
            tags: [],
            relevance: 1,
            category,
            categoryLabel: CATEGORY_LABELS[category] || 'Other',
            image: a.urlToImage,
          } as NewsletterArticle & { categoryLabel: string };
        });
      filtered.push(...pageFiltered);
      rawPage += 1;
    }

    // If still short for this page, keep fetching a bit more to try to fill it
    while (!reachedEnd && filtered.length < page * pageSize && rawPage <= MAX_RAW_PAGES) {
      const params = buildParams(rawPage);
      const res = await axios.get(NEWS_API_URL, { params });
      const raw = res.data?.articles || [];
      if (raw.length === 0) { reachedEnd = true; break; }
      const pageFiltered = raw
        .filter((a: any) => a.urlToImage && typeof a.urlToImage === 'string' && a.urlToImage.trim() !== '')
        .filter((a: any) => !SOURCE_BLOCKLIST.some(blocked => (a.source?.name || '').toLowerCase().includes(blocked.toLowerCase())))
        .filter((a: any) => !KEYWORD_BLOCKLIST.some(rx => rx.test(`${a.title} ${a.description || ''}`)))
        .filter((a: any) => isAIArticle(a))
        .map((a: any) => {
          const category = categorizeArticle(a);
          return {
            id: a.url,
            title: a.title,
            summary: a.description || a.content || '',
            url: a.url,
            source: a.source?.name || '',
            publishedAt: a.publishedAt ? new Date(a.publishedAt) : new Date(),
            tags: [],
            relevance: 1,
            category,
            categoryLabel: CATEGORY_LABELS[category] || 'Other',
            image: a.urlToImage,
          } as NewsletterArticle & { categoryLabel: string };
        });
      filtered.push(...pageFiltered);
      rawPage += 1;
    }

    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const pageArticles = filtered.slice(start, end);

    // Best-effort total filtered count (within our cap); for UI pagination
    const approxTotal = reachedEnd ? filtered.length : Math.max(filtered.length, page * pageSize + (pageArticles.length < pageSize ? 0 : pageSize));

    return { articles: pageArticles, totalResults: approxTotal };
  } catch (e: any) {
    if (e.response) {
      console.error('[NewsAPI] Error response:', e.response.status, e.response.data);
    } else {
      console.error('Failed to fetch news from NewsAPI:', e);
    }
    return { articles: [], totalResults: 0 };
  }
}

export interface ContentSource {
  id: string;
  name: string;
  url: string;
  type: 'rss' | 'api' | 'manual';
  category: string;
  weight: number;
}

export interface CuratedContent {
  articles: NewsletterArticle[];
  sections: NewsletterSection[];
  summary: string;
  metadata: {
    totalArticles: number;
    sources: string[];
    categories: string[];
    publishedAt: Date;
  };
}

export class ContentCurationService {
  async fetchContent(userInterests: string[] = [], page: number = 1, pageSize: number = 12): Promise<{ articles: NewsletterArticle[], totalResults: number }> {
    const newsApiArticles = await fetchNewsFromNewsAPI(userInterests, page, pageSize);
    const relevantArticles = userInterests.length > 0
      ? newsApiArticles.articles.filter(article => 
          userInterests.some(interest => 
            article.category === interest || 
            article.tags.includes(interest)
          )
        )
      : newsApiArticles.articles;
    return {
      articles: relevantArticles,
      totalResults: newsApiArticles.totalResults,
    };
  }

  async curateContent(userInterests: string[] = []): Promise<CuratedContent> {
    const allArticles = await this.fetchContent([]); // fetch all articles, not just filtered by interests
    const now = new Date();

    // 1. Per-topic sections (strict whitelist)
    const topicSections: NewsletterSection[] = [];
    for (const interest of userInterests) {
      // Only include articles from the strict whitelist and matching the topic
      const topicArticles = allArticles.articles
        .filter(article =>
          isSourceWhitelisted(article.source) &&
          (article.category === interest || article.tags.includes(interest)) &&
          (now.getTime() - new Date(article.publishedAt).getTime() < 2 * 24 * 60 * 60 * 1000) // last 2 days for recency
        )
        .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
        .slice(0, 5);
      if (topicArticles.length > 0) {
        topicSections.push({
          id: interest,
          title: this.getCategoryTitle(interest),
          description: this.getCategoryDescription(interest),
          articles: topicArticles,
          category: interest,
          order: topicSections.length,
        });
      }
    }

    // 2. What’s Popping in AI? section (broader, fun/miscellaneous, but still AI-related and not blocklisted)
    const poppingArticles = allArticles.articles
      .filter(article =>
        isAIArticle(article) &&
        !SOURCE_BLOCKLIST.some(blocked => (article.source || '').toLowerCase().includes(blocked.toLowerCase())) &&
        (now.getTime() - new Date(article.publishedAt).getTime() < 7 * 24 * 60 * 60 * 1000) // last 7 days
      )
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
      .slice(0, 5);
    if (poppingArticles.length > 0) {
      topicSections.push({
        id: 'whats-popping',
        title: "What’s Popping in AI?",
        description: 'Fun, trending, or miscellaneous stories from the AI world.',
        articles: poppingArticles,
        category: 'misc',
        order: topicSections.length,
      });
    }
    
    // Generate summary
    const summary = this.generateSummary(topicSections);
    return {
      articles: topicSections.flatMap(s => s.articles),
      sections: topicSections,
      summary,
      metadata: {
        totalArticles: topicSections.reduce((sum, s) => sum + s.articles.length, 0),
        sources: [...new Set(topicSections.flatMap(s => s.articles.map(a => a.source)))],
        categories: topicSections.map(s => s.category),
        publishedAt: new Date(),
      },
    };
  }

  private groupArticlesByCategory(articles: NewsletterArticle[]): Record<string, NewsletterArticle[]> {
    return articles.reduce((groups, article) => {
      const category = article.category;
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(article);
      return groups;
    }, {} as Record<string, NewsletterArticle[]>);
  }

  private createNewsletterSections(groupedArticles: Record<string, NewsletterArticle[]>): NewsletterSection[] {
    const sections: NewsletterSection[] = [];
    let order = 0;

    for (const [category, articles] of Object.entries(groupedArticles)) {
      if (articles.length > 0) {
        sections.push({
          id: category,
          title: this.getCategoryTitle(category),
          description: this.getCategoryDescription(category),
          articles: articles.slice(0, 5), // Limit to 5 articles per section
          category,
          order: order++,
        });
      }
    }

    return sections.sort((a, b) => a.order - b.order);
  }

  private getCategoryTitle(category: string): string {
    const titles: Record<string, string> = {
      'ai-news': 'AI News (General)',
      'startups': 'Startups & Funding',
      'big-tech': 'Big Tech & Industry',
      'crypto': 'Crypto & Blockchain',
      'fintech': 'Fintech & Business',
      'edtech': 'EdTech & Learning',
      'autonomous': 'Autonomous & Robotics',
      'healthtech': 'HealthTech & BioAI',
      'tools': 'Tools & Productivity',
      'policy': 'Policy & Ethics',
      'research': 'Research Breakthroughs',
      'opinion': 'Opinion & Analysis',
    };
    return titles[category] || category;
  }

  private getCategoryDescription(category: string): string {
    const descriptions: Record<string, string> = {
      'ai-news': 'Major headlines and updates from the world of AI.',
      'startups': 'Emerging companies, funding rounds, and startup news.',
      'big-tech': 'News from major tech companies and industry leaders.',
      'crypto': 'AI in crypto, blockchain, and Web3.',
      'fintech': 'AI in finance, business, and the economy.',
      'edtech': 'AI in education, learning, and upskilling.',
      'autonomous': 'Self-driving, robotics, and automation.',
      'healthtech': 'AI in healthcare, biotech, and life sciences.',
      'tools': 'New AI tools, platforms, and productivity hacks.',
      'policy': 'AI policy, regulation, and ethical debates.',
      'research': 'Latest research, discoveries, and scientific advances.',
      'opinion': 'Expert takes, analysis, and commentary.',
    };
    return descriptions[category] || '';
  }

  private generateSummary(sections: NewsletterSection[]): string {
    const totalArticles = sections.reduce((sum, section) => sum + section.articles.length, 0);
    const categories = sections.map(s => s.title).join(', ');
    
    return `Today's AI newsletter brings you ${totalArticles} curated stories across ${sections.length} categories: ${categories}. Stay ahead with the latest breakthroughs, industry updates, and expert insights.`;
  }

  private getMockArticles(): NewsletterArticle[] {
    return [
      {
        id: '1',
        title: 'OpenAI and Google Announce Major AI Partnership',
        summary: 'The two tech giants are teaming up to accelerate safe AI development and deployment worldwide.',
        url: 'https://ainews.com/openai-google-partnership',
        source: 'AI News Daily',
        publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        tags: ['openai', 'google', 'partnership'],
        relevance: 0.97,
        category: 'ai-news',
      },
      {
        id: '2',
        title: 'Crypto Startup Raises $100M for AI-Powered DeFi Platform',
        summary: 'A new player in the DeFi space is leveraging AI to optimize trading and risk management.',
        url: 'https://decrypt.co/ai-defi-funding',
        source: 'Decrypt',
        publishedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
        tags: ['crypto', 'defi', 'funding'],
        relevance: 0.93,
        category: 'crypto',
      },
      {
        id: '3',
        title: 'EdTech Giant Launches AI Tutor for Personalized Learning',
        summary: 'The new AI-powered tutor adapts to each student’s needs, promising better outcomes.',
        url: 'https://www.edsurge.com/news/ai-tutor-launch',
        source: 'EdSurge',
        publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
        tags: ['edtech', 'ai-tutor', 'learning'],
        relevance: 0.91,
        category: 'edtech',
      },
      {
        id: '4',
        title: 'Robotics Startup Unveils Autonomous Delivery Fleet',
        summary: 'A robotics company is rolling out a new fleet of autonomous delivery vehicles in major cities.',
        url: 'https://www.therobotreport.com/autonomous-delivery-fleet',
        source: 'The Robot Report',
        publishedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
        tags: ['autonomous', 'robotics', 'delivery'],
        relevance: 0.89,
        category: 'autonomous',
      },
      {
        id: '5',
        title: 'AI Tool Boosts Productivity for Remote Teams',
        summary: 'A new productivity tool uses AI to automate meeting notes and action items for distributed teams.',
        url: 'https://www.producthunt.com/posts/ai-productivity-tool',
        source: 'Product Hunt',
        publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
        tags: ['tools', 'productivity', 'remote-work'],
        relevance: 0.88,
        category: 'tools',
      },
      {
        id: '6',
        title: 'Fintech Firm Integrates AI for Fraud Detection',
        summary: 'A leading fintech company is now using AI to detect and prevent fraudulent transactions in real time.',
        url: 'https://www.finextra.com/news/ai-fraud-detection',
        source: 'Finextra',
        publishedAt: new Date(Date.now() - 7 * 60 * 60 * 1000),
        tags: ['fintech', 'fraud', 'ai'],
        relevance: 0.87,
        category: 'fintech',
      },
      {
        id: '7',
        title: 'AI Policy Debate Heats Up in Washington',
        summary: 'Lawmakers and experts are debating new regulations for AI safety and transparency.',
        url: 'https://aipolicyexchange.org/news/ai-policy-debate',
        source: 'AI Policy Exchange',
        publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
        tags: ['policy', 'regulation', 'ethics'],
        relevance: 0.86,
        category: 'policy',
      },
      {
        id: '8',
        title: 'Breakthrough in AI-Driven Drug Discovery',
        summary: 'Researchers have developed a new AI model that accelerates the discovery of life-saving drugs.',
        url: 'https://arxiv.org/abs/2024.12345',
        source: 'arXiv',
        publishedAt: new Date(Date.now() - 9 * 60 * 60 * 1000),
        tags: ['research', 'drug-discovery', 'bioai'],
        relevance: 0.92,
        category: 'research',
      },
      {
        id: '9',
        title: 'HealthTech Startup Uses AI for Early Disease Detection',
        summary: 'A healthtech company is leveraging AI to identify diseases earlier and improve patient outcomes.',
        url: 'https://www.medtechdive.com/news/ai-disease-detection',
        source: 'MedTech Dive',
        publishedAt: new Date(Date.now() - 10 * 60 * 60 * 1000),
        tags: ['healthtech', 'bioai', 'disease'],
        relevance: 0.90,
        category: 'healthtech',
      },
      {
        id: '10',
        title: 'Why AI Alignment Matters: An Expert’s Perspective',
        summary: 'A leading AI researcher shares their thoughts on the importance of aligning AI systems with human values.',
        url: 'https://www.alignmentforum.org/posts/ai-alignment-matters',
        source: 'AI Alignment Forum',
        publishedAt: new Date(Date.now() - 11 * 60 * 60 * 1000),
        tags: ['opinion', 'alignment', 'ethics'],
        relevance: 0.85,
        category: 'opinion',
      },
    ];
  }
} 
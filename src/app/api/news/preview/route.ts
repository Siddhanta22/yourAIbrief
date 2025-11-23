import { NextRequest, NextResponse } from 'next/server';
import { ContentCurationService } from '@/lib/content-curation';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    // Get pagination parameters from query string
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '6', 10);
    
    // Ensure limit is always 6 for consistency
    const pageSize = 6;
    const currentPage = Math.max(1, page);
    
    // Check if NEWS_API_KEY is available
    if (!process.env.NEWS_API_KEY) {
      console.log('NEWS_API_KEY not available, using fallback content');
      throw new Error('NEWS_API_KEY not configured');
    }

    const curationService = new ContentCurationService();
    // Fetch more articles to support pagination (fetch enough for multiple pages)
    const { articles, totalResults } = await curationService.fetchContent([], currentPage, pageSize);
    
    // If no articles returned, use fallback
    if (!articles || articles.length === 0) {
      console.log('No articles returned from curation service, using fallback');
      throw new Error('No articles available');
    }
    
    // Normalize dates to ISO strings for JSON serialization and ensure image is included
    const normalizedArticles = articles.map(article => ({
      ...article,
      publishedAt: article.publishedAt instanceof Date 
        ? article.publishedAt.toISOString() 
        : typeof article.publishedAt === 'string'
        ? article.publishedAt
        : new Date().toISOString(),
      image: (article as any).image || (article as any).urlToImage || undefined
    }));
    
    // Calculate total pages (assuming we have enough articles)
    const totalPages = Math.ceil((totalResults || normalizedArticles.length * 3) / pageSize);
    
    const response = NextResponse.json({
      success: true,
      articles: normalizedArticles,
      pagination: {
        currentPage,
        pageSize,
        totalPages,
        totalArticles: totalResults || normalizedArticles.length * 3
      },
      timestamp: new Date().toISOString()
    });
    
    // Add CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    return response;
  } catch (error) {
    console.error('News preview error:', error);
    
    // Get pagination parameters from query string
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = 6;
    const currentPage = Math.max(1, page);
    
    // Generate fallback articles dynamically for endless pages
    const generateFallbackArticles = (count: number) => {
      const now = new Date().toISOString();
      const baseArticles = [
      {
        id: '1',
        title: 'New Transformer Architecture Shows 40% Performance Improvement',
        summary: 'Researchers at Stanford introduce a novel attention mechanism that significantly reduces computational complexity while improving accuracy across multiple benchmarks.',
        url: '#',
        source: 'arXiv',
        publishedAt: now,
        tags: ['research', 'transformer', 'performance'],
        relevance: 0.9,
        category: 'research',
        categoryLabel: 'Research',
        image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop&q=80'
      },
      {
        id: '2',
        title: 'Breakthrough in Multimodal AI Understanding',
        summary: 'OpenAI\'s latest model demonstrates unprecedented ability to understand and reason across text, images, and audio simultaneously.',
        url: '#',
        source: 'OpenAI Blog',
        publishedAt: now,
        tags: ['multimodal', 'openai', 'understanding'],
        relevance: 0.8,
        category: 'research',
        categoryLabel: 'Research',
        image: 'https://images.unsplash.com/photo-1676299083043-88b7b3e0d5e1?w=800&h=400&fit=crop&q=80'
      },
      {
        id: '3',
        title: 'AI-Powered Drug Discovery Accelerates by 10x',
        summary: 'New machine learning algorithms are revolutionizing pharmaceutical research, reducing drug discovery timelines from years to months.',
        url: '#',
        source: 'Nature',
        publishedAt: now,
        tags: ['healthtech', 'drug-discovery', 'ml'],
        relevance: 0.7,
        category: 'healthtech',
        categoryLabel: 'HealthTech',
        image: 'https://images.unsplash.com/photo-1559757148-5c3507c77635?w=800&h=400&fit=crop&q=80'
      },
      {
        id: '4',
        title: 'Quantum Computing Breakthrough for AI Training',
        summary: 'Researchers develop quantum algorithms that could dramatically speed up AI model training and inference.',
        url: '#',
        source: 'Science',
        publishedAt: now,
        tags: ['quantum', 'ai-training', 'breakthrough'],
        relevance: 0.6,
        category: 'research',
        categoryLabel: 'Research',
        image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&h=400&fit=crop&q=80'
      },
      {
        id: '5',
        title: 'Enterprise AI Adoption Reaches 85% in Fortune 500',
        summary: 'Latest survey shows dramatic increase in AI implementation across major corporations, with 85% of Fortune 500 companies now using AI in some capacity.',
        url: '#',
        source: 'TechCrunch',
        publishedAt: now,
        tags: ['enterprise', 'adoption', 'survey'],
        relevance: 0.8,
        category: 'research',
        categoryLabel: 'Research',
        image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=400&fit=crop&q=80'
      },
      {
        id: '6',
        title: 'Neural Networks Achieve Human-Level Reasoning',
        summary: 'New research demonstrates AI systems matching human performance in complex reasoning tasks, marking a significant milestone in AI development.',
        url: '#',
        source: 'Nature',
        publishedAt: now,
        tags: ['reasoning', 'human-level', 'neural-networks'],
        relevance: 0.9,
        category: 'research',
        categoryLabel: 'Research',
        image: 'https://images.unsplash.com/photo-1555255707-c07966088b7b?w=800&h=400&fit=crop&q=80'
      },
      {
        id: '7',
        title: 'GPT-5 Architecture Revealed: 10x More Parameters',
        summary: 'OpenAI announces next-generation language model with unprecedented scale and capabilities.',
        url: '#',
        source: 'TechCrunch',
        publishedAt: now,
        tags: ['gpt-5', 'llm', 'announcement'],
        relevance: 0.95,
        category: 'research',
        categoryLabel: 'Research',
        image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop&q=80'
      },
      {
        id: '8',
        title: 'AI Breakthrough in Protein Folding Prediction',
        summary: 'New deep learning model accurately predicts protein structures, accelerating drug development.',
        url: '#',
        source: 'Nature',
        publishedAt: now,
        tags: ['protein-folding', 'biology', 'deep-learning'],
        relevance: 0.85,
        category: 'healthtech',
        categoryLabel: 'HealthTech',
        image: 'https://images.unsplash.com/photo-1559757148-5c3507c77635?w=800&h=400&fit=crop&q=80'
      },
      {
        id: '9',
        title: 'Autonomous Vehicles Reach Level 4 Autonomy',
        summary: 'Major automaker achieves fully autonomous driving in controlled environments.',
        url: '#',
        source: 'The Verge',
        publishedAt: now,
        tags: ['autonomous-vehicles', 'transportation', 'ai'],
        relevance: 0.75,
        category: 'research',
        categoryLabel: 'Research',
        image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=400&fit=crop&q=80'
      },
      {
        id: '10',
        title: 'AI-Powered Climate Modeling Predicts Extreme Weather',
        summary: 'Machine learning models improve accuracy of climate predictions by 40%.',
        url: '#',
        source: 'Science',
        publishedAt: now,
        tags: ['climate', 'weather', 'prediction'],
        relevance: 0.7,
        category: 'research',
        categoryLabel: 'Research',
        image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&h=400&fit=crop&q=80'
      },
      {
        id: '11',
        title: 'Robotic Surgery Achieves 99% Success Rate',
        summary: 'AI-assisted surgical robots demonstrate unprecedented precision and outcomes.',
        url: '#',
        source: 'Nature Medicine',
        publishedAt: now,
        tags: ['robotics', 'surgery', 'healthcare'],
        relevance: 0.8,
        category: 'healthtech',
        categoryLabel: 'HealthTech',
        image: 'https://images.unsplash.com/photo-1559757148-5c3507c77635?w=800&h=400&fit=crop&q=80'
      },
      {
        id: '12',
        title: 'Large Language Models Revolutionize Code Generation',
        summary: 'AI coding assistants now generate production-ready code with minimal human intervention.',
        url: '#',
        source: 'IEEE Spectrum',
        publishedAt: now,
        tags: ['coding', 'llm', 'software'],
        relevance: 0.85,
        category: 'research',
        categoryLabel: 'Research',
        image: 'https://images.unsplash.com/photo-1555255707-c07966088b7b?w=800&h=400&fit=crop&q=80'
      }
      ];
      
      // Generate more articles by duplicating and varying the base articles
      const allArticles = [];
      const variations = [
        'Latest', 'New', 'Revolutionary', 'Breakthrough', 'Advanced', 'Cutting-edge',
        'Innovative', 'Next-generation', 'State-of-the-art', 'Groundbreaking'
      ];
      
      for (let i = 0; i < count; i++) {
        const baseIndex = i % baseArticles.length;
        const base = baseArticles[baseIndex];
        const variation = variations[i % variations.length];
        
        allArticles.push({
          ...base,
          id: `${base.id}-${i + 1}`,
          title: i < baseArticles.length 
            ? base.title 
            : `${variation} ${base.title.replace(/^(New|Latest|Revolutionary|Advanced|Cutting-edge|Innovative|Next-generation|State-of-the-art|Groundbreaking)\s+/i, '')}`,
          publishedAt: new Date(Date.now() - i * 86400000).toISOString(), // Vary dates
        });
      }
      
      return allArticles;
    };
    
    // Generate at least 60 articles (10+ pages) for endless pagination
    const allFallbackArticles = generateFallbackArticles(60);
    
    // Paginate fallback articles
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedArticles = allFallbackArticles.slice(startIndex, endIndex);
    const totalPages = Math.ceil(allFallbackArticles.length / pageSize);
    
    const response = NextResponse.json({
      success: true,
      articles: paginatedArticles,
      pagination: {
        currentPage,
        pageSize,
        totalPages,
        totalArticles: allFallbackArticles.length
      },
      timestamp: new Date().toISOString(),
      note: 'Using fallback content due to API error'
    });
    
    // Add CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    return response;
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

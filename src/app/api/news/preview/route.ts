import { NextRequest, NextResponse } from 'next/server';
import { ContentCurationService } from '@/lib/content-curation';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    // Check if NEWS_API_KEY is available
    if (!process.env.NEWS_API_KEY) {
      console.log('NEWS_API_KEY not available, using fallback content');
      throw new Error('NEWS_API_KEY not configured');
    }

    const curationService = new ContentCurationService();
    const { articles } = await curationService.fetchContent([], 1, 6); // Get 6 articles for preview
    
    // If no articles returned, use fallback
    if (!articles || articles.length === 0) {
      console.log('No articles returned from curation service, using fallback');
      throw new Error('No articles available');
    }
    
    // Normalize dates to ISO strings for JSON serialization and ensure image is included
    const normalizedArticles = articles.slice(0, 6).map(article => ({
      ...article,
      publishedAt: article.publishedAt instanceof Date 
        ? article.publishedAt.toISOString() 
        : typeof article.publishedAt === 'string'
        ? article.publishedAt
        : new Date().toISOString(),
      image: (article as any).image || (article as any).urlToImage || undefined
    }));
    
    const response = NextResponse.json({
      success: true,
      articles: normalizedArticles,
      timestamp: new Date().toISOString()
    });
    
    // Add CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    return response;
  } catch (error) {
    console.error('News preview error:', error);
    
    // Return fallback static articles if API fails
    const now = new Date().toISOString();
    const fallbackArticles = [
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
        category: 'ai-news',
        categoryLabel: 'Industry Pulse',
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
        category: 'ai-news',
        categoryLabel: 'Industry Pulse',
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
      }
    ];
    
    const response = NextResponse.json({
      success: true,
      articles: fallbackArticles,
      timestamp: now,
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

import { NextRequest, NextResponse } from 'next/server';
import { ContentCurationService } from '@/lib/content-curation';

export async function GET(request: NextRequest) {
  try {
    const curationService = new ContentCurationService();
    const { articles } = await curationService.fetchContent([], 1, 4); // Get 4 articles for preview
    
    const response = NextResponse.json({
      success: true,
      articles: articles.slice(0, 4), // Ensure we only return 4 articles
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
    const fallbackArticles = [
      {
        id: '1',
        title: 'New Transformer Architecture Shows 40% Performance Improvement',
        summary: 'Researchers at Stanford introduce a novel attention mechanism that significantly reduces computational complexity while improving accuracy across multiple benchmarks.',
        url: '#',
        source: 'arXiv',
        publishedAt: new Date(),
        tags: ['research', 'transformer', 'performance'],
        relevance: 0.9,
        category: 'research'
      },
      {
        id: '2',
        title: 'Breakthrough in Multimodal AI Understanding',
        summary: 'OpenAI\'s latest model demonstrates unprecedented ability to understand and reason across text, images, and audio simultaneously.',
        url: '#',
        source: 'OpenAI Blog',
        publishedAt: new Date(),
        tags: ['multimodal', 'openai', 'understanding'],
        relevance: 0.8,
        category: 'ai-news'
      },
      {
        id: '3',
        title: 'AI-Powered Drug Discovery Accelerates by 10x',
        summary: 'New machine learning algorithms are revolutionizing pharmaceutical research, reducing drug discovery timelines from years to months.',
        url: '#',
        source: 'Nature',
        publishedAt: new Date(),
        tags: ['healthtech', 'drug-discovery', 'ml'],
        relevance: 0.7,
        category: 'healthtech'
      },
      {
        id: '4',
        title: 'Quantum Computing Breakthrough for AI Training',
        summary: 'Researchers develop quantum algorithms that could dramatically speed up AI model training and inference.',
        url: '#',
        source: 'Science',
        publishedAt: new Date(),
        tags: ['quantum', 'ai-training', 'breakthrough'],
        relevance: 0.6,
        category: 'research'
      }
    ];
    
    const response = NextResponse.json({
      success: true,
      articles: fallbackArticles,
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

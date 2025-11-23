import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Test endpoint to verify NewsAPI key is working
 * Access at: /api/news/test-newsapi
 */
export async function GET(request: NextRequest) {
  const NEWS_API_KEY = process.env.NEWS_API_KEY;
  const NEWS_API_URL = 'https://newsapi.org/v2/everything';

  if (!NEWS_API_KEY) {
    return NextResponse.json({
      success: false,
      error: 'NEWS_API_KEY not found in environment variables',
      message: 'Please add NEWS_API_KEY to your Vercel environment variables'
    }, { status: 500 });
  }

  try {
    // Make a simple test request to NewsAPI
    const params = {
      apiKey: NEWS_API_KEY,
      language: 'en',
      pageSize: 5,
      page: 1,
      sortBy: 'publishedAt',
      q: 'artificial intelligence OR AI',
    };

    console.log('[Test] Making test request to NewsAPI...');
    const response = await fetch(`${NEWS_API_URL}?${new URLSearchParams(params as any).toString()}`);
    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        error: `NewsAPI returned error: ${response.status}`,
        details: data,
        message: response.status === 401 
          ? 'API key is invalid or expired. Please check your NewsAPI key.'
          : response.status === 429
          ? 'Rate limit exceeded. You may have reached your daily limit.'
          : 'Unknown error from NewsAPI'
      }, { status: response.status });
    }

    const articles = data.articles || [];
    
    return NextResponse.json({
      success: true,
      message: 'NewsAPI is working correctly!',
      apiKeyPresent: true,
      apiKeyLength: NEWS_API_KEY.length,
      apiKeyPreview: `${NEWS_API_KEY.substring(0, 8)}...${NEWS_API_KEY.substring(NEWS_API_KEY.length - 4)}`,
      totalResults: data.totalResults || 0,
      articlesReturned: articles.length,
      sampleArticles: articles.slice(0, 3).map((a: any) => ({
        title: a.title,
        source: a.source?.name,
        publishedAt: a.publishedAt,
        hasImage: !!a.urlToImage
      })),
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('[Test] Error testing NewsAPI:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to connect to NewsAPI',
      message: error.message || 'Unknown error',
      details: error.toString()
    }, { status: 500 });
  }
}



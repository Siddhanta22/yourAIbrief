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
      console.error('❌ NEWS_API_KEY not configured in environment variables');
      return NextResponse.json({
        success: false,
        error: 'NEWS_API_KEY not configured',
        message: 'Please add NEWS_API_KEY to your Vercel environment variables. See NEWS_API_SETUP.md for instructions.'
      }, { status: 500 });
    }

    console.log(`📰 Fetching real news from NewsAPI - Page ${currentPage}, Size ${pageSize}`);
    
    try {
      const curationService = new ContentCurationService();
      // Fetch articles for the specific page - this will fetch different articles for each page
      const result = await curationService.fetchContent([], currentPage, pageSize);
      const articles = result.articles || [];
      const totalResults = result.totalResults || 0;
      
      // If no articles returned, log warning but don't error - might be temporary
      if (!articles || articles.length === 0) {
        console.warn(`⚠️ No articles returned from NewsAPI for page ${currentPage}`);
        console.warn('This could mean:');
        console.warn('1. Filters are too strict and no articles match');
        console.warn('2. NewsAPI rate limit reached');
        console.warn('3. Temporary issue with news service');
        // Return empty array instead of error - let frontend handle gracefully
        return NextResponse.json({
          success: true,
          articles: [],
          pagination: {
            currentPage,
            pageSize,
            totalPages: 0,
            totalArticles: 0
          },
          timestamp: new Date().toISOString(),
          message: 'No articles available at the moment. Please check back later.'
        });
      }
      
      console.log(`✅ Successfully fetched ${articles.length} articles from NewsAPI for page ${currentPage}`);
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
    } catch (error: any) {
      console.error('❌ News preview error:', error);
      console.error('Error type:', error?.constructor?.name);
      console.error('Error message:', error?.message);
      console.error('Error stack:', error?.stack);
      
      // Handle axios errors from NewsAPI
      if (error?.response) {
        const status = error.response.status;
        const data = error.response.data;
        
        console.error('NewsAPI Error Response:', {
          status: status,
          statusText: error.response.statusText,
          data: data
        });
        
        // For the homepage preview, fail "softly":
        // return an empty successful payload so the UI simply stops paginating
        // instead of showing an error banner if NewsAPI rate-limits or errors.
        return NextResponse.json({
          success: true,
          articles: [],
          pagination: {
            currentPage,
            pageSize,
            totalPages: Math.max(1, currentPage - 1),
            totalArticles: 0,
          },
          timestamp: new Date().toISOString(),
          message: 'No additional articles available at the moment.',
        });
      }
      
      // Handle other errors with a soft failure as well
      return NextResponse.json({
        success: true,
        articles: [],
        pagination: {
          currentPage,
          pageSize,
          totalPages: Math.max(1, currentPage - 1),
          totalArticles: 0,
        },
        timestamp: new Date().toISOString(),
        message: 'No additional articles available at the moment.',
      });
    }
  } catch (outerError: any) {
    // Catch any unexpected errors
    console.error('❌ Unexpected error in news preview:', outerError);
    // Outer catch should also fail softly for the preview endpoint
    return NextResponse.json({
      success: true,
      articles: [],
      pagination: {
        currentPage: 1,
        pageSize: 6,
        totalPages: 1,
        totalArticles: 0,
      },
      timestamp: new Date().toISOString(),
      message: 'No additional articles available at the moment.',
    });
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

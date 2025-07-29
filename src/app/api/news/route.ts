import { NextRequest, NextResponse } from 'next/server';
import { ContentCurationService } from '@/lib/content-curation';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '12', 10);
    const curationService = new ContentCurationService();
    const { articles, totalResults } = await curationService.fetchContent([], page, pageSize);
    return NextResponse.json({ articles, totalResults });
  } catch (error) {
    console.error('[API] /api/news error:', error);
    return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 });
  }
} 
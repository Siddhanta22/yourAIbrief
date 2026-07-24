import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const newsletterId = request.nextUrl.searchParams.get('nId');
  const targetUrl = request.nextUrl.searchParams.get('url');

  if (!targetUrl) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Only ever redirect to http(s) URLs - reject javascript:/data: etc. to avoid
  // this becoming an open redirect abused for something other than article links.
  let destination: URL;
  try {
    destination = new URL(targetUrl);
    if (destination.protocol !== 'http:' && destination.protocol !== 'https:') {
      throw new Error('Unsupported protocol');
    }
  } catch {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (newsletterId) {
    try {
      await prisma.newsletterAnalytics.upsert({
        where: { newsletterId },
        create: { newsletterId, clicks: 1 },
        update: { clicks: { increment: 1 } },
      });
    } catch (error) {
      console.error('[Track Click] Failed to record click:', error);
    }
  }

  return NextResponse.redirect(destination);
}

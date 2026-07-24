import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// 1x1 transparent GIF
const PIXEL = Buffer.from('R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==', 'base64');

export async function GET(request: NextRequest) {
  const newsletterId = request.nextUrl.searchParams.get('nId');

  if (newsletterId) {
    try {
      await prisma.newsletterAnalytics.upsert({
        where: { newsletterId },
        create: { newsletterId, opens: 1 },
        update: { opens: { increment: 1 } },
      });
    } catch (error) {
      // Don't let a tracking failure surface to the recipient's inbox
      console.error('[Track Open] Failed to record open:', error);
    }
  }

  return new NextResponse(PIXEL, {
    status: 200,
    headers: {
      'Content-Type': 'image/gif',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Content-Length': PIXEL.length.toString(),
    },
  });
}

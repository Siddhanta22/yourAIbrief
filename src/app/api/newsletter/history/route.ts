import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ success: false, message: 'Email is required' }, { status: 400 });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        subscriptions: {
          include: {
            newsletter: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    // Format newsletter history
    const newsletters = user.subscriptions.map(sub => ({
      id: sub.newsletter.id,
      title: sub.newsletter.title,
      sentAt: sub.createdAt.toISOString(),
      opened: false, // This would come from email analytics
      clicked: false, // This would come from email analytics
      url: `https://example.com/newsletter/${sub.newsletter.id}` // Placeholder URL
    }));

    return NextResponse.json({ 
      success: true, 
      newsletters 
    });
  } catch (error) {
    console.error('Error fetching newsletter history:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch history' }, { status: 500 });
  }
}

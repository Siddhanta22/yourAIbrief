import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
        userInterests: true,
        subscriptions: {
          include: {
            newsletter: true
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      }
    });

    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    // Get total newsletters subscribed to by this user
    const totalNewsletters = await prisma.newsletterSubscription.count({
      where: { 
        userId: user.id,
        isActive: true
      }
    });

    // Get user's active topics
    const activeTopics = user.userInterests.map(interest => interest.category);

    // Get user's delivery frequency from preferences
    const frequency = (user.preferences as any)?.frequency || 'daily';

    // Calculate engagement stats (placeholder for now)
    const openRate = 94.2; // This would come from email service analytics
    const clickRate = 8.7; // This would come from email service analytics

    const stats = {
      totalNewsletters,
      openRate,
      clickRate,
      activeTopics,
      frequency,
      lastNewsletter: user.subscriptions[0]?.newsletter?.publishedAt || null
    };

    return NextResponse.json({ success: true, stats });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch stats' }, { status: 500 });
  }
}

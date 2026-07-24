import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) {
    return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
  }

  const { id } = await params;

  // Only let a user view an issue that was actually sent to them.
  const subscription = await prisma.newsletterSubscription.findUnique({
    where: { newsletterId_userId: { newsletterId: id, userId: user.id } },
    include: { newsletter: true },
  });

  if (!subscription) {
    return NextResponse.json({ success: false, message: 'Newsletter not found' }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    newsletter: {
      id: subscription.newsletter.id,
      title: subscription.newsletter.title,
      summary: subscription.newsletter.summary,
      publishedAt: subscription.newsletter.publishedAt,
      sections: subscription.newsletter.sections,
    },
  });
}

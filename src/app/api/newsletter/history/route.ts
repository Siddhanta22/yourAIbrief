import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) {
    return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
  }

  const subscriptions = await prisma.newsletterSubscription.findMany({
    where: { userId: user.id },
    include: { newsletter: true },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  const newsletters = subscriptions.map((sub) => {
    const sections = Array.isArray(sub.newsletter.sections) ? (sub.newsletter.sections as any[]) : [];
    const articleCount = sections.reduce((n, s) => n + (Array.isArray(s.articles) ? s.articles.length : 0), 0);
    return {
      id: sub.newsletter.id,
      title: sub.newsletter.title,
      summary: sub.newsletter.summary,
      publishedAt: sub.newsletter.publishedAt,
      articleCount,
    };
  });

  return NextResponse.json({ success: true, newsletters });
}

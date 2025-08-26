import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { EmailService } from '@/lib/email-service';
import { ContentCurationService } from '@/lib/content-curation';

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = (body?.email || '').toString().trim().toLowerCase();
    if (!email) {
      return NextResponse.json({ ok: false, message: 'Email is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        preferences: true,
        preferredSendTime: true,
        userInterests: { select: { category: true } },
      },
    });

    if (!user) {
      return NextResponse.json({ ok: false, message: 'User not found for this email.' }, { status: 404 });
    }

    // Rate limit: allow once per 24h using a timestamp in preferences
    const prefs = (user.preferences || {}) as Record<string, any>;
    const last = prefs.lastTestEmailAt ? new Date(prefs.lastTestEmailAt) : null;
    if (last && Date.now() - last.getTime() < 24 * 60 * 60 * 1000) {
      const nextAt = new Date(last.getTime() + 24 * 60 * 60 * 1000);
      return NextResponse.json({ ok: false, message: `Test already sent. Try again after ${nextAt.toLocaleString()}.` }, { status: 429 });
    }

    const curation = new ContentCurationService();
    const emailSvc = new EmailService();

    const interests = user.userInterests?.map((i: any) => i.category) || [];
    const curated = await curation.curateContent(interests);

    const newsletter = {
      id: `test-${Date.now()}`,
      title: '[TEST] Your AI Brief Preview',
      content: { sections: curated.sections, summary: curated.summary, metadata: curated.metadata },
      summary: curated.summary,
      publishedAt: new Date(),
      isPublished: false,
      isPremium: false,
      tags: [],
      sections: curated.sections,
      metadata: curated.metadata,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any;

    const ok = await emailSvc.sendTestEmail(email, newsletter as any);
    if (!ok) {
      return NextResponse.json({ ok: false, message: 'Failed to send test email.' }, { status: 500 });
    }

    await prisma.user.update({
      where: { email },
      data: {
        preferences: { ...(prefs || {}), lastTestEmailAt: new Date().toISOString() } as any,
      },
    });

    return NextResponse.json({ ok: true, message: 'Test newsletter sent. Please check your inbox/spam.' });
  } catch (error) {
    console.error('[Test Newsletter] error', error);
    return NextResponse.json({ ok: false, message: 'Internal server error' }, { status: 500 });
  }
}



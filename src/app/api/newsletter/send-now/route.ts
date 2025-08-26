import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { EmailService } from '@/lib/email-service';
import { ContentCurationService } from '@/lib/content-curation';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        userInterests: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log(`[Send Now] Sending newsletter to ${email}`);

    const curation = new ContentCurationService();
    const emailSvc = new EmailService();

    const interests = user.userInterests?.map((i: any) => i.category) || [];
    const curated = await curation.curateContent(interests);
    
    const newsletter = {
      id: `manual-${Date.now()}-${user.id}`,
      title: 'Your AI Brief',
      content: { sections: curated.sections, summary: curated.summary, metadata: curated.metadata },
      summary: curated.summary,
      publishedAt: new Date(),
      isPublished: true,
      isPremium: false,
      tags: [],
      sections: curated.sections,
      metadata: curated.metadata,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any;

    const result = await emailSvc.sendNewsletter(newsletter, [
      {
        id: user.id,
        email: user.email,
        name: user.name || undefined,
        preferences: (user.preferences || {}) as any,
        role: 0 as any,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        preferredSendTime: user.preferredSendTime || undefined,
      } as any,
    ]);

    console.log(`[Send Now] Result: success=${result.success}, failed=${result.failed}`);

    return NextResponse.json({ 
      success: true, 
      sent: result.success, 
      failed: result.failed,
      message: result.success > 0 ? 'Newsletter sent successfully!' : 'Failed to send newsletter'
    });

  } catch (error) {
    console.error('[Send Now] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { EmailService } from '@/lib/email-service';
import { ContentCurationService } from '@/lib/content-curation';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { email, testMode = false } = await request.json();
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
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

    if (!user.isActive) {
      return NextResponse.json({ error: 'User account is not active' }, { status: 400 });
    }

    // Check if user is verified (for existing users, treat as verified if they have interests)
    const isVerified = user.emailVerified || user.userInterests.length > 0;
    if (!isVerified) {
      return NextResponse.json({ error: 'Email not verified' }, { status: 400 });
    }

    console.log(`[Send Now] Sending newsletter to ${user.email}`);

    const curation = new ContentCurationService();
    const emailSvc = new EmailService();

    // Get user interests
    const interests = user.userInterests?.map((i: any) => i.category) || [];
    
    // Curate content
    const curated = await curation.curateContent(interests);
    
    // Create newsletter object
    const newsletter = {
      id: `nl-${Date.now()}-${user.id}`,
      title: testMode ? 'Test Newsletter - Your AI Brief' : 'Your AI Brief',
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

    // Send newsletter
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

    if (result.success > 0) {
      return NextResponse.json({ 
        success: true, 
        message: testMode ? 'Test newsletter sent successfully!' : 'Newsletter sent successfully!',
        sent: result.success,
        failed: result.failed
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        message: 'Failed to send newsletter',
        sent: result.success,
        failed: result.failed
      }, { status: 500 });
    }

  } catch (error) {
    console.error('[Send Now] Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
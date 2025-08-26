import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { EmailService } from '@/lib/email-service';
import { ContentCurationService } from '@/lib/content-curation';

export const dynamic = 'force-dynamic';

function formatTime(date: Date): string {
  // Stored in UI as "HH:MM AM/PM" (e.g., "08:00 AM")
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  if (hours === 0) hours = 12;
  const hh = String(hours).padStart(2, '0');
  const mm = String(minutes).padStart(2, '0');
  return `${hh}:${mm} ${ampm}`;
}

function isUserDueNow(user: any, now: Date): boolean {
  // preferredSendTime must match current hh:mm AM/PM
  if (!user.preferredSendTime) return false;
  const nowStr = formatTime(now);
  if (user.preferredSendTime !== nowStr) return false;

  const prefs = (user.preferences || {}) as Record<string, any>;
  const frequency = (prefs.frequency || 'daily') as 'daily'|'weekly'|'monthly';

  if (frequency === 'daily') return true;

  if (frequency === 'weekly') {
    // dayOfWeek like 'Monday', 'Tue', etc.
    const desired = String(prefs.dayOfWeek || '').toLowerCase();
    const current = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    return desired ? desired === current : true;
  }

  if (frequency === 'monthly') {
    // dayOfMonth like '1', '15', '31'
    const desiredNum = parseInt(String(prefs.dayOfMonth || ''), 10);
    const currentNum = now.getDate();
    return Number.isFinite(desiredNum) ? desiredNum === currentNum : true;
  }

  return false;
}

export async function GET(request: NextRequest) {
  try {
    const key = request.nextUrl.searchParams.get('key') || request.headers.get('x-cron-secret');
    const expected = process.env.CRON_SECRET;
    if (!expected || key !== expected) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    console.log(`[Cron] Running at ${now.toISOString()}`);

    // Get all active users with preferences
    const users = await prisma.user.findMany({
      where: {
        isActive: true,
        preferredSendTime: { not: null },
      },
      include: {
        userInterests: true,
      },
    });

    console.log(`[Cron] Found ${users.length} total users`);

    // Filter users who are due now
    const dueUsers = users.filter(u => {
      // For existing users who signed up before email confirmation, treat as verified
      const isVerified = u.emailVerified || u.userInterests.length > 0;
      return isVerified && isUserDueNow(u, now);
    });

    console.log(`[Cron] ${dueUsers.length} users due now`);

    if (dueUsers.length === 0) {
      return NextResponse.json({ ok: true, sent: 0, message: 'No users due at this time.' });
    }

    const curation = new ContentCurationService();
    const emailSvc = new EmailService();

    let success = 0; 
    let failed = 0;
    
    for (const user of dueUsers) {
      try {
        console.log(`[Cron] Sending to ${user.email}`);
        
        const interests = user.userInterests?.map((i: any) => i.category) || [];
        const curated = await curation.curateContent(interests);
        
        const newsletter = {
          id: `nl-${Date.now()}-${user.id}`,
          title: 'Your AI Brief',
          content: { sections: curated.sections, summary: curated.summary, metadata: curated.metadata },
          summary: curated.summary,
          publishedAt: now,
          isPublished: true,
          isPremium: false,
          tags: [],
          sections: curated.sections,
          metadata: curated.metadata,
          createdAt: now,
          updatedAt: now,
        } as any;

        const result = await emailSvc.sendNewsletter(newsletter, [
          {
            id: user.id,
            email: user.email,
            name: user.name || undefined,
            preferences: (user.preferences || {}) as any,
            role: 0 as any,
            isActive: true,
            createdAt: now,
            updatedAt: now,
            preferredSendTime: user.preferredSendTime || undefined,
          } as any,
        ]);
        
        success += result.success;
        failed += result.failed;
        
        console.log(`[Cron] Result for ${user.email}: success=${result.success}, failed=${result.failed}`);
      } catch (e) {
        console.error('[Cron] send error for', user.email, e);
        failed += 1;
      }
    }

    console.log(`[Cron] Completed: success=${success}, failed=${failed}`);
    return NextResponse.json({ ok: true, sent: success, failed });
  } catch (error) {
    console.error('[Cron] Unexpected error', error);
    return NextResponse.json({ ok: false, error: 'Internal error' }, { status: 500 });
  }
}



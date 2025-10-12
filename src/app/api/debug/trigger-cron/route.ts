import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { EmailService } from '@/lib/email-service';
import { ContentCurationService } from '@/lib/content-curation';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    console.log('[Manual Cron] Starting manual cron trigger...');

    // Connect to database
    await prisma.$connect();

    const now = new Date();
    console.log(`[Manual Cron] Current time: ${now.toISOString()}`);

    // Get all active users with comprehensive data
    const users = await prisma.user.findMany({
      where: {
        isActive: true,
        preferredSendTime: { not: null },
      },
      include: {
        userInterests: true,
      },
    });

    console.log(`[Manual Cron] Found ${users.length} total active users with send times`);

    // Parse user preferences safely
    function parseUserPreferences(preferences: any): Record<string, any> {
      if (!preferences) return {};
      
      try {
        if (typeof preferences === 'string') {
          return JSON.parse(preferences);
        }
        return preferences;
      } catch (e) {
        console.warn('Failed to parse user preferences:', e);
        return {};
      }
    }

    // Enhanced user due check
    function isUserDueNow(user: any, now: Date): { isDue: boolean; reason: string } {
      // Check if user has preferred send time
      if (!user.preferredSendTime) {
        return { isDue: false, reason: 'No preferred send time set' };
      }

      // Parse preferences
      const prefs = parseUserPreferences(user.preferences);
      const frequency = (prefs.frequency || 'daily') as 'daily'|'weekly'|'monthly';

      // Extract hour and minute from user time (e.g., "08:30 AM")
      const userTime = user.preferredSendTime;
      const userTimeMatch = userTime.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
      if (!userTimeMatch) {
        return { isDue: false, reason: 'Invalid time format' };
      }

      const [, userHour, userMinute, userAmPm] = userTimeMatch;
      let userHour24 = parseInt(userHour);
      if (userAmPm.toUpperCase() === 'PM' && userHour24 !== 12) {
        userHour24 += 12;
      } else if (userAmPm.toUpperCase() === 'AM' && userHour24 === 12) {
        userHour24 = 0;
      }

      // For manual testing: send to users whose preferred time is between 6 AM and 10 AM
      const isMorningTime = userHour24 >= 6 && userHour24 <= 10;
      
      if (!isMorningTime) {
        return { isDue: false, reason: `Time outside morning window: preferred=${userTime} (6 AM - 10 AM)` };
      }

      // Check frequency
      if (frequency === 'daily') {
        return { isDue: true, reason: 'Daily frequency matched (morning window)' };
      }

      if (frequency === 'weekly') {
        const desiredDay = String(prefs.dayOfWeek || '').toLowerCase();
        const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
        
        if (desiredDay && desiredDay !== currentDay) {
          return { isDue: false, reason: `Weekly: current day=${currentDay}, preferred=${desiredDay}` };
        }
        
        return { isDue: true, reason: 'Weekly frequency matched (morning window)' };
      }

      if (frequency === 'monthly') {
        const desiredDay = parseInt(String(prefs.dayOfMonth || ''), 10);
        const currentDay = now.getDate();
        
        if (Number.isFinite(desiredDay) && desiredDay !== currentDay) {
          return { isDue: false, reason: `Monthly: current day=${currentDay}, preferred=${desiredDay}` };
        }
        
        return { isDue: true, reason: 'Monthly frequency matched (morning window)' };
      }

      return { isDue: false, reason: 'Unknown frequency' };
    }

    // Check if user has already received newsletter today
    async function hasReceivedToday(userId: string, now: Date): Promise<boolean> {
      const startOfDay = new Date(now);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(now);
      endOfDay.setHours(23, 59, 59, 999);

      const existingLog = await prisma.emailLog.findFirst({
        where: {
          to: { contains: userId }, // Assuming email contains user info
          sentAt: {
            gte: startOfDay,
            lte: endOfDay
          },
          status: { in: ['SENT', 'DELIVERED'] }
        }
      });

      return !!existingLog;
    }

    // Enhanced user filtering with detailed logging
    const dueUsers = [];
    const skippedReasons = {
      notVerified: 0,
      notDue: 0,
      alreadyReceived: 0,
      noInterests: 0,
      invalidTime: 0
    };

    for (const user of users) {
      console.log(`[Manual Cron] Checking user: ${user.email}`);
      
      // Check email verification (for existing users, treat as verified if they have interests)
      const isVerified = user.emailVerified || user.userInterests.length > 0;
      if (!isVerified) {
        skippedReasons.notVerified++;
        console.log(`[Manual Cron] Skipping ${user.email}: not verified`);
        continue;
      }

      // Check if user has interests
      if (!user.userInterests || user.userInterests.length === 0) {
        skippedReasons.noInterests++;
        console.log(`[Manual Cron] Skipping ${user.email}: no interests set`);
        continue;
      }

      // Check if user is due for newsletter
      const dueCheck = isUserDueNow(user, now);
      if (!dueCheck.isDue) {
        skippedReasons.notDue++;
        console.log(`[Manual Cron] Skipping ${user.email}: ${dueCheck.reason}`);
        continue;
      }

      // Check if user already received newsletter today
      const alreadyReceived = await hasReceivedToday(user.id, now);
      if (alreadyReceived) {
        skippedReasons.alreadyReceived++;
        console.log(`[Manual Cron] Skipping ${user.email}: already received today`);
        continue;
      }

      console.log(`[Manual Cron] User ${user.email} is due for newsletter!`);
      dueUsers.push(user);
    }

    console.log(`[Manual Cron] Found ${dueUsers.length} users due for newsletter`);
    console.log(`[Manual Cron] Skipped:`, skippedReasons);

    if (dueUsers.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No users due for newsletter at this time',
        skippedReasons,
        currentTime: now.toISOString()
      });
    }

    // Send newsletters to due users
    const curation = new ContentCurationService();
    const emailSvc = new EmailService();

    let success = 0;
    let failed = 0;
    const results = [];

    for (const user of dueUsers) {
      try {
        console.log(`[Manual Cron] Sending newsletter to ${user.email}...`);
        
        const interests = user.userInterests?.map((i: any) => i.category) || [];
        const curated = await curation.curateContent(interests);
        
        const newsletter = {
          id: `manual-${Date.now()}-${user.id}`,
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

        const result = await emailSvc.sendNewsletter(
          {
            id: user.id,
            email: user.email,
            name: user.name || undefined,
            preferences: (user.preferences || {}) as any,
            role: 0 as any,
            isActive: true,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            preferredSendTime: user.preferredSendTime || undefined,
          } as any,
          newsletter
        );

        if (result.success > 0) {
          success++;
          results.push({ email: user.email, status: 'sent' });
          console.log(`[Manual Cron] Successfully sent to ${user.email}`);
        } else {
          failed++;
          results.push({ email: user.email, status: 'failed', error: result.error });
          console.log(`[Manual Cron] Failed to send to ${user.email}`);
        }

      } catch (error) {
        failed++;
        results.push({ email: user.email, status: 'error', error: error instanceof Error ? error.message : 'Unknown error' });
        console.error(`[Manual Cron] Error sending to ${user.email}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Manual cron completed: ${success} sent, ${failed} failed`,
      summary: {
        totalUsers: users.length,
        dueUsers: dueUsers.length,
        sent: success,
        failed: failed,
        skippedReasons
      },
      results,
      currentTime: now.toISOString()
    });

  } catch (error) {
    console.error('[Manual Cron] Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
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

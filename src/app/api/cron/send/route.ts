import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { EmailService } from '@/lib/email-service';
import { ContentCurationService } from '@/lib/content-curation';

export const dynamic = 'force-dynamic';

// Enhanced time formatting with timezone support
function formatTime(date: Date, timezone: string = 'UTC'): string {
  const options: Intl.DateTimeFormatOptions = {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  };
  
  const timeStr = date.toLocaleTimeString('en-US', options);
  return timeStr;
}

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

// Enhanced user due check with comprehensive logic
function isUserDueNow(user: any, now: Date): { isDue: boolean; reason: string } {
  // Check if user has preferred send time
  if (!user.preferredSendTime) {
    return { isDue: false, reason: 'No preferred send time set' };
  }

  // Parse preferences
  const prefs = parseUserPreferences(user.preferences);
  const frequency = (prefs.frequency || 'daily') as 'daily'|'weekly'|'monthly';

  // Check time match (with 5-minute tolerance for cron scheduling)
  const userTime = user.preferredSendTime;
  const currentTime = formatTime(now);
  
  // Extract hour and minute from user time (e.g., "08:30 AM")
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

  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  // Check if current time matches user's preferred time (within 5 minutes)
  const timeDiff = Math.abs((currentHour * 60 + currentMinute) - (userHour24 * 60 + parseInt(userMinute)));
  if (timeDiff > 5) {
    return { isDue: false, reason: `Time mismatch: current=${currentTime}, preferred=${userTime}` };
  }

  // Check frequency
  if (frequency === 'daily') {
    return { isDue: true, reason: 'Daily frequency matched' };
  }

  if (frequency === 'weekly') {
    const desiredDay = String(prefs.dayOfWeek || '').toLowerCase();
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    
    if (desiredDay && desiredDay !== currentDay) {
      return { isDue: false, reason: `Weekly: current day=${currentDay}, preferred=${desiredDay}` };
    }
    
    return { isDue: true, reason: 'Weekly frequency matched' };
  }

  if (frequency === 'monthly') {
    const desiredDay = parseInt(String(prefs.dayOfMonth || ''), 10);
    const currentDay = now.getDate();
    
    if (Number.isFinite(desiredDay) && desiredDay !== currentDay) {
      return { isDue: false, reason: `Monthly: current day=${currentDay}, preferred=${desiredDay}` };
    }
    
    return { isDue: true, reason: 'Monthly frequency matched' };
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

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  let processedUsers = 0;
  let skippedUsers = 0;
  
  try {
    // Enhanced security check
    const key = request.nextUrl.searchParams.get('key') || request.headers.get('x-cron-secret');
    const expected = process.env.CRON_SECRET;
    
    if (!expected) {
      console.error('[Cron] CRON_SECRET not configured');
      return NextResponse.json({ ok: false, error: 'Cron secret not configured' }, { status: 500 });
    }
    
    if (key !== expected) {
      console.error('[Cron] Unauthorized access attempt');
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    console.log(`[Cron] Starting newsletter delivery at ${now.toISOString()}`);

    // Connect to database
    await prisma.$connect();

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

    console.log(`[Cron] Found ${users.length} total active users with send times`);

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
      processedUsers++;
      
      // Check email verification (for existing users, treat as verified if they have interests)
      const isVerified = user.emailVerified || user.userInterests.length > 0;
      if (!isVerified) {
        skippedReasons.notVerified++;
        console.log(`[Cron] Skipping ${user.email}: not verified`);
        continue;
      }

      // Check if user has interests
      if (!user.userInterests || user.userInterests.length === 0) {
        skippedReasons.noInterests++;
        console.log(`[Cron] Skipping ${user.email}: no interests set`);
        continue;
      }

      // Check if user is due for newsletter
      const dueCheck = isUserDueNow(user, now);
      if (!dueCheck.isDue) {
        skippedReasons.notDue++;
        console.log(`[Cron] Skipping ${user.email}: ${dueCheck.reason}`);
        continue;
      }

      // Check if user already received newsletter today
      const alreadyReceived = await hasReceivedToday(user.id, now);
      if (alreadyReceived) {
        skippedReasons.alreadyReceived++;
        console.log(`[Cron] Skipping ${user.email}: already received today`);
        continue;
      }

      dueUsers.push(user);
      console.log(`[Cron] User ${user.email} is due: ${dueCheck.reason}`);
    }

    console.log(`[Cron] Processing summary:`, {
      total: users.length,
      due: dueUsers.length,
      skipped: skippedReasons
    });

    if (dueUsers.length === 0) {
      return NextResponse.json({ 
        ok: true, 
        sent: 0, 
        message: 'No users due at this time.',
        processed: processedUsers,
        skipped: skippedReasons
      });
    }

    // Initialize services
    const curation = new ContentCurationService();
    const emailSvc = new EmailService();

    let success = 0; 
    let failed = 0;
    const failedUsers: string[] = [];
    
    // Process each due user with comprehensive error handling
    for (const user of dueUsers) {
      try {
        console.log(`[Cron] Processing ${user.email}...`);
        
        // Get user interests
        const interests = user.userInterests?.map((i: any) => i.category) || [];
        console.log(`[Cron] User ${user.email} interests:`, interests);
        
        // Curate content
        const curated = await curation.curateContent(interests);
        console.log(`[Cron] Curated ${curated.sections?.length || 0} sections for ${user.email}`);
        
        // Create newsletter
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

        // Send newsletter
        const result = await emailSvc.sendNewsletter(newsletter, [
          {
            id: user.id,
            email: user.email,
            name: user.name || undefined,
            preferences: parseUserPreferences(user.preferences),
            role: 0 as any,
            isActive: true,
            createdAt: now,
            updatedAt: now,
            preferredSendTime: user.preferredSendTime || undefined,
          } as any,
        ]);
        
        success += result.success;
        failed += result.failed;
        
        // Log email delivery
        if (result.success > 0) {
          await prisma.emailLog.create({
            data: {
              to: user.email,
              subject: newsletter.title,
              status: 'SENT',
              sentAt: now,
              metadata: {
                userId: user.id,
                newsletterId: newsletter.id,
                interests: interests,
                preferences: parseUserPreferences(user.preferences)
              }
            }
          });
        }
        
        console.log(`[Cron] Result for ${user.email}: success=${result.success}, failed=${result.failed}`);
        
      } catch (e) {
        console.error(`[Cron] Error processing ${user.email}:`, e);
        failed += 1;
        failedUsers.push(user.email);
        
        // Log failed delivery
        await prisma.emailLog.create({
          data: {
            to: user.email,
            subject: 'Newsletter Delivery Failed',
            status: 'FAILED',
            sentAt: now,
            metadata: {
              userId: user.id,
              error: e instanceof Error ? e.message : 'Unknown error',
              stack: e instanceof Error ? e.stack : undefined
            }
          }
        });
      }
    }

    const duration = Date.now() - startTime;
    console.log(`[Cron] Completed in ${duration}ms: success=${success}, failed=${failed}`);
    
    return NextResponse.json({ 
      ok: true, 
      sent: success, 
      failed,
      processed: processedUsers,
      skipped: skippedReasons,
      failedUsers,
      duration: `${duration}ms`
    });
    
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[Cron] Unexpected error after ${duration}ms:`, error);
    
    return NextResponse.json({ 
      ok: false, 
      error: 'Internal error',
      details: error instanceof Error ? error.message : 'Unknown error',
      duration: `${duration}ms`
    }, { status: 500 });
  } finally {
    // Always disconnect from database
    try {
      await prisma.$disconnect();
    } catch (e) {
      console.error('[Cron] Error disconnecting from database:', e);
    }
  }
}



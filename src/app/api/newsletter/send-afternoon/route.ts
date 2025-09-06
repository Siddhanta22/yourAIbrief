import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { EmailService } from '@/lib/email-service';
import { ContentCurationService } from '@/lib/content-curation';

export const dynamic = 'force-dynamic';

// This endpoint handles afternoon/evening users since Hobby plan only allows one cron per day
export async function POST(request: NextRequest) {
  try {
    const { timeSlot = 'afternoon' } = await request.json();
    
    console.log(`[Send Afternoon] Starting ${timeSlot} newsletter delivery`);

    // Connect to database
    await prisma.$connect();

    const now = new Date();
    
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

    console.log(`[Send Afternoon] Found ${users.length} total users`);

    // Filter users for afternoon/evening times (12 PM - 11 PM)
    const afternoonUsers = users.filter(user => {
      if (!user.preferredSendTime) return false;
      
      const userTime = user.preferredSendTime;
      const userTimeMatch = userTime.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
      if (!userTimeMatch) return false;

      const [, userHour, userMinute, userAmPm] = userTimeMatch;
      let userHour24 = parseInt(userHour);
      if (userAmPm.toUpperCase() === 'PM' && userHour24 !== 12) {
        userHour24 += 12;
      } else if (userAmPm.toUpperCase() === 'AM' && userHour24 === 12) {
        userHour24 = 0;
      }

      // Afternoon/evening window: 12 PM - 11 PM
      const isAfternoonTime = userHour24 >= 12 || userHour24 <= 23;
      
      // Check if user is verified
      const isVerified = user.emailVerified || user.userInterests.length > 0;
      
      // Check if user already received today
      const hasReceived = false; // We'll check this in the main loop
      
      return isAfternoonTime && isVerified && user.userInterests.length > 0;
    });

    console.log(`[Send Afternoon] ${afternoonUsers.length} users for afternoon delivery`);

    if (afternoonUsers.length === 0) {
      return NextResponse.json({ 
        ok: true, 
        sent: 0, 
        message: 'No afternoon users due at this time.'
      });
    }

    const curation = new ContentCurationService();
    const emailSvc = new EmailService();

    let success = 0; 
    let failed = 0;
    const failedUsers: string[] = [];
    
    for (const user of afternoonUsers) {
      try {
        // Check if user already received today
        const startOfDay = new Date(now);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(now);
        endOfDay.setHours(23, 59, 59, 999);

        const existingLog = await prisma.emailLog.findFirst({
          where: {
            to: user.email,
            sentAt: {
              gte: startOfDay,
              lte: endOfDay
            },
            status: { in: ['SENT', 'DELIVERED'] }
          }
        });

        if (existingLog) {
          console.log(`[Send Afternoon] Skipping ${user.email}: already received today`);
          continue;
        }

        console.log(`[Send Afternoon] Processing ${user.email}...`);
        
        const interests = user.userInterests?.map((i: any) => i.category) || [];
        const curated = await curation.curateContent(interests);
        
        const newsletter = {
          id: `afternoon-${Date.now()}-${user.id}`,
          title: 'Your AI Brief (Afternoon Edition)',
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
            preferences: user.preferences || {},
            role: 0 as any,
            isActive: true,
            createdAt: now,
            updatedAt: now,
            preferredSendTime: user.preferredSendTime || undefined,
          } as any,
        ]);
        
        success += result.success;
        failed += result.failed;
        
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
                timeSlot: 'afternoon'
              }
            }
          });
        }
        
        console.log(`[Send Afternoon] Result for ${user.email}: success=${result.success}, failed=${result.failed}`);
        
      } catch (e) {
        console.error(`[Send Afternoon] Error processing ${user.email}:`, e);
        failed += 1;
        failedUsers.push(user.email);
      }
    }

    console.log(`[Send Afternoon] Completed: success=${success}, failed=${failed}`);
    
    return NextResponse.json({ 
      ok: true, 
      sent: success, 
      failed,
      failedUsers,
      timeSlot
    });
    
  } catch (error) {
    console.error('[Send Afternoon] Unexpected error:', error);
    return NextResponse.json({ 
      ok: false, 
      error: 'Internal error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    try {
      await prisma.$disconnect();
    } catch (e) {
      console.error('[Send Afternoon] Error disconnecting from database:', e);
    }
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

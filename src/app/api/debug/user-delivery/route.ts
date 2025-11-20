import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    
    if (!email) {
      return NextResponse.json({
        error: 'Email parameter required',
        example: '/api/debug/user-delivery?email=your-email@example.com'
      }, { status: 400 });
    }

    console.log(`[Debug] Checking delivery status for: ${email}`);

    // Get user data
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        userInterests: true,
      },
    });

    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'User not found',
        email
      }, { status: 404 });
    }

    // Parse preferences
    let preferences = {};
    try {
      if (user.preferences) {
        if (typeof user.preferences === 'string') {
          preferences = JSON.parse(user.preferences);
        } else {
          preferences = user.preferences;
        }
      }
    } catch (e) {
      console.warn('Failed to parse user preferences:', e);
    }

    const now = new Date();
    const userTime = user.preferredSendTime;
    
    // Check time matching logic
    let timeMatch = null;
    let userHour24 = null;
    if (userTime) {
      const userTimeMatch = userTime.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
      if (userTimeMatch) {
        const [, userHour, userMinute, userAmPm] = userTimeMatch;
        userHour24 = parseInt(userHour);
        if (userAmPm.toUpperCase() === 'PM' && userHour24 !== 12) {
          userHour24 += 12;
        } else if (userAmPm.toUpperCase() === 'AM' && userHour24 === 12) {
          userHour24 = 0;
        }
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        const timeDifference = Math.abs(currentHour - userHour24);
        const isTimeMatch = timeDifference === 0 || (timeDifference === 1 && currentMinute < 30);
        
        timeMatch = {
          original: userTime,
          hour24: userHour24,
          isTimeMatch: isTimeMatch,
          currentHour: currentHour,
          currentMinute: currentMinute,
          timeDifference: timeDifference
        };
      }
    }

    // Check if user would be due now
    // Parse user preferences to check interests
    let userPrefs: Record<string, any> = {};
    try {
      userPrefs = typeof user.preferences === 'string' ? JSON.parse(user.preferences) : (user.preferences as Record<string, any>) || {};
    } catch (e) {
      userPrefs = {};
    }
    
    const userInterests = (userPrefs.interests || []) as string[];
    const hasInterests = userInterests.length > 0 || user.userInterests.length > 0;
    const isVerified = user.emailVerified || hasInterests;
    const frequency = (preferences as any).frequency || 'daily';

    // Check if already received today
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

    // Get recent email logs
    const recentLogs = await prisma.emailLog.findMany({
      where: {
        to: user.email,
      },
      orderBy: {
        sentAt: 'desc'
      },
      take: 5
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isActive: user.isActive,
        emailVerified: user.emailVerified,
        preferredSendTime: user.preferredSendTime,
        preferences: preferences,
        interests: user.userInterests.map(i => i.category)
      },
      deliveryAnalysis: {
        isVerified,
        hasInterests,
        frequency,
        timeMatch,
        currentTime: {
          utc: now.toISOString(),
          local: now.toString(),
          hour: now.getHours(),
          day: now.toLocaleDateString('en-US', { weekday: 'long' })
        },
        wouldBeDue: isVerified && hasInterests && timeMatch?.isTimeMatch,
        alreadyReceivedToday: !!existingLog,
        existingLogToday: existingLog ? {
          id: existingLog.id,
          sentAt: existingLog.sentAt,
          status: existingLog.status,
          subject: existingLog.subject
        } : null
      },
      recentEmailLogs: recentLogs.map(log => ({
        id: log.id,
        sentAt: log.sentAt,
        status: log.status,
        subject: log.subject
      })),
      cronSchedule: {
        vercelCron: '0 * * * * (Every hour at :00)',
        note: 'Cron runs every hour, processes users whose preferred time matches current hour (within 1-hour window)'
      }
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });

  } catch (error) {
    console.error('[Debug] Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

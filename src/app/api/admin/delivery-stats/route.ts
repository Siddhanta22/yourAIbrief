import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const days = parseInt(request.nextUrl.searchParams.get('days') || '7');
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    console.log(`[Delivery Stats] Fetching stats for last ${days} days`);

    // Connect to database
    await prisma.$connect();

    // Get email delivery statistics
    const emailStats = await prisma.emailLog.groupBy({
      by: ['status'],
      where: {
        sentAt: {
          gte: cutoffDate
        }
      },
      _count: {
        status: true
      }
    });

    // Get user statistics
    const userStats = await prisma.user.groupBy({
      by: ['isActive', 'emailVerified'],
      _count: {
        id: true
      }
    });

    // Get users with preferences
    const usersWithPreferences = await prisma.user.count({
      where: {
        isActive: true,
        preferredSendTime: { not: null }
      }
    });

    // Get users with interests
    const usersWithInterests = await prisma.user.count({
      where: {
        isActive: true,
        userInterests: {
          some: {}
        }
      }
    });

    // Get recent delivery attempts
    const recentDeliveries = await prisma.emailLog.findMany({
      where: {
        sentAt: {
          gte: cutoffDate
        }
      },
      orderBy: {
        sentAt: 'desc'
      },
      take: 50,
      select: {
        id: true,
        to: true,
        subject: true,
        status: true,
        sentAt: true,
        metadata: true
      }
    });

    // Get failed deliveries that need retry
    const failedDeliveries = await prisma.emailLog.findMany({
      where: {
        status: 'FAILED',
        sentAt: {
          gte: cutoffDate
        }
      },
      orderBy: {
        sentAt: 'desc'
      },
      take: 20
    });

    // Calculate success rate
    const totalEmails = emailStats.reduce((sum, stat) => sum + stat._count.status, 0);
    const successfulEmails = emailStats.find(stat => stat.status === 'SENT')?._count.status || 0;
    const failedEmails = emailStats.find(stat => stat.status === 'FAILED')?._count.status || 0;
    const successRate = totalEmails > 0 ? (successfulEmails / totalEmails) * 100 : 0;

    // Get time-based delivery stats
    const hourlyStats = await prisma.$queryRaw`
      SELECT 
        EXTRACT(hour FROM "sentAt") as hour,
        status,
        COUNT(*) as count
      FROM "EmailLog"
      WHERE "sentAt" >= ${cutoffDate}
      GROUP BY EXTRACT(hour FROM "sentAt"), status
      ORDER BY hour, status
    `;

    const stats = {
      summary: {
        totalUsers: userStats.reduce((sum, stat) => sum + stat._count.id, 0),
        activeUsers: userStats.filter(stat => stat.isActive).reduce((sum, stat) => sum + stat._count.id, 0),
        verifiedUsers: userStats.filter(stat => stat.emailVerified).reduce((sum, stat) => sum + stat._count.id, 0),
        usersWithPreferences,
        usersWithInterests,
        totalEmails,
        successfulEmails,
        failedEmails,
        successRate: Math.round(successRate * 100) / 100
      },
      emailStats: emailStats.map(stat => ({
        status: stat.status,
        count: stat._count.status
      })),
      userStats: userStats.map(stat => ({
        isActive: stat.isActive,
        emailVerified: stat.emailVerified,
        count: stat._count.id
      })),
      recentDeliveries: recentDeliveries.map(delivery => ({
        id: delivery.id,
        to: delivery.to,
        subject: delivery.subject,
        status: delivery.status,
        sentAt: delivery.sentAt,
        userId: (delivery.metadata as any)?.userId,
        error: (delivery.metadata as any)?.error
      })),
      failedDeliveries: failedDeliveries.map(delivery => ({
        id: delivery.id,
        to: delivery.to,
        subject: delivery.subject,
        sentAt: delivery.sentAt,
        userId: (delivery.metadata as any)?.userId,
        error: (delivery.metadata as any)?.error,
        retryCount: (delivery.metadata as any)?.retryCount || 0
      })),
      hourlyStats,
      period: {
        days,
        from: cutoffDate.toISOString(),
        to: new Date().toISOString()
      }
    };

    console.log(`[Delivery Stats] Generated stats:`, {
      totalUsers: stats.summary.totalUsers,
      activeUsers: stats.summary.activeUsers,
      successRate: stats.summary.successRate
    });

    return NextResponse.json(stats);

  } catch (error) {
    console.error('[Delivery Stats] Error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    try {
      await prisma.$disconnect();
    } catch (e) {
      console.error('[Delivery Stats] Error disconnecting from database:', e);
    }
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

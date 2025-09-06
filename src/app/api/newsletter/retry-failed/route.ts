import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { EmailService } from '@/lib/email-service';
import { ContentCurationService } from '@/lib/content-curation';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { hours = 24, maxRetries = 3 } = await request.json();
    
    console.log(`[Retry Failed] Starting retry process for last ${hours} hours`);

    // Connect to database
    await prisma.$connect();

    // Find failed email deliveries in the last N hours
    const cutoffTime = new Date();
    cutoffTime.setHours(cutoffTime.getHours() - hours);

    const failedLogs = await prisma.emailLog.findMany({
      where: {
        status: 'FAILED',
        sentAt: {
          gte: cutoffTime
        },
        metadata: {
          path: ['retryCount'],
          lt: maxRetries
        }
      },
      orderBy: {
        sentAt: 'desc'
      }
    });

    console.log(`[Retry Failed] Found ${failedLogs.length} failed deliveries to retry`);

    if (failedLogs.length === 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'No failed deliveries to retry',
        retried: 0
      });
    }

    const emailSvc = new EmailService();
    const curation = new ContentCurationService();
    
    let retried = 0;
    let stillFailed = 0;

    for (const log of failedLogs) {
      try {
        const metadata = log.metadata as any;
        const userId = metadata?.userId;
        
        if (!userId) {
          console.warn(`[Retry Failed] No userId in metadata for log ${log.id}`);
          continue;
        }

        // Get user details
        const user = await prisma.user.findUnique({
          where: { id: userId },
          include: {
            userInterests: true,
          },
        });

        if (!user || !user.isActive) {
          console.warn(`[Retry Failed] User ${userId} not found or inactive`);
          continue;
        }

        // Check if user is still verified
        const isVerified = user.emailVerified || user.userInterests.length > 0;
        if (!isVerified) {
          console.warn(`[Retry Failed] User ${user.email} not verified`);
          continue;
        }

        console.log(`[Retry Failed] Retrying newsletter for ${user.email}`);

        // Get user interests and curate content
        const interests = user.userInterests?.map((i: any) => i.category) || [];
        const curated = await curation.curateContent(interests);
        
        // Create newsletter
        const newsletter = {
          id: `retry-${Date.now()}-${user.id}`,
          title: 'Your AI Brief (Retry)',
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
            preferences: user.preferences || {},
            role: 0 as any,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            preferredSendTime: user.preferredSendTime || undefined,
          } as any,
        ]);

        if (result.success > 0) {
          retried++;
          console.log(`[Retry Failed] Successfully retried newsletter for ${user.email}`);
          
          // Update the original log
          await prisma.emailLog.update({
            where: { id: log.id },
            data: {
              status: 'SENT',
              metadata: {
                ...metadata,
                retryCount: (metadata?.retryCount || 0) + 1,
                retriedAt: new Date().toISOString(),
                originalFailure: metadata?.error
              }
            }
          });
        } else {
          stillFailed++;
          console.error(`[Retry Failed] Still failed to send to ${user.email}`);
          
          // Update retry count
          await prisma.emailLog.update({
            where: { id: log.id },
            data: {
              metadata: {
                ...metadata,
                retryCount: (metadata?.retryCount || 0) + 1,
                lastRetryAt: new Date().toISOString(),
                lastRetryError: result.failed > 0 ? 'SendGrid error' : 'Unknown error'
              }
            }
          });
        }

      } catch (error) {
        console.error(`[Retry Failed] Error retrying log ${log.id}:`, error);
        stillFailed++;
      }
    }

    console.log(`[Retry Failed] Completed: ${retried} retried, ${stillFailed} still failed`);

    return NextResponse.json({ 
      success: true, 
      retried,
      stillFailed,
      total: failedLogs.length
    });

  } catch (error) {
    console.error('[Retry Failed] Unexpected error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    try {
      await prisma.$disconnect();
    } catch (e) {
      console.error('[Retry Failed] Error disconnecting from database:', e);
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

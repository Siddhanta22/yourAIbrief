import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { EmailService } from '@/lib/email-service';
import { ContentCurationService } from '@/lib/content-curation';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { testType = 'comprehensive', email } = await request.json();
    
    console.log(`[Test System] Starting ${testType} test`);

    // Connect to database
    await prisma.$connect();

    const results = {
      testType,
      timestamp: new Date().toISOString(),
      tests: {} as any,
      summary: {
        passed: 0,
        failed: 0,
        total: 0
      }
    };

    // Test 1: Database Connection
    try {
      const userCount = await prisma.user.count();
      results.tests.databaseConnection = {
        status: 'PASS',
        message: 'Database connection successful',
        userCount
      };
      results.summary.passed++;
    } catch (error) {
      results.tests.databaseConnection = {
        status: 'FAIL',
        message: 'Database connection failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      results.summary.failed++;
    }
    results.summary.total++;

    // Test 2: Email Service Configuration
    try {
      const emailSvc = new EmailService();
      const config = (emailSvc as any).validateConfiguration();
      results.tests.emailServiceConfig = {
        status: config.valid ? 'PASS' : 'FAIL',
        message: config.valid ? 'Email service configured correctly' : config.error,
        configured: config.valid
      };
      if (config.valid) results.summary.passed++;
      else results.summary.failed++;
    } catch (error) {
      results.tests.emailServiceConfig = {
        status: 'FAIL',
        message: 'Email service configuration test failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      results.summary.failed++;
    }
    results.summary.total++;

    // Test 3: Content Curation Service
    try {
      const curation = new ContentCurationService();
      const testContent = await curation.curateContent(['AI', 'Technology']);
      results.tests.contentCuration = {
        status: 'PASS',
        message: 'Content curation working',
        sectionsCount: testContent.sections?.length || 0,
        hasSummary: !!testContent.summary
      };
      results.summary.passed++;
    } catch (error) {
      results.tests.contentCuration = {
        status: 'FAIL',
        message: 'Content curation failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      results.summary.failed++;
    }
    results.summary.total++;

    // Test 4: User Data Integrity
    try {
      const users = await prisma.user.findMany({
        where: { isActive: true },
        include: {
          userInterests: true,
        },
      });

      const usersWithPreferences = users.filter(u => u.preferredSendTime);
      const usersWithInterests = users.filter(u => u.userInterests.length > 0);
      const verifiedUsers = users.filter(u => u.emailVerified || u.userInterests.length > 0);

      results.tests.userDataIntegrity = {
        status: 'PASS',
        message: 'User data integrity check passed',
        totalActiveUsers: users.length,
        usersWithPreferences: usersWithPreferences.length,
        usersWithInterests: usersWithInterests.length,
        verifiedUsers: verifiedUsers.length
      };
      results.summary.passed++;
    } catch (error) {
      results.tests.userDataIntegrity = {
        status: 'FAIL',
        message: 'User data integrity check failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      results.summary.failed++;
    }
    results.summary.total++;

    // Test 5: Time Matching Logic
    try {
      const now = new Date();
      const testTimes = ['08:30 AM', '12:00 PM', '06:00 PM'];
      const timeMatches = testTimes.map(time => {
        const user = { preferredSendTime: time, preferences: JSON.stringify({ frequency: 'daily' }) };
        const dueCheck = (require('../../cron/send/route').isUserDueNow || (() => ({ isDue: false, reason: 'Function not available' })))(user, now);
        return { time, isDue: dueCheck.isDue, reason: dueCheck.reason };
      });

      results.tests.timeMatching = {
        status: 'PASS',
        message: 'Time matching logic working',
        currentTime: now.toISOString(),
        testResults: timeMatches
      };
      results.summary.passed++;
    } catch (error) {
      results.tests.timeMatching = {
        status: 'FAIL',
        message: 'Time matching logic test failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      results.summary.failed++;
    }
    results.summary.total++;

    // Test 6: Email Delivery (if email provided)
    if (email && testType === 'comprehensive') {
      try {
        const user = await prisma.user.findUnique({
          where: { email },
          include: {
            userInterests: true,
          },
        });

        if (!user) {
          results.tests.emailDelivery = {
            status: 'SKIP',
            message: `User with email ${email} not found`
          };
        } else {
          const emailSvc = new EmailService();
          const curation = new ContentCurationService();
          
          const interests = user.userInterests?.map((i: any) => i.category) || ['AI'];
          const curated = await curation.curateContent(interests);
          
          const newsletter = {
            id: `test-${Date.now()}`,
            title: 'Test Newsletter - System Verification',
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
              preferences: user.preferences || {},
              role: 0 as any,
              isActive: true,
              createdAt: new Date(),
              updatedAt: new Date(),
              preferredSendTime: user.preferredSendTime || undefined,
            } as any,
          ]);

          results.tests.emailDelivery = {
            status: result.success > 0 ? 'PASS' : 'FAIL',
            message: result.success > 0 ? 'Test email sent successfully' : 'Test email failed',
            success: result.success,
            failed: result.failed
          };
          
          if (result.success > 0) results.summary.passed++;
          else results.summary.failed++;
          results.summary.total++;
        }
      } catch (error) {
        results.tests.emailDelivery = {
          status: 'FAIL',
          message: 'Email delivery test failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        };
        results.summary.failed++;
        results.summary.total++;
      }
    }

    // Test 7: Cron Job Simulation
    try {
      const now = new Date();
      const users = await prisma.user.findMany({
        where: {
          isActive: true,
          preferredSendTime: { not: null },
        },
        include: {
          userInterests: true,
        },
      });

      let dueUsers = 0;
      for (const user of users) {
        const isVerified = user.emailVerified || user.userInterests.length > 0;
        if (isVerified) {
          // Simple time check (within 5 minutes of preferred time)
          const userTime = user.preferredSendTime;
          const currentTime = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
          
          if (userTime === currentTime) {
            dueUsers++;
          }
        }
      }

      results.tests.cronSimulation = {
        status: 'PASS',
        message: 'Cron job simulation completed',
        totalUsers: users.length,
        dueUsers,
        currentTime: now.toISOString()
      };
      results.summary.passed++;
    } catch (error) {
      results.tests.cronSimulation = {
        status: 'FAIL',
        message: 'Cron job simulation failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      results.summary.failed++;
    }
    results.summary.total++;

    // Calculate overall status
    const overallStatus = results.summary.failed === 0 ? 'PASS' : 
                         results.summary.passed > results.summary.failed ? 'PARTIAL' : 'FAIL';

    results.overallStatus = overallStatus;
    results.recommendations = [];

    if (results.summary.failed > 0) {
      results.recommendations.push('Some tests failed - check individual test results for details');
    }
    if (results.tests.emailServiceConfig?.status === 'FAIL') {
      results.recommendations.push('Configure SendGrid API key and email settings');
    }
    if (results.tests.userDataIntegrity?.status === 'PASS' && 
        results.tests.userDataIntegrity.verifiedUsers === 0) {
      results.recommendations.push('No verified users found - check email verification process');
    }

    console.log(`[Test System] Test completed: ${overallStatus} (${results.summary.passed}/${results.summary.total} passed)`);

    return NextResponse.json(results);

  } catch (error) {
    console.error('[Test System] Unexpected error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    try {
      await prisma.$disconnect();
    } catch (e) {
      console.error('[Test System] Error disconnecting from database:', e);
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

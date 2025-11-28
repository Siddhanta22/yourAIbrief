import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { z } from 'zod';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

const updateSchema = z.object({
  name: z.string().optional(),
  frequency: z.enum(['daily','weekly','monthly']).optional(),
  preferredSendTime: z.string().min(1).optional(),
  topics: z.array(z.string()).optional(),
});

export async function GET(req: NextRequest) {
  try {
    // Get user from session instead of email query param
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ 
        success: false, 
        message: 'Unauthorized' 
      }, { 
        status: 401,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      });
    }
    
    const user = await prisma.user.findUnique({ 
      where: { email: session.user.email }, 
      include: { userInterests: true } 
    });
    
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        message: 'User not found' 
      }, { 
        status: 404,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      });
    }
    
    return NextResponse.json({
      success: true,
      name: user.name,
      preferredSendTime: user.preferredSendTime ?? null,
      preferences: user.preferences ?? {},
      topics: user.userInterests.map(ui => ui.category),
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });
  } catch (error) {
    console.error('Get preferences error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to fetch preferences',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    // Get user from session instead of email from request body
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ 
        success: false, 
        message: 'Unauthorized' 
      }, { 
        status: 401,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      });
    }

    let body;
    try {
      body = await req.json();
    } catch (jsonError) {
      return NextResponse.json({
        success: false,
        message: 'Invalid JSON in request body'
      }, { 
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      });
    }

    const { name, frequency, preferredSendTime, topics } = updateSchema.parse(body);
    const email = session.user.email;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (!existing) {
      return NextResponse.json({ 
        success: false, 
        message: 'User not found' 
      }, { 
        status: 404,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      });
    }

    const newPrefs: any = { ...(existing.preferences as any) };
    if (frequency) newPrefs.frequency = frequency;

    let updated;
    if (Array.isArray(topics)) {
      updated = await prisma.$transaction(async (tx) => {
        const u = await tx.user.update({
          where: { email },
          data: {
            name: name !== undefined ? name : existing.name,
            preferredSendTime: preferredSendTime ?? existing.preferredSendTime ?? null,
            preferences: newPrefs,
          },
        });
        await tx.userInterest.deleteMany({ where: { userId: u.id } });
        if (topics.length > 0) {
          await tx.userInterest.createMany({
            data: topics.map((category) => ({ userId: u.id, category })),
            skipDuplicates: true,
          });
        }
        return u;
      });
    } else {
      updated = await prisma.user.update({
        where: { email },
        data: {
          name: name !== undefined ? name : existing.name,
          preferredSendTime: preferredSendTime ?? existing.preferredSendTime ?? null,
          preferences: newPrefs,
        },
      });
    }

    const interests = await prisma.userInterest.findMany({ where: { userId: updated.id } });
    return NextResponse.json({ 
      success: true, 
      user: { 
        email: updated.email, 
        name: updated.name, 
        preferredSendTime: updated.preferredSendTime, 
        preferences: updated.preferences, 
        topics: interests.map(i => i.category) 
      } 
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });
  } catch (e) {
    console.error('Preferences update error:', e);
    
    // Handle Zod validation errors
    if (e instanceof z.ZodError) {
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid request data',
        errors: e.errors
      }, { 
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      });
    }
    
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to update preferences',
      error: e instanceof Error ? e.message : 'Unknown error'
    }, { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });
  }
}



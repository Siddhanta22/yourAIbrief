import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const email = request.nextUrl.searchParams.get('email');
    
    if (!email) {
      return NextResponse.json({ error: 'Email parameter is required' }, { status: 400 });
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

    // Check verification status
    const isVerified = user.emailVerified || user.userInterests.length > 0;
    
    // Parse preferences
    let preferences = {};
    try {
      preferences = user.preferences ? JSON.parse(user.preferences as string) : {};
    } catch (e) {
      preferences = user.preferences || {};
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isActive: user.isActive,
        emailVerified: user.emailVerified,
        isVerified: isVerified,
        preferredSendTime: user.preferredSendTime,
        preferences: preferences,
        interests: user.userInterests?.map((i: any) => i.category) || [],
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      debug: {
        hasInterests: user.userInterests.length > 0,
        interestsCount: user.userInterests.length,
        preferencesString: user.preferences,
        preferencesParsed: preferences,
      }
    });

  } catch (error) {
    console.error('[Debug User] Error:', error);
    return NextResponse.json({ 
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
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
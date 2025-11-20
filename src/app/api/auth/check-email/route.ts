import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();
    
    if (!email || !email.includes('@')) {
      return NextResponse.json({
        success: false,
        message: 'Valid email is required'
      }, { status: 400 });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        emailVerified: true,
        isActive: true,
        preferences: true,
        preferredSendTime: true
      }
    });

    if (user) {
      // User exists - return user data for dashboard
      return NextResponse.json({
        success: true,
        userExists: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          emailVerified: user.emailVerified,
          isActive: user.isActive,
          preferences: user.preferences,
          preferredSendTime: user.preferredSendTime
        },
        message: 'User found - redirecting to dashboard'
      });
    } else {
      // User doesn't exist - proceed with registration
      return NextResponse.json({
        success: true,
        userExists: false,
        message: 'New user - proceed with registration'
      });
    }

  } catch (error) {
    console.error('Check email error:', error);
    return NextResponse.json({
      success: false,
      message: 'Error checking email',
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


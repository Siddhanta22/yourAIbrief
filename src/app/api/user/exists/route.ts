import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ success: false, message: 'Email parameter is required' }, { status: 400 });
    }

    // Check if DATABASE_URL is configured
    if (!process.env.DATABASE_URL) {
      console.warn('DATABASE_URL not configured, returning default response');
      return NextResponse.json({
        exists: false,
        message: 'Database not configured - treating as new user'
      });
    }

    // Test database connection
    await prisma.$connect();

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        userInterests: true,
      },
    });

    if (!user) {
      return NextResponse.json({ exists: false });
    }

    const userPreferences = user.preferences as any;

    // For existing users who signed up before email confirmation was implemented,
    // treat them as verified if they have userInterests (meaning they completed signup)
    const isVerified = user.emailVerified || user.userInterests.length > 0;

    const response = NextResponse.json({
      exists: true,
      name: user.name,
      emailVerified: !!isVerified,
      isActive: user.isActive,
      preferredSendTime: user.preferredSendTime,
      frequency: userPreferences?.frequency || 'daily',
      interests: user.userInterests.map(ui => ui.category),
    });

    // Add CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    return response;

  } catch (error) {
    console.error('User exists check error:', error);
    
    // Return a safe fallback response instead of 500 error
    const fallbackResponse = NextResponse.json({
      exists: false,
      message: 'Database error - treating as new user',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    
    // Add CORS headers
    fallbackResponse.headers.set('Access-Control-Allow-Origin', '*');
    fallbackResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    fallbackResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    return fallbackResponse;
  } finally {
    try {
      await prisma.$disconnect();
    } catch (disconnectError) {
      console.error('Error disconnecting from database:', disconnectError);
    }
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
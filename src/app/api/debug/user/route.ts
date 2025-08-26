import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email parameter required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        userInterests: true,
      },
    });

    if (!user) {
      return NextResponse.json({ 
        exists: false, 
        message: 'User not found' 
      });
    }

    // For existing users who signed up before email confirmation was implemented,
    // treat them as verified if they have userInterests (meaning they completed signup)
    const isVerified = user.emailVerified || user.userInterests.length > 0;

    return NextResponse.json({
      exists: true,
      user: {
        id: user.id,
        email: user.email,
        emailVerified: user.emailVerified,
        isActive: user.isActive,
        preferences: user.preferences,
        userInterests: user.userInterests,
      },
      emailVerified: !!isVerified,
      verificationLogic: {
        hasEmailVerified: !!user.emailVerified,
        hasUserInterests: user.userInterests.length > 0,
        finalVerification: isVerified
      },
      message: 'User found'
    });

  } catch (error) {
    console.error('Debug user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

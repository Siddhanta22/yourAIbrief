import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ success: false, message: 'Email parameter is required' }, { status: 400 });
    }

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

    return NextResponse.json({
      exists: true,
      name: user.name,
      emailVerified: !!isVerified,
      preferredSendTime: user.preferredSendTime,
      frequency: userPreferences?.frequency || 'daily',
      interests: user.userInterests.map(ui => ui.category),
    });

  } catch (error) {
    console.error('User exists check error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
} 
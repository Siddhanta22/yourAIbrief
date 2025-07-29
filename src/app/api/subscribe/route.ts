import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { UserRole } from '@/types';

const prisma = new PrismaClient();

const subscribeSchema = z.object({
  email: z.string().email(),
  interests: z.array(z.string()).min(1),
  preferredSendTime: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, interests, preferredSendTime } = subscribeSchema.parse(body);

    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { email },
      include: { userInterests: true },
    });

    if (!user) {
      // Create new user
      user = await prisma.user.create({
        data: {
          email,
          role: 'SUBSCRIBER',
          preferredSendTime,
          userInterests: {
            create: interests.map(interest => ({
              category: interest,
              weight: 1.0,
            })),
          },
        },
        include: { userInterests: true },
      });
      // Send welcome email only for new users
      let emailSent = false;
    try {
      const EmailService = (await import('@/lib/email-service')).EmailService;
      const emailService = new EmailService();
        // Patch user object to match app User type
        const { id, email: userEmail, name, preferences, role, isActive, createdAt, updatedAt } = user;
        let safePreferences: Record<string, any> | undefined = undefined;
        if (preferences && typeof preferences === 'object' && !Array.isArray(preferences)) {
          safePreferences = preferences as Record<string, any>;
        }
        const patchedUser = {
          id,
          email: userEmail,
          name: name || undefined,
          preferences: safePreferences,
          role: (role === 'ADMIN' ? UserRole.ADMIN : role === 'EDITOR' ? UserRole.EDITOR : role === 'PREMIUM' ? UserRole.PREMIUM : UserRole.SUBSCRIBER),
          isActive,
          createdAt,
          updatedAt,
        };
        emailSent = await emailService.sendWelcomeEmail(patchedUser);
    } catch (e) {
      console.error('Failed to send welcome email:', e);
    }
    return NextResponse.json({
      success: true,
        message: emailSent
          ? 'Successfully subscribed to AI Newsletter. Welcome email sent!'
          : 'Successfully subscribed, but failed to send welcome email.',
      user: {
        id: user.id,
        email: user.email,
        interests: user.userInterests.map((ui: any) => ui.category),
          preferredSendTime: user.preferredSendTime,
        },
        alreadySubscribed: false,
        emailSent,
      });
    } else {
      // User already exists, do not send welcome email again
      return NextResponse.json({
        success: false,
        message: 'You are already subscribed with this email address.',
        alreadySubscribed: true,
    });
    }
  } catch (error) {
    console.error('Subscription error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: 'Invalid input data', errors: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Add DELETE handler for unsubscribe
export async function DELETE(request: NextRequest) {
  try {
    const { email, reason } = await request.json();
    if (!email) {
      return NextResponse.json({ success: false, message: 'Email is required.' }, { status: 400 });
    }
    // Optionally log the reason somewhere
    // Remove user from DB
    await prisma.user.delete({ where: { email } });
    return NextResponse.json({ success: true, message: 'You have been unsubscribed.' });
  } catch (error) {
    console.error('Unsubscribe error:', error);
    return NextResponse.json({ success: false, message: 'Failed to unsubscribe.' }, { status: 500 });
  }
} 
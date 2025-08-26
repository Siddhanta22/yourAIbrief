import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/?error=invalid-token`);
    }

    // Find and validate the verification token
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!verificationToken) {
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/?error=invalid-token`);
    }

    if (verificationToken.expires < new Date()) {
      // Clean up expired token
      await prisma.verificationToken.delete({
        where: { token },
      });
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/?error=expired-token`);
    }

    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email: verificationToken.identifier },
      include: { userInterests: true },
    });

    if (!user) {
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/?error=user-not-found`);
    }

    // Mark user as verified
    await prisma.user.update({
      where: { email: verificationToken.identifier },
      data: { emailVerified: new Date() },
    });

    // Clean up the verification token
    await prisma.verificationToken.delete({
      where: { token },
    });

    // Send welcome email
    try {
      const EmailService = (await import('@/lib/email-service')).EmailService;
      const emailService = new EmailService();
      
      const { id, email: userEmail, name, preferences, role, isActive, createdAt, updatedAt } = user;
      const patchedUser = {
        id,
        email: userEmail,
        name: name || undefined,
        preferences: preferences as any,
        role: role as any,
        isActive,
        createdAt,
        updatedAt,
      };
      
      await emailService.sendWelcomeEmail(patchedUser);
    } catch (error) {
      console.error('Failed to send welcome email:', error);
    }

    // Redirect to success page
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/?success=email-confirmed`);

  } catch (error) {
    console.error('Email confirmation error:', error);
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/?error=confirmation-failed`);
  }
}

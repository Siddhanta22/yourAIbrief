import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SimpleEmailService } from '@/lib/simple-email';
import { createSignInToken, buildVerifyLink } from '@/lib/verificationToken';

export const dynamic = 'force-dynamic';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Sends a one-time sign-in link for an existing account. Used by the
// homepage "returning user" path instead of establishing a session directly.
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { success: false, message: 'Valid email is required' },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

    // Don't reveal whether the account exists.
    if (!user) {
      return NextResponse.json(
        { success: true, message: 'If an account exists for that email, a sign-in link has been sent.' },
        { headers: CORS_HEADERS }
      );
    }

    const token = await createSignInToken(normalizedEmail);
    const baseUrl = process.env.NEXTAUTH_URL || request.nextUrl.origin;
    const link = buildVerifyLink(normalizedEmail, token, baseUrl);

    const emailService = new SimpleEmailService();
    await emailService.sendSignInEmail(normalizedEmail, link, user.name || undefined);

    return NextResponse.json(
      { success: true, message: 'Check your email for a sign-in link.' },
      { headers: CORS_HEADERS }
    );
  } catch (error) {
    console.error('[Request Signin] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to send sign-in email' },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: CORS_HEADERS });
}

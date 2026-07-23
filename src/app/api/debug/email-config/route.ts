import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/requireAdmin';

export async function GET(request: NextRequest) {
  const unauthorized = await requireAdmin();
  if (unauthorized) return unauthorized;

  try {
    const config = {
      resendApiKey: process.env.RESEND_API_KEY ? 'Set' : 'Not set',
      resendFromEmail: process.env.RESEND_FROM_EMAIL || 'Not set',
      resendFromName: process.env.RESEND_FROM_NAME || 'Not set',
      nextauthUrl: process.env.NEXTAUTH_URL || 'Not set',
      cronSecret: process.env.CRON_SECRET ? 'Set' : 'Not set',
    };

    return NextResponse.json({
      success: true,
      config,
      message: 'Email configuration check'
    });

  } catch (error) {
    console.error('Email config check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

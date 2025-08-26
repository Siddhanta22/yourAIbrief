import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const config = {
      sendgridApiKey: process.env.SENDGRID_API_KEY ? 'Set' : 'Not set',
      sendgridFromEmail: process.env.SENDGRID_FROM_EMAIL || 'Not set',
      sendgridFromName: process.env.SENDGRID_FROM_NAME || 'Not set',
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

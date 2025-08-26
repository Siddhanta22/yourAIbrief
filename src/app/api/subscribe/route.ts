import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@/types';
import crypto from 'crypto';

const subscribeSchema = z.object({
  name: z.string().optional(),
  email: z.string().email(),
  interests: z.array(z.string()).min(1),
  preferredSendTime: z.string().min(1),
  frequency: z.enum(['daily','weekly','monthly']).optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Test database connection
    await prisma.$connect();
    
    const body = await request.json();
    const { name, email, interests, preferredSendTime, frequency } = subscribeSchema.parse(body);

    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { email },
      include: { userInterests: true },
    });

    if (user) {
      // If user exists and is verified, return success
      if (user.emailVerified) {
        const userPreferences = user.preferences as any;
        const response = NextResponse.json({
          success: true,
          message: 'You are already subscribed to our newsletter!',
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            interests: user.userInterests.map(ui => ui.category),
            frequency: userPreferences?.frequency || 'daily',
            preferredSendTime: user.preferredSendTime,
          },
        });
        
        // Add CORS headers
        response.headers.set('Access-Control-Allow-Origin', '*');
        response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        
        return response;
      } else {
        // User exists but not verified - send new confirmation email
        await sendConfirmationEmail(email, interests, preferredSendTime, frequency);
        const response = NextResponse.json({
          success: true,
          message: 'Confirmation email sent! Please check your inbox to complete your subscription.',
        });
        
        // Add CORS headers
        response.headers.set('Access-Control-Allow-Origin', '*');
        response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        
        return response;
      }
    }

    // Create new unverified user
    user = await prisma.user.create({
      data: {
        name: name || null,
        email,
        role: 'SUBSCRIBER',
        preferredSendTime,
        preferences: frequency ? { frequency } : {},
        userInterests: {
          create: interests.map(interest => ({
            category: interest,
            weight: 1.0,
          })),
        },
      },
      include: { userInterests: true },
    });

    // Send confirmation email
    await sendConfirmationEmail(email, interests, preferredSendTime, frequency);

    const response = NextResponse.json({
      success: true,
      message: 'Confirmation email sent! Please check your inbox to complete your subscription.',
    });
    
    // Add CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    return response;

  } catch (error) {
    console.error('Subscription error:', error);
    let errorResponse;
    
    if (error instanceof z.ZodError) {
      errorResponse = NextResponse.json(
        { success: false, message: 'Invalid input data', errors: error.errors },
        { status: 400 }
      );
    } else {
      errorResponse = NextResponse.json(
        { success: false, message: 'Internal server error', error: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      );
    }
    
    // Add CORS headers to error response
    errorResponse.headers.set('Access-Control-Allow-Origin', '*');
    errorResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    errorResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    return errorResponse;
  } finally {
    await prisma.$disconnect();
  }
}

async function sendConfirmationEmail(
  email: string, 
  interests: string[], 
  preferredSendTime: string, 
  frequency?: string
) {
  try {
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Store verification token
    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token,
        expires,
      },
    });

    // Store pending preferences in token metadata
    const EmailService = (await import('@/lib/email-service')).EmailService;
    const emailService = new EmailService();
    
    await emailService.sendConfirmationEmail(email, token, {
      interests,
      preferredSendTime,
      frequency: frequency || 'daily',
    });

  } catch (error) {
    console.error('Failed to send confirmation email:', error);
    throw error;
  }
}

export async function GET(request: NextRequest) {
  const response = NextResponse.json({ 
    success: true, 
    message: 'Subscribe API is working!',
    methods: ['POST', 'DELETE', 'OPTIONS'],
    timestamp: new Date().toISOString()
  });
  
  // Add CORS headers
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  return response;
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
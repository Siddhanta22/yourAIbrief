import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SimpleEmailService } from '@/lib/simple-email';

export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    success: true, 
    message: 'Subscribe API GET is working!',
    timestamp: new Date().toISOString()
  }, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }
  });
}

export async function POST(request: NextRequest) {
  console.log('POST /api/subscribe called');
  
  try {
    const body = await request.json();
    console.log('Request body:', body);
    
    const { name, email, interests, preferredSendTime, frequency } = body;
    
    // Validate required fields
    if (!email || !email.includes('@')) {
      return NextResponse.json({
        success: false,
        message: 'Valid email is required'
      }, { 
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      });
    }
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      return NextResponse.json({
        success: false,
        alreadySubscribed: true,
        message: 'You are already subscribed with this email address.'
      }, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      });
    }
    
    // Create new user
    const user = await prisma.user.create({
      data: {
        email,
        name: name || '',
        preferredSendTime: preferredSendTime || '08:00',
        preferences: {
          interests: interests || [],
          frequency: frequency || 'daily'
        },
        isActive: true,
        emailVerified: null
      }
    });
    
    console.log('User created:', user.id);
    
            // Send welcome email
            try {
              const emailService = new SimpleEmailService();
              await emailService.sendWelcomeEmail(user.email, user.name || undefined);
              console.log('Welcome email sent to:', user.email);
            } catch (emailError) {
              console.error('Failed to send welcome email:', emailError);
              // Don't fail the subscription if email fails
            }
    
    return NextResponse.json({
      success: true,
      message: 'Subscription successful! Welcome to AI Newsletter! Check your email for a welcome message.',
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });
    
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({
      success: false,
      message: 'Error processing subscription',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { email, reason } = await request.json();
    
    if (!email || !email.includes('@')) {
      return NextResponse.json({
        success: false,
        message: 'Valid email is required'
      }, { 
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      });
    }

    // Find and deactivate the user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'User not found'
      }, { 
        status: 404,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      });
    }

    // Deactivate the user
    await prisma.user.update({
      where: { email },
      data: { isActive: false }
    });

    // Log the unsubscribe reason
    await prisma.userAnalytics.create({
      data: {
        userId: user.id,
        eventType: 'unsubscribe',
        eventData: { reason: reason || 'No reason provided' }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Successfully unsubscribed'
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });

  } catch (error) {
    console.error('Unsubscribe error:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to unsubscribe',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });
  }
}

export async function OPTIONS(request: NextRequest) {
  console.log('OPTIONS /api/subscribe called');
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
} 
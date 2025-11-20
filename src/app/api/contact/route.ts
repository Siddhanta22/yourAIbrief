import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { SimpleEmailService } from '@/lib/simple-email';

export const dynamic = 'force-dynamic';

const contactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required'),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, subject, message } = contactSchema.parse(body);

    // Send email notifications
    const emailService = new SimpleEmailService();
    const emailSent = await emailService.sendContactFormNotification(
      email,
      name,
      subject,
      message
    );

    if (!emailSent && process.env.NODE_ENV === 'production') {
      // In production, if email fails, we should log it but still return success to user
      console.error('[Contact] Failed to send contact form email', {
        email,
        subject,
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Thank you for your message! We\'ll get back to you soon.' 
    });

  } catch (error) {
    console.error('Contact form error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid form data', 
        errors: error.errors 
      }, { status: 400 });
    }

    return NextResponse.json({ 
      success: false, 
      message: 'Failed to send message. Please try again.' 
    }, { status: 500 });
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

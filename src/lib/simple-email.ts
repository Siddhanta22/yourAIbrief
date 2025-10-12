import sgMail from '@sendgrid/mail';

export class SimpleEmailService {
  private apiKey: string;
  private fromEmail: string;
  private fromName: string;

  constructor() {
    this.apiKey = process.env.SENDGRID_API_KEY || '';
    this.fromEmail = process.env.SENDGRID_FROM_EMAIL || 'noreply@ai-newsletter.com';
    this.fromName = process.env.SENDGRID_FROM_NAME || 'AI Newsletter';
    
    if (this.apiKey) {
      sgMail.setApiKey(this.apiKey);
    }
  }

  async sendWelcomeEmail(email: string, name?: string): Promise<boolean> {
    try {
      if (!this.apiKey) {
        console.log('[SimpleEmail] No SendGrid API key, skipping email send');
        return true; // Return true for development
      }

      const msg = {
        to: email,
        from: {
          email: this.fromEmail,
          name: this.fromName,
        },
        subject: 'Welcome to AI Newsletter! 🎉',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2563eb; margin: 0;">🤖 AI Newsletter</h1>
              <p style="color: #6b7280; margin: 10px 0;">Your Daily AI Intelligence</p>
            </div>

            <div style="background: #f8fafc; padding: 30px; border-radius: 10px; margin-bottom: 20px;">
              <h2 style="color: #1f2937; margin: 0 0 20px 0;">Welcome to the AI Newsletter! 🎉</h2>
              <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
                Hi ${name || 'there'},<br><br>
                Thank you for subscribing to our AI Newsletter! You're now part of a community of AI enthusiasts, 
                researchers, and developers who stay ahead of the curve with curated AI news and insights.
              </p>

              <div style="background: #ffffff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #1f2937; margin: 0 0 15px 0;">What to expect:</h3>
                <ul style="color: #374151; margin: 0; padding-left: 20px;">
                  <li>Daily AI news and breakthroughs</li>
                  <li>Expert analysis and insights</li>
                  <li>Industry trends and developments</li>
                  <li>Practical AI applications</li>
                </ul>
              </div>

              <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
                Your first newsletter will arrive tomorrow at 8:00 AM. In the meantime, feel free to explore 
                our website for the latest AI news and insights.
              </p>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}" 
                   style="background: #2563eb; color: #ffffff; padding: 12px 24px; border-radius: 6px; 
                          display: inline-block; font-weight: bold; text-decoration: none;">
                  Explore Our Website
                </a>
              </div>
            </div>

            <div style="text-align: center; color: #6b7280; font-size: 12px;">
              <p>You're receiving this because you subscribed to AI Newsletter.</p>
              <p>If you didn't sign up, you can safely ignore this email.</p>
            </div>
          </div>
        `,
      };

      await sgMail.send(msg);
      console.log(`[SimpleEmail] Welcome email sent to ${email}`);
      return true;
    } catch (error) {
      console.error('[SimpleEmail] Error sending welcome email:', error);
      return false;
    }
  }
}

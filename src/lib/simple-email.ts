import sgMail from '@sendgrid/mail';

export class SimpleEmailService {
  private apiKey: string;
  private fromEmail: string;
  private fromName: string;

  constructor() {
    this.apiKey = process.env.SENDGRID_API_KEY || '';
    this.fromEmail = process.env.SENDGRID_FROM_EMAIL || 'noreply@ai-newsletter.com';
    this.fromName = process.env.SENDGRID_FROM_NAME || 'YourAIbrief';
    
    if (this.apiKey) {
      sgMail.setApiKey(this.apiKey);
    }
  }

  private validateConfiguration(): { valid: boolean; error?: string } {
    if (!this.apiKey) {
      return { valid: false, error: 'SendGrid API key not configured' };
    }
    
    if (!this.fromEmail || !this.fromName) {
      return { valid: false, error: 'From email or name not configured' };
    }
    
    return { valid: true };
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
        subject: 'Welcome to YourAIbrief! 🎉',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2563eb; margin: 0;">🤖 YourAIbrief</h1>
              <p style="color: #6b7280; margin: 10px 0;">Your Daily AI Intelligence</p>
            </div>

            <div style="background: #f8fafc; padding: 30px; border-radius: 10px; margin-bottom: 20px;">
              <h2 style="color: #1f2937; margin: 0 0 20px 0;">Welcome to the YourAIbrief! 🎉</h2>
              <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
                Hi ${name || 'there'},<br><br>
                Thank you for subscribing to our YourAIbrief! You're now part of a community of AI enthusiasts, 
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
              <p>You're receiving this because you subscribed to YourAIbrief.</p>
              <p>If you didn't sign up or want to unsubscribe, <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/unsubscribe" style="color: #6b7280;">click here</a>.</p>
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

  public async sendUnsubscribeConfirmation(toEmail: string, userName: string = ''): Promise<boolean> {
    const config = this.validateConfiguration();
    if (!config.valid) {
      console.error(`[SimpleEmailService] Failed to send unsubscribe confirmation: ${config.error}`);
      return false;
    }

    const msg = {
      to: toEmail,
      from: {
        email: this.fromEmail,
        name: this.fromName,
      },
      subject: 'You\'ve been unsubscribed from YourAIbrief',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #dc2626; margin: 0;">📧 Unsubscribed</h1>
            <p style="color: #6b7280; margin: 10px 0;">YourAIbrief</p>
          </div>

          <div style="background: #f8fafc; padding: 30px; border-radius: 10px; margin-bottom: 20px;">
            <h2 style="color: #1f2937; margin: 0 0 20px 0;">Goodbye ${userName || 'there'},</h2>
            <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
              You have successfully unsubscribed from YourAIbrief. You will no longer receive our newsletters.
            </p>
            <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
              We're sorry to see you go! If you change your mind, you can always resubscribe by visiting our website.
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}" style="background: #2563eb; color: #ffffff; padding: 12px 24px;
                      border-radius: 6px; display: inline-block; font-weight: bold; text-decoration: none;">
                Resubscribe
              </a>
            </div>
          </div>

          <div style="text-align: center; color: #6b7280; font-size: 12px;">
            <p>Thank you for being part of our community!</p>
            <p>If you have any questions, feel free to reply to this email.</p>
          </div>
        </div>
      `,
    };

    try {
      await sgMail.send(msg);
      console.log(`[SimpleEmailService] Unsubscribe confirmation email sent to ${toEmail}`);
      return true;
    } catch (error: any) {
      console.error(`[SimpleEmailService] Error sending unsubscribe confirmation to ${toEmail}:`, error.response?.body || error);
      return false;
    }
  }
}

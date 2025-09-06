import sgMail from '@sendgrid/mail';
import { Newsletter, User } from '@/types';
import { prisma } from '@/lib/prisma';

export class EmailService {
  private apiKey: string;
  private fromEmail: string;
  private fromName: string;
  private isConfigured: boolean;

  constructor() {
    this.apiKey = process.env.SENDGRID_API_KEY || '';
    this.fromEmail = process.env.SENDGRID_FROM_EMAIL || 'noreply@ai-newsletter.com';
    this.fromName = process.env.SENDGRID_FROM_NAME || 'AI Newsletter';
    this.isConfigured = !!this.apiKey;
    
    if (this.apiKey) {
      sgMail.setApiKey(this.apiKey);
    } else {
      console.warn('[EmailService] SENDGRID_API_KEY not configured');
    }
  }

  // Enhanced validation
  private validateConfiguration(): { valid: boolean; error?: string } {
    if (!this.isConfigured) {
      return { valid: false, error: 'SendGrid API key not configured' };
    }
    
    if (!this.fromEmail || !this.fromName) {
      return { valid: false, error: 'From email or name not configured' };
    }
    
    return { valid: true };
  }

  // Enhanced email sending with retry logic
  private async sendWithRetry(msg: any, maxRetries: number = 3): Promise<{ success: boolean; error?: string }> {
    const config = this.validateConfiguration();
    if (!config.valid) {
      return { success: false, error: config.error };
    }

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`[EmailService] Sending email (attempt ${attempt}/${maxRetries}) to ${msg.to}`);
        
        const response = await sgMail.send(msg);
        console.log(`[EmailService] Email sent successfully to ${msg.to}`, response[0]?.statusCode);
        
        return { success: true };
      } catch (error) {
        console.error(`[EmailService] Attempt ${attempt} failed for ${msg.to}:`, error);
        
        if (attempt === maxRetries) {
          // Log detailed error information
          if (error && typeof error === 'object' && 'response' in error) {
            const sgError = error as any;
            console.error('[EmailService] SendGrid error details:', {
              statusCode: sgError.code,
              message: sgError.message,
              response: sgError.response?.body
            });
            return { success: false, error: `SendGrid error: ${sgError.message}` };
          }
          return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
        
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
    
    return { success: false, error: 'Max retries exceeded' };
  }

  async sendWelcomeEmail(user: User): Promise<boolean> {
    try {
      const msg = {
        to: user.email,
        from: {
          email: this.fromEmail,
          name: this.fromName,
        },
        subject: 'Welcome to AI Newsletter! 🚀',
        templateId: process.env.WELCOME_EMAIL_TEMPLATE_ID || 'd-welcome-template-id',
        dynamicTemplateData: {
          user_name: user.name || 'there',
          interests: user.preferences?.interests || [],
          unsubscribe_url: `${process.env.NEXTAUTH_URL}/unsubscribe?email=${encodeURIComponent(user.email)}`,
        },
      };

      await sgMail.send(msg);
      return true;
    } catch (error) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        error.response &&
        typeof error.response === 'object' &&
        'body' in error.response &&
        error.response.body
      ) {
        console.error('SendGrid error:', (error as any).response.body);
      } else {
        console.error('SendGrid error:', error);
      }
      return false;
    }
  }

  async sendConfirmationEmail(
    email: string, 
    token: string, 
    preferences: { interests: string[]; preferredSendTime: string; frequency: string }
  ): Promise<boolean> {
    try {
      const confirmationUrl = `${process.env.NEXTAUTH_URL}/api/auth/confirm?token=${token}`;
      
      const msg = {
        to: email,
        from: {
          email: this.fromEmail,
          name: this.fromName,
        },
        subject: 'Confirm Your AI Newsletter Subscription 📧',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2563eb; margin: 0;">🤖 AI Newsletter</h1>
              <p style="color: #6b7280; margin: 10px 0;">Your Daily AI Intelligence</p>
            </div>
            
            <div style="background: #f8fafc; padding: 30px; border-radius: 10px; margin-bottom: 20px;">
              <h2 style="color: #1f2937; margin: 0 0 20px 0;">Confirm Your Subscription</h2>
              <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
                Thanks for signing up for our AI Newsletter! To complete your subscription and start receiving 
                curated AI news, please confirm your email address by clicking the button below.
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${confirmationUrl}" 
                   style="background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; 
                          border-radius: 6px; display: inline-block; font-weight: bold;">
                  Confirm Subscription
                </a>
              </div>
              
              <p style="color: #6b7280; font-size: 14px; margin: 0;">
                Your preferences: ${preferences.frequency} delivery at ${preferences.preferredSendTime}
              </p>
            </div>
            
            <div style="text-align: center; color: #6b7280; font-size: 12px;">
              <p>This link will expire in 24 hours.</p>
              <p>If you didn't sign up for this newsletter, you can safely ignore this email.</p>
            </div>
          </div>
        `,
      };

      await sgMail.send(msg);
      return true;
    } catch (error) {
      console.error('Failed to send confirmation email:', error);
      return false;
    }
  }

  async sendNewsletter(newsletter: Newsletter, users: User[]): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    console.log(`[EmailService] Starting newsletter delivery to ${users.length} users`);

    for (const user of users) {
      try {
        console.log(`[EmailService] Processing user: ${user.email}`);
        
        const personalizedContent = await this.personalizeNewsletter(newsletter, user);
        
        const msg = {
          to: user.email,
          from: {
            email: this.fromEmail,
            name: this.fromName,
          },
          subject: `${newsletter.title} - ${new Date().toLocaleDateString()}`,
          html: personalizedContent,
          // Add tracking and unsubscribe links
          trackingSettings: {
            clickTracking: { enable: true },
            openTracking: { enable: true },
          },
          customArgs: {
            userId: user.id,
            newsletterId: newsletter.id,
            userEmail: user.email,
          },
        };

        const result = await this.sendWithRetry(msg);
        
        if (result.success) {
          success++;
          console.log(`[EmailService] Newsletter sent successfully to ${user.email}`);
          
          // Log successful delivery
          try {
            await prisma.emailLog.create({
              data: {
                to: user.email,
                subject: newsletter.title,
                status: 'SENT',
                sentAt: new Date(),
                metadata: {
                  userId: user.id,
                  newsletterId: newsletter.id,
                  userPreferences: user.preferences,
                }
              }
            });
          } catch (logError) {
            console.error(`[EmailService] Failed to log delivery for ${user.email}:`, logError);
          }
        } else {
          failed++;
          console.error(`[EmailService] Failed to send newsletter to ${user.email}: ${result.error}`);
          
          // Log failed delivery
          try {
            await prisma.emailLog.create({
              data: {
                to: user.email,
                subject: newsletter.title,
                status: 'FAILED',
                sentAt: new Date(),
                metadata: {
                  userId: user.id,
                  newsletterId: newsletter.id,
                  error: result.error,
                  userPreferences: user.preferences,
                }
              }
            });
          } catch (logError) {
            console.error(`[EmailService] Failed to log failure for ${user.email}:`, logError);
          }
        }
      } catch (error) {
        failed++;
        console.error(`[EmailService] Unexpected error processing ${user.email}:`, error);
        
        // Log unexpected error
        try {
          await prisma.emailLog.create({
            data: {
              to: user.email,
              subject: newsletter.title,
              status: 'FAILED',
              sentAt: new Date(),
              metadata: {
                userId: user.id,
                newsletterId: newsletter.id,
                error: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined,
                userPreferences: user.preferences,
              }
            }
          });
        } catch (logError) {
          console.error(`[EmailService] Failed to log unexpected error for ${user.email}:`, logError);
        }
      }
    }

    console.log(`[EmailService] Newsletter delivery completed: ${success} success, ${failed} failed`);
    return { success, failed };
  }

  async sendScheduledNewsletters(currentTime: string) {
    const { prisma } = await import('@/lib/prisma');
    // Fetch users whose preferredSendTime matches currentTime
    const users: any[] = await prisma.user.findMany({
      where: { preferredSendTime: currentTime },
      // No select clause needed unless you want to limit fields
    });
    if (!users.length) {
      console.log(`[Scheduler] No users found for preferredSendTime: ${currentTime}`);
      return { success: 0, failed: 0 };
    }
    // Import content curation and types
    const { ContentCurationService } = await import('@/lib/content-curation');
    const contentCurationService = new ContentCurationService();
    // For simplicity, use general interests or empty for now
    const curated = await contentCurationService.curateContent();
    const newsletter = {
      id: `scheduled-newsletter-${Date.now()}`,
      title: 'Your Daily AI Newsletter',
      content: { sections: curated.sections, summary: curated.summary, metadata: curated.metadata },
      summary: curated.summary,
      publishedAt: new Date(),
      isPublished: true,
      isPremium: false,
      tags: [],
      sections: curated.sections,
      metadata: curated.metadata,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    // Patch users to match app User type
    const { UserRole } = await import('@/types');
    const patchedUsers = users.map((user: any) => ({
      id: user.id,
      email: user.email,
      name: user.name || undefined,
      preferences: user.preferences === null ? undefined : (user.preferences as Record<string, any>),
      role: user.role === 'ADMIN' ? UserRole.ADMIN : user.role === 'EDITOR' ? UserRole.EDITOR : user.role === 'PREMIUM' ? UserRole.PREMIUM : UserRole.SUBSCRIBER,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      preferredSendTime: user.preferredSendTime,
    } as User));
    return await this.sendNewsletter(newsletter, patchedUsers);
  }

  private async personalizeNewsletter(newsletter: Newsletter, user: User): Promise<string> {
    // TODO: Implement AI-powered personalization
    // For now, return the standard newsletter content
    return this.generateNewsletterHTML(newsletter);
  }

  private generateNewsletterHTML(newsletter: Newsletter): string {
    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${newsletter.title}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .section { margin-bottom: 30px; }
          .section-title { font-size: 24px; font-weight: bold; margin-bottom: 15px; color: #2563eb; }
          .article { margin-bottom: 20px; padding: 15px; border-left: 4px solid #2563eb; background: #f8fafc; }
          .article-title { font-size: 18px; font-weight: bold; margin-bottom: 10px; }
          .article-summary { color: #666; margin-bottom: 10px; }
          .article-meta { font-size: 12px; color: #999; }
          .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; }
          .unsubscribe { font-size: 12px; color: #999; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${newsletter.title}</h1>
            ${newsletter.summary ? `<p>${newsletter.summary}</p>` : ''}
          </div>
    `;

    // Add sections
    for (const section of newsletter.sections) {
      html += `
        <div class="section">
          <h2 class="section-title">${section.title}</h2>
          ${section.description ? `<p>${section.description}</p>` : ''}
      `;

      // Add articles
      for (const article of section.articles) {
        html += `
          <div class="article">
            <h3 class="article-title">
              <a href="${article.url}" style="color: #2563eb; text-decoration: none;">
                ${article.title}
              </a>
            </h3>
            <p class="article-summary">${article.summary}</p>
            <div class="article-meta">
              Source: ${article.source} • ${new Date(article.publishedAt).toLocaleDateString()}
            </div>
          </div>
        `;
      }

      html += `</div>`;
    }

    html += `
          <div class="footer">
            <p>Stay ahead with AI intelligence delivered to your inbox.</p>
            <p class="unsubscribe">
              <a href="{{unsubscribe_url}}">Unsubscribe</a> • 
              <a href="{{view_online_url}}">View online</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    return html;
  }

  async sendTestEmail(to: string, newsletter: Newsletter): Promise<boolean> {
    try {
      const html = this.generateNewsletterHTML(newsletter);
      
      const msg = {
        to,
        from: {
          email: this.fromEmail,
          name: this.fromName,
        },
        subject: `[TEST] ${newsletter.title}`,
        html,
      };

      await sgMail.send(msg);
      return true;
    } catch (error) {
      console.error('Error sending test email:', error);
      return false;
    }
  }

  async validateEmail(email: string): Promise<boolean> {
    // TODO: Implement email validation
    // For now, just check basic format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  async getDeliveryStatus(messageId: string): Promise<any> {
    // TODO: Implement delivery status checking
    // This would require SendGrid webhook integration
    return { status: 'delivered' };
  }
} 
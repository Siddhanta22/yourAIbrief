import { Resend } from 'resend';
import { Newsletter, User } from '@/types';
import { prisma } from '@/lib/prisma';

export class EmailService {
  private apiKey: string;
  private fromEmail: string;
  private fromName: string;
  private isConfigured: boolean;
  private resend: Resend | null;

  constructor() {
    this.apiKey = process.env.RESEND_API_KEY || '';
    this.fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
    this.fromName = process.env.RESEND_FROM_NAME || 'YourAIbrief';
    this.isConfigured = !!this.apiKey;
    this.resend = this.apiKey ? new Resend(this.apiKey) : null;

    if (!this.apiKey) {
      console.warn('[EmailService] RESEND_API_KEY not configured');
    }
  }

  private get from(): string {
    return `${this.fromName} <${this.fromEmail}>`;
  }

  // Enhanced validation
  private validateConfiguration(): { valid: boolean; error?: string } {
    if (!this.isConfigured || !this.resend) {
      return { valid: false, error: 'Resend API key not configured' };
    }

    if (!this.fromEmail || !this.fromName) {
      return { valid: false, error: 'From email or name not configured' };
    }

    return { valid: true };
  }

  // Enhanced email sending with retry logic
  private async sendWithRetry(msg: { to: string; subject: string; html: string }, maxRetries: number = 3): Promise<{ success: boolean; error?: string }> {
    const config = this.validateConfiguration();
    if (!config.valid || !this.resend) {
      return { success: false, error: config.error };
    }

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`[EmailService] Sending email (attempt ${attempt}/${maxRetries}) to ${msg.to}`);

        const { data, error } = await this.resend.emails.send({
          from: this.from,
          to: msg.to,
          subject: msg.subject,
          html: msg.html,
        });
        if (error) {
          throw error;
        }

        console.log(`[EmailService] Email sent successfully to ${msg.to}`, data?.id);

        return { success: true };
      } catch (error) {
        console.error(`[EmailService] Attempt ${attempt} failed for ${msg.to}:`, error);

        if (attempt === maxRetries) {
          const resendError = error as any;
          return { success: false, error: resendError?.message || (error instanceof Error ? error.message : 'Unknown error') };
        }

        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }

    return { success: false, error: 'Max retries exceeded' };
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
          subject: `${newsletter.title} - ${new Date().toLocaleDateString()}`,
          html: personalizedContent,
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
      title: 'Your Daily YourAIbrief',
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
      if (!this.resend) {
        throw new Error('Resend API key not configured');
      }
      const html = this.generateNewsletterHTML(newsletter);

      const { error } = await this.resend.emails.send({
        from: this.from,
        to,
        subject: `[TEST] ${newsletter.title}`,
        html,
      });
      if (error) {
        throw error;
      }
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
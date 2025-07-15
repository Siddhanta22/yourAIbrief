import sgMail from '@sendgrid/mail';
import { Newsletter, User } from '@/types';
import { PrismaClient } from '@prisma/client';

export class EmailService {
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
        Object.prototype.hasOwnProperty.call(error, 'response') &&
        (error as any).response &&
        Object.prototype.hasOwnProperty.call((error as any).response, 'body')
      ) {
        // @ts-ignore
        console.error('Error sending welcome email:', (error as any).response.body);
      } else {
      console.error('Error sending welcome email:', error);
      }
      return false;
    }
  }

  async sendNewsletter(newsletter: Newsletter, users: User[]): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    for (const user of users) {
      try {
        const personalizedContent = await this.personalizeNewsletter(newsletter, user);
        
        const msg = {
          to: user.email,
          from: {
            email: this.fromEmail,
            name: this.fromName,
          },
          subject: newsletter.title,
          templateId: process.env.NEWSLETTER_TEMPLATE_ID || 'd-newsletter-template-id',
          dynamicTemplateData: {
            newsletter_title: newsletter.title,
            newsletter_summary: newsletter.summary,
            newsletter_content: personalizedContent,
            user_name: user.name || 'there',
            unsubscribe_url: `${process.env.NEXTAUTH_URL}/unsubscribe?email=${encodeURIComponent(user.email)}`,
            view_online_url: `${process.env.NEXTAUTH_URL}/newsletter/${newsletter.id}`,
          },
        };

        await sgMail.send(msg);
        success++;
      } catch (error) {
        if (
          typeof error === 'object' &&
          error !== null &&
          Object.prototype.hasOwnProperty.call(error, 'response') &&
          (error as any).response &&
          Object.prototype.hasOwnProperty.call((error as any).response, 'body')
        ) {
          // @ts-ignore
          console.error(`Error sending newsletter to ${user.email}:`, (error as any).response.body);
        } else {
        console.error(`Error sending newsletter to ${user.email}:`, error);
        }
        failed++;
      }
    }

    return { success, failed };
  }

  async sendScheduledNewsletters(currentTime: string) {
    const prisma = new PrismaClient();
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
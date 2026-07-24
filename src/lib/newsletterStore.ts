import { prisma } from '@/lib/prisma';
import { CuratedContent } from '@/lib/content-curation';

// Content is curated per-user (based on their individual interests), so each send
// is genuinely unique content rather than one shared issue - hence one Newsletter
// row per successful send, linked to that user via NewsletterSubscription.
export async function saveNewsletterForUser(userId: string, title: string, curated: CuratedContent) {
  const newsletter = await prisma.newsletter.create({
    data: {
      title,
      content: { sections: curated.sections, summary: curated.summary, metadata: curated.metadata } as any,
      summary: curated.summary,
      isPublished: true,
      sections: curated.sections as any,
      metadata: curated.metadata as any,
      tags: curated.metadata?.categories ?? [],
    },
  });

  await prisma.newsletterSubscription.create({
    data: { newsletterId: newsletter.id, userId },
  });

  return newsletter;
}

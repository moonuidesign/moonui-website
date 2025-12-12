'use server';

import { db } from '@/libs/drizzle';
import {
  sendNewsletterWelcomeEmail,
  sendBroadcastEmail,
  generateGeneralEmailHtml,
  generateDiscountEmailHtml,
  generateNewComponentEmailHtml,
} from '@/libs/mail';
import { eq, desc } from 'drizzle-orm';
import { z } from 'zod';
import { BroadcastPayload } from '@/types/newsletter';
import { newsletterSubscribers } from '@/db/migration/tables/newsletter';

const subscribeSchema = z.object({
  email: z.string().email(),
});

export async function subscribeToNewsletter(email: string) {
  const result = subscribeSchema.safeParse({ email });

  if (!result.success) {
    return { error: 'Invalid email address' };
  }

  try {
    // Check if already subscribed
    const existing = await db
      .select()
      .from(newsletterSubscribers)
      .where(eq(newsletterSubscribers.email, email))
      .limit(1);

    if (existing.length > 0) {
      if (!existing[0].isActive) {
        // Reactivate
        await db
          .update(newsletterSubscribers)
          .set({ isActive: true })
          .where(eq(newsletterSubscribers.email, email));
        return { success: 'Subscription reactivated!' };
      }
      return { error: 'Already subscribed' };
    }

    // Add new subscriber
    await db.insert(newsletterSubscribers).values({
      email,
    });

    // Send welcome email
    await sendNewsletterWelcomeEmail(email);

    return { success: 'Successfully subscribed!' };
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return { error: 'Failed to subscribe' };
  }
}

export async function getNewsletterSubscribers() {
  try {
    const subscribers = await db
      .select()
      .from(newsletterSubscribers)
      .orderBy(desc(newsletterSubscribers.createdAt));
    return subscribers;
  } catch (error) {
    console.error('Error fetching subscribers:', error);
    return [];
  }
}

export async function broadcastNewsletter(payload: BroadcastPayload) {
  try {
    const activeSubscribers = await db
      .select({ email: newsletterSubscribers.email })
      .from(newsletterSubscribers)
      .where(eq(newsletterSubscribers.isActive, true));

    const emails = activeSubscribers.map((s) => s.email);

    if (emails.length === 0) {
      return { error: 'No active subscribers found' };
    }

    let subject = '';
    let htmlContent = '';

    switch (payload.type) {
      case 'general':
        subject = payload.data.subject;
        htmlContent = generateGeneralEmailHtml(payload.data.content);
        break;
      case 'discount':
        subject = payload.data.subject;
        htmlContent = generateDiscountEmailHtml(payload.data);
        break;
      case 'new_component':
        subject = payload.data.subject;
        htmlContent = generateNewComponentEmailHtml(payload.data);
        break;
    }

    // Batching logic for BCC (safe limit ~40-50)
    const chunkSize = 40;
    for (let i = 0; i < emails.length; i += chunkSize) {
      const chunk = emails.slice(i, i + chunkSize);
      await sendBroadcastEmail(subject, htmlContent, chunk);
    }

    return { success: `Broadcast sent to ${emails.length} subscribers` };
  } catch (error) {
    console.error('Broadcast error:', error);
    return { error: 'Failed to send broadcast' };
  }
}

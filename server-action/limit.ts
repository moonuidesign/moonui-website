'use server';

import { headers } from 'next/headers';
import redis from '@/libs/redis-local';
import { auth } from '@/libs/auth';

export type LimitCheckResult = {
  success: boolean;
  message?: string;
  remaining?: number;
};

const FREE_TIER_LIMIT = 5;

export async function checkDownloadLimit(): Promise<LimitCheckResult> {
  try {
    const session = await auth();
    const user = session?.user;

    if (
      (user?.roleUser === 'user' && user.tier === 'pro') ||
      user?.roleUser === 'superadmin' ||
      user?.roleUser === 'admin'
    ) {
      return { success: true };
    }

    let identifier = '';
    if (user?.id) {
      identifier = `user:${user.id}`;
    } else {
      const headerList = await headers();
      const ip = headerList.get('x-forwarded-for') || 'unknown-ip';

      const realIp = ip.split(',')[0].trim();
      identifier = `ip:${realIp}`;
    }

    const key = `limit:${identifier}`;

    const currentUsage = await redis.incr(key);

    if (currentUsage === 1) {
      await redis.expire(key, 60 * 60 * 24 * 30);
    }

    if (currentUsage > FREE_TIER_LIMIT) {
      return {
        success: false,
        message: `You have reached the daily limit of ${FREE_TIER_LIMIT} downloads/copies. Please upgrade to Pro for unlimited access.`,
        remaining: 0,
      };
    }

    return {
      success: true,
      remaining: FREE_TIER_LIMIT - currentUsage,
    };
  } catch (error) {
    console.error('Redis Limit Check Error:', error);
    // Fail open or closed? If Redis fails, maybe allow?
    // Safer to allow to not block users on infra error, but for strictness block.
    // I'll allow but log.
    return { success: true };
  }
}

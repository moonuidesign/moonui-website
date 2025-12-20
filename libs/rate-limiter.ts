import { NextRequest, NextResponse } from 'next/server';
import redis from './redis-local'; // Import the existing redis client

// Configuration for rate limiting
interface RateLimitConfig {
  maxRequests: number; // Max requests allowed
  windowInSeconds: number; // Time window in seconds
  prefix: string; // Redis key prefix
}

// Default rate limit for general API routes
const DEFAULT_RATE_LIMIT_CONFIG: RateLimitConfig = {
  maxRequests: 60, // 60 requests
  windowInSeconds: 60, // per minute
  prefix: 'rl:',
};

/**
 * Global Rate Limiter middleware for Next.js App Router API Routes.
 * Tracks requests by IP address using Redis.
 *
 * @param request The NextRequest object.
 * @param config Optional rate limit configuration.
 * @returns A Promise that resolves to NextResponse (either pass-through or 429 error).
 */
export async function rateLimiter(
  request: NextRequest,
  config: Partial<RateLimitConfig> = {},
): Promise<NextResponse | null> {
  const { maxRequests, windowInSeconds, prefix } = {
    ...DEFAULT_RATE_LIMIT_CONFIG,
    ...config,
  };

  // Determine client IP address
  // Headers are usually set by proxies like Vercel, Cloudflare, etc.
  const ip =
    (request as any).ip || // `request.ip` is not directly available on NextRequest in all environments
    request.headers.get('x-real-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    '127.0.0.1'; // Fallback to localhost if IP cannot be determined

  const key = `${prefix}${ip}`;

  // Increment the request count for this IP
  const currentRequests = await redis.incr(key);

  // If it's the first request in the window, set the expiry
  if (currentRequests === 1) {
    await redis.expire(key, windowInSeconds);
  }

  // Check if the limit is exceeded
  if (currentRequests > maxRequests) {
    const retryAfter = await redis.ttl(key); // Time to live for the key

    return new NextResponse('Too Many Requests', {
      status: 429,
      headers: {
        'X-RateLimit-Limit': maxRequests.toString(),
        'X-RateLimit-Remaining': '0',
        'Retry-After': retryAfter > 0 ? retryAfter.toString() : '0',
      },
    });
  }

  // Set rate limit headers for successful requests (optional, but good practice)
  const remaining = maxRequests - currentRequests;
  const ttl = await redis.ttl(key);

  const responseHeaders = {
    'X-RateLimit-Limit': maxRequests.toString(),
    'X-RateLimit-Remaining': remaining >= 0 ? remaining.toString() : '0',
    'Retry-After': ttl > 0 ? ttl.toString() : '0',
  };

  // Return null to indicate that the request can proceed
  return null;
}

import { NextRequest, NextResponse } from 'next/server';
import { rateLimiter } from './libs/rate-limiter'; // Adjust path if needed

// This middleware will run for all requests
export async function middleware(request: NextRequest) {
  // Apply rate limiting only to API routes
  if (request.nextUrl.pathname.startsWith('/api')) {
    const response = await rateLimiter(request);
    if (response) {
      return response; // Return 429 response if rate limited
    }
  }

  // Continue to the next middleware or route handler
  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ['/api/:path*'], // Only apply this middleware to /api routes
};

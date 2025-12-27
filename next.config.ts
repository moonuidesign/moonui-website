import { withSentryConfig } from '@sentry/nextjs';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  productionBrowserSourceMaps: true,
  reactStrictMode: true,
  experimental: {
    // 1. Add this line to increase the limit for Middleware interception
    proxyClientMaxBodySize: '50mb',

    serverActions: {
      bodySizeLimit: '50mb',
    },
    scrollRestoration: true,
    optimizeCss: true,
  },
  images: {
    // 1. IZINKAN SVG (Wajib untuk DiceBear)
    dangerouslyAllowSVG: true,
    // 2. Atur Content Security Policy untuk SVG (Opsional tapi disarankan)
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      // --- TAMBAHAN PENTING DI SINI ---
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // Domain untuk Google Profile Picture
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com', // Domain untuk GitHub Profile Picture (Jaga-jaga)
      },
      // --------------------------------
      {
        protocol: 'https',
        hostname: 'example.com',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
      },
      {
        protocol: 'https',
        hostname: 'waterm.site',
      },
      {
        protocol: 'https',
        hostname: 'cdn.fajarfe.me',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'moonui.com',
      },
      {
        protocol: 'https',
        hostname: 'e030a9ca75da2d22f1cdc516446cca19.r2.dev',
      },
      // Cloudflare R2 / S3 bucket domain from user's code
      {
        protocol: 'https',
        hostname: '**', // Allow all for now if dynamic, but ideally specific
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.NEXT_PUBLIC_APP_URL || '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET,DELETE,PATCH,POST,PUT',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value:
              'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
          },
        ],
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options

  // Suppresses source map uploading logs during build
  silent: true,
  org: "moonui",
  project: "moonui-website",

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Route browser requests to Sentry through the Next.js rewrite to circumvent ad-blockers.
  tunnelRoute: "/monitoring",

  // Enables automatic instrumentation of Vercel Cron Monitors.
  automaticVercelMonitors: true,
});

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  productionBrowserSourceMaps: true,
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: '1mb',
    },
    scrollRestoration: true,
    optimizeCss: true,
  },
  images: {
    domains: ['example.com'],
  },
};

export default nextConfig;

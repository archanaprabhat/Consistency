// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  headers: async () => {
    return [
      {
        source: '/firebase-messaging-sw.js',
        headers: [
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
    ];
  },
  webpack: (config) => {
    // Allow importing JSON files (for service account)
    config.module.rules.push({
      test: /\.json$/,
      type: 'json',
    });
    
    return config;
  },
};

export default nextConfig;
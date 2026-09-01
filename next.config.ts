import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Native N-API addons cannot be bundled into the server chunks.
  serverExternalPackages: ['@napi-rs/canvas', 'sharp'],
  async redirects() {
    return [
      {
        source: '/',
        destination: '/edit',
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/image/:scale/:data',
        destination: '/api/img/:scale/:data',
      },
    ];
  },
};

export default nextConfig;

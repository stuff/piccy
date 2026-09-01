import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Emit a self-contained server bundle so the Docker runtime stage does not
  // need node_modules or a package manager.
  output: 'standalone',
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

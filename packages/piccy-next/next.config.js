/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
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

module.exports = nextConfig;

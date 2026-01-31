/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/events',
        destination: 'http://localhost:8000/api/events',
      },
    ];
  },
};

module.exports = nextConfig;

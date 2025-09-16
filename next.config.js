/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:4000/api/:path*', // Proxy to Backend
      },
      {
        source: '/:path*',
        destination: 'http://localhost:4000/:path*', // Proxy all paths to Backend
        has: [
          {
            type: 'header',
            key: 'x-api-request',
            value: 'true'
          }
        ]
      },
    ];
  },
};

module.exports = nextConfig;
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Only mark Prisma as external; including 'styled-jsx' here causes runtime
    // resolution issues in Vercel serverless functions (cannot find module).
    serverComponentsExternalPackages: ['@prisma/client'],
  },
  // Disable problematic features
  swcMinify: false,
  compress: false,
  // Exclude .github directory from build
  pageExtensions: ['ts', 'tsx', 'js', 'jsx'],
  // Ensure API routes work properly
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,DELETE,PATCH,POST,PUT,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization' },
        ],
      },
    ];
  },
  // Ensure API routes are not statically optimized
  async rewrites() {
    return [];
  },

  images: {
    domains: [
      'images.unsplash.com',
      'via.placeholder.com',
      'picsum.photos',
      'localhost',
    ],
  },
};

module.exports = nextConfig; 
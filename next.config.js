/** @type {import('next').NextConfig} */
const nextConfig = {
  // Explicitly set turbopack root to this project to avoid Vercel mis-detecting
  // the workspace when there are multiple lockfiles on the filesystem.
  turbopack: {
    root: __dirname,
  },
  // Disable compression (matches previous behaviour)
  compress: false,
  // Exclude .ts/.tsx/.js/.jsx from being treated as pages in legacy `pages/`
  // since we are using the App Router in `src/app`.
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
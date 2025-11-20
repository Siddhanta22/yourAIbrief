/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', 'styled-jsx'],
  },
  // Disable problematic features
  swcMinify: false,
  compress: false,
  // Exclude .github directory from build
  pageExtensions: ['ts', 'tsx', 'js', 'jsx'],
  webpack: (config, { isServer, webpack }) => {
    // Exclude .github directory and other problematic paths from webpack processing
    config.watchOptions = {
      ...config.watchOptions,
      ignored: [
        '**/.github/**',
        '**/node_modules/**',
        '**/.git/**',
        '**/*.md',
        '**/*.log',
        '**/build.sh',
        '**/Dockerfile',
        '**/railway.json',
      ],
    };
    
    // Add resolve fallbacks to prevent issues
    config.resolve = {
      ...config.resolve,
      fallback: {
        ...config.resolve?.fallback,
      },
    };
    
    return config;
  },
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
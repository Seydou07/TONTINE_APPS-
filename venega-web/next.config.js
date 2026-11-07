/** @type {import('next').NextConfig} */
const nextConfig = {
  // Seule la version est exposée au navigateur (pas tout le package.json).
  env: { NEXT_PUBLIC_APP_VERSION: require('./package.json').version },
  transpilePackages: ['@venega/design-tokens', '@venega/types'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
      },
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
      },
    ],
  },
};

module.exports = nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
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

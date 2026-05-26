import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    qualities: [75, 85, 90],
    minimumCacheTTL: 2678400, // 31 days
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.gstatic.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
        pathname: '/**',
      },
    ],
  },
  trailingSlash: true,
  async rewrites() {
    return [
      // Spanish "propiedades" URLs internally serve from the "properties" route handler
      {
        source: '/es/propiedades/:path*',
        destination: '/es/properties/:path*',
      },
    ];
  },
  async redirects() {
    return [
      // Redirect wrong locale combinations to the correct path
      {
        source: '/en/propiedades/:path*',
        destination: '/en/properties/:path*',
        permanent: true,
      },
      {
        source: '/es/properties/:path*',
        destination: '/es/propiedades/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
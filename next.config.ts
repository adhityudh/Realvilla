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
    ],
  },
  trailingSlash: true,
};

export default nextConfig;

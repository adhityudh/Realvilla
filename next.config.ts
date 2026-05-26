import type { NextConfig } from "next";
import { getAllRouteRewrites, getAllRouteRedirects } from './lib/routes';

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
    // Automatically generate rewrites from centralized route configuration
    // This maps localized URLs (e.g., /es/propiedades) to canonical route handlers (e.g., /es/properties)
    return getAllRouteRewrites();
  },
  async redirects() {
    // Automatically generate redirects from centralized route configuration
    // This ensures users see the correct localized URL for their locale
    return getAllRouteRedirects();
  },
};

export default nextConfig;

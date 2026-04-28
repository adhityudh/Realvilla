/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/webp', 'image/avif'],
  },
  trailingSlash: false,
};

module.exports = nextConfig;

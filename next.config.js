/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  // Suppress hydration warnings from browser extensions
  reactStrictMode: false,
};

module.exports = nextConfig;

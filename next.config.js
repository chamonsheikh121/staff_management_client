/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [],
  },
  // Enable standalone output for Docker
  output: 'standalone',
  // Optimize for production
  swcMinify: true,
}

module.exports = nextConfig

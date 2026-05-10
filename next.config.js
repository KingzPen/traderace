/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['phaser']
  },
  images: {
    domains: ['images.unsplash.com']
  }
}

module.exports = nextConfig

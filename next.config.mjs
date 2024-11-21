/** @type {import('next').NextConfig} */
const nextConfig = {
  // If you want all routes to be dynamic by default
  dynamicDependencies: true,
  experimental: {
    serverActions: true,
    // Disable static page generation if you're heavily using dynamic routes
    staticPageGenerationTimeout: 60
  }
}

module.exports = nextConfig
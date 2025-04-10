/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['maps.googleapis.com'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // Set output to 'standalone' for Vercel deployments
  output: 'standalone',
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    // Output more detailed webpack info during build
    outputFileTracingRoot: process.cwd(),
    // We don't need optimizeCss for now as it can cause issues
    optimizeCss: false,
    scrollRestoration: true,
  },
  webpack: (config, { isServer }) => {
    // This additional rule ensures path aliases work correctly
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': '.',
    };
    // Make sure Node.js modules work with Webpack 5
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      };
    }
    return config;
  },
  pageExtensions: ['jsx', 'js'],
  headers: async () => [
    {
      source: '/:path*',
      headers: [
        {
          key: 'X-DNS-Prefetch-Control',
          value: 'on'
        },
        {
          key: 'X-XSS-Protection',
          value: '1; mode=block'
        },
        {
          key: 'X-Frame-Options',
          value: 'SAMEORIGIN'
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff'
        }
      ]
    }
  ]
};

export default nextConfig;

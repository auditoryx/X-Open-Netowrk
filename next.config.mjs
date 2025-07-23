import withTM from 'next-transpile-modules';
import withBundleAnalyzer from '@next/bundle-analyzer';
import assert from 'assert';
import buffer from 'buffer';
import util from 'util';
import stream from 'stream-browserify';
import path from 'path-browserify';

const withTranspileModules = withTM([]);

// Bundle analyzer configuration
const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig = {
  // Phase 2B: Performance optimizations
  experimental: {
    optimizeCss: true,
    swcMinify: true,
  },
  
  // Build optimizations
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Phase 2B: Enhanced image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 31536000, // 1 year cache
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Phase 2B: Webpack optimizations for bundle size
  webpack: (config, { isServer, dev }) => {
    // Client-side polyfills
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        assert: 'assert',
        buffer: 'buffer',
        process: 'process/browser',
        util: 'util',
        stream: 'stream-browserify',
        path: 'path-browserify',
        fs: false,
        net: false,
        tls: false,
        http2: false,
        crypto: false,
        os: false,
        child_process: false,
      };
    }

    // Phase 2B: Bundle optimization
    if (!dev && !isServer) {
      // Tree shaking optimization
      config.optimization = {
        ...config.optimization,
        usedExports: true,
        sideEffects: false,
      };
      
      // Split chunks for better caching
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
          },
          firebase: {
            test: /[\\/]node_modules[\\/](@firebase|firebase)[\\/]/,
            name: 'firebase',
            chunks: 'all',
            priority: 20,
          },
          ui: {
            test: /[\\/]node_modules[\\/](lucide-react|@radix-ui)[\\/]/,
            name: 'ui',
            chunks: 'all',
            priority: 15,
          },
        },
      };
    }

    return config;
  },

  // Phase 2B: Headers for performance and security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, must-revalidate',
          },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  
  // Phase 2B: Compress responses
  compress: true,
  
  // Phase 2B: Generate static exports for better performance
  trailingSlash: false,
  
  // Phase 2B: PoweredBy header removal for security
  poweredByHeader: false,
};

export default bundleAnalyzer(withTranspileModules(nextConfig));

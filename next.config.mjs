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

  // Phase 2B: Enhanced Webpack optimizations for bundle size
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

    // Phase 2B: Aggressive bundle optimization
    if (!dev && !isServer) {
      // Tree shaking optimization
      config.optimization = {
        ...config.optimization,
        usedExports: true,
        sideEffects: false,
        innerGraph: true,
        mangleExports: true,
      };
      
      // Enhanced chunk splitting for <500KB target
      config.optimization.splitChunks = {
        chunks: 'all',
        minSize: 20000,
        maxSize: 400000, // 400KB max per chunk
        minChunks: 1,
        maxAsyncRequests: 30,
        maxInitialRequests: 30,
        enforceSizeThreshold: 50000,
        cacheGroups: {
          // Framework chunk (React, Next.js core)
          framework: {
            test: /[\\/]node_modules[\\/](react|react-dom|next)[\\/]/,
            name: 'framework',
            chunks: 'all',
            priority: 40,
            enforce: true,
          },
          
          // Firebase and related
          firebase: {
            test: /[\\/]node_modules[\\/](@firebase|firebase)[\\/]/,
            name: 'firebase',
            chunks: 'all',
            priority: 35,
            maxSize: 300000,
          },
          
          // UI libraries (icons, components)
          ui: {
            test: /[\\/]node_modules[\\/](lucide-react|@heroicons|@radix-ui|framer-motion)[\\/]/,
            name: 'ui',
            chunks: 'all',
            priority: 30,
            maxSize: 200000,
          },
          
          // Charts and visualization (heavy libraries)
          charts: {
            test: /[\\/]node_modules[\\/](chart\.js|react-chartjs-2|recharts)[\\/]/,
            name: 'charts',
            chunks: 'async',
            priority: 25,
            maxSize: 250000,
          },
          
          // Maps (Mapbox, Leaflet)
          maps: {
            test: /[\\/]node_modules[\\/](mapbox-gl|leaflet|react-leaflet)[\\/]/,
            name: 'maps',
            chunks: 'async',
            priority: 25,
            maxSize: 300000,
          },
          
          // Payment processing
          payments: {
            test: /[\\/]node_modules[\\/](@stripe)[\\/]/,
            name: 'payments',
            chunks: 'all',
            priority: 28,
            maxSize: 150000,
          },
          
          // Validation and forms
          forms: {
            test: /[\\/]node_modules[\\/](zod|react-hook-form|@hookform)[\\/]/,
            name: 'forms',
            chunks: 'all',
            priority: 20,
            maxSize: 100000,
          },
          
          // Utilities and date handling
          utils: {
            test: /[\\/]node_modules[\\/](date-fns|luxon|uuid|lodash)[\\/]/,
            name: 'utils',
            chunks: 'all',
            priority: 15,
            maxSize: 100000,
          },
          
          // Google APIs (heavy)
          google: {
            test: /[\\/]node_modules[\\/](googleapis)[\\/]/,
            name: 'google',
            chunks: 'async',
            priority: 20,
            maxSize: 200000,
          },
          
          // Default vendor chunk for remaining packages
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendor',
            chunks: 'all',
            priority: 10,
            maxSize: 200000,
          },
          
          // Common code chunks
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 5,
            maxSize: 150000,
          },
        },
      };
      
      // Further optimizations for bundle size
      config.optimization.moduleIds = 'deterministic';
      config.optimization.chunkIds = 'deterministic';
      
      // Exclude heavy dependencies from client bundle if possible
      config.externals = config.externals || [];
      if (Array.isArray(config.externals)) {
        config.externals.push({
          'googleapis': 'googleapis',
          'mapbox-gl': 'mapbox-gl',
        });
      }
    }

    // Add webpack plugins for analysis
    if (process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          reportFilename: '../analyze/client.html',
          openAnalyzer: false,
        })
      );
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

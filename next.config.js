const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        assert: 'assert/',
        buffer: 'buffer/',
        process: 'process/browser',
        util: 'util/',
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
    return config;
  },
  images: {
    formats: ['image/webp', 'image/avif'],
  },
};

export default nextConfig;

const withTM = require('next-transpile-modules')([]);

const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        assert: require.resolve('assert/'),
        buffer: require.resolve('buffer/'),
        process: require.resolve('process/browser'),
        util: require.resolve('util/'),
        stream: require.resolve('stream-browserify'),
        path: require.resolve('path-browserify'),
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

module.exports = withTM(nextConfig);

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Client-side: exclude pdf-parse and its dependencies
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
        canvas: false,
      };
      
      // Exclude pdf-parse and related packages from client bundles
      config.externals = config.externals || [];
      config.externals.push('pdf-parse', 'canvas');
    } else {
      // Server-side: ensure canvas is aliased to false (not needed)
      config.resolve.alias = config.resolve.alias || {};
      config.resolve.alias.canvas = false;
    }
    
    return config;
  },
}

module.exports = nextConfig


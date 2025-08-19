import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
        crypto: false,
        stream: false,
        util: false,
        buffer: false,
        events: false,
        assert: false,
        constants: false,
        domain: false,
        http: false,
        https: false,
        querystring: false,
        url: false,
        zlib: false,
      };
    }
    return config;
  },
};

export default nextConfig;

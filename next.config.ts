import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    webpack: (config) => {
        config.resolve.fallback = {
            dns: false, // `dns` モジュールを無視
        };
        return config;
    },
};

export default nextConfig;
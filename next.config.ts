import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    output: 'standalone',
    images: {
        domains: ['localhost', 'www.basetime.online', 'staging.basetime.online'],
    },
};

export default nextConfig;

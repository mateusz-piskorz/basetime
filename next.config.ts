import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    // output: 'standalone',
    images: {
        domains: ['localhost', 'minio.basetime.online', 'stagingminio.basetime.online'],
    },
};

export default nextConfig;

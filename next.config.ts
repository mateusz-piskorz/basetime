import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    output: 'standalone',
    images: {
        domains: ['localhost', 'minio.basetime.online', 'stagingminio.basetime.online'],
    },
    typescript: { ignoreBuildErrors: true },
};

export default nextConfig;

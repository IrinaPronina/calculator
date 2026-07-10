import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    output: 'standalone',
    serverExternalPackages: ['@react-pdf/renderer', 'mongodb', 'bcrypt'],
};

export default nextConfig;

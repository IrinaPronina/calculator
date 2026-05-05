import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    serverExternalPackages: ['@react-pdf/renderer', 'mongodb', 'bcrypt'],
};

export default nextConfig;

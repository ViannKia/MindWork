// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'asfirdaaqltynfstjhvg.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/Avatar/**',
      },
    ],
  },
};

export default nextConfig;
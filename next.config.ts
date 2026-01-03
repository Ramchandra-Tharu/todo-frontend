import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://todo-backend-lake-tau.vercel.app/api/:path*',
      },
    ];
  },
};

export default nextConfig;

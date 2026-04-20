import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        // Logo đội bóng, giải đấu từ API-Football
        protocol: "https",
        hostname: "media.api-sports.io",
      },
      {
        // Ảnh bìa bài viết lưu trên Supabase Storage
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },
  
  // Chuyển hướng non-www sang www
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'techshift.vn' }],
        destination: 'https://www.techshift.vn/:path*',
        permanent: true,
      },
    ]
  },
};

export default nextConfig;

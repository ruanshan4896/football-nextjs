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
  
  // Cấu hình chuyển hướng
  async redirects() {
    return [
      // Chuyển hướng từ domain cũ sang domain mới
      // Uncomment và thay đổi domain theo nhu cầu
      /*
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'old-domain.com', // Thay bằng domain cũ
          },
        ],
        destination: 'https://bongdalive.com/:path*',
        permanent: true, // 301 redirect
      },
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'www.old-domain.com', // Thay bằng www.domain-cũ
          },
        ],
        destination: 'https://bongdalive.com/:path*',
        permanent: true,
      },
      */
      
      // Chuyển hướng www sang non-www (tùy chọn)
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'www.bongdalive.com',
          },
        ],
        destination: 'https://bongdalive.com/:path*',
        permanent: true,
      },
    ]
  },
};

export default nextConfig;

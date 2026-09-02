import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["mysql2", "bcrypt"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "jvrelukrvnyywueoacbz.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol:"https",
        hostname:"z7zhl913x3.ufs.sh"
      },
      {
        protocol:"https",
        hostname:"utfs.io"
      }
    ],
  },
};

export default nextConfig;

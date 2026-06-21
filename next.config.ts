import type { NextConfig } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const localSupabase =
  supabaseUrl.includes("localhost") || supabaseUrl.includes("127.0.0.1");

const nextConfig: NextConfig = {
  images: {
    dangerouslyAllowLocalIP: localSupabase,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "54321",
        pathname: "/storage/v1/**",
      },
    ],
  },
  serverExternalPackages: ["pdf-to-img"],
};

export default nextConfig;

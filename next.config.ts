import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Strict Mode caused some bugs when streaming chat responses
  reactStrictMode: false,
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "bug-free-memory-vpp5w6r7q76hwx7q-3001.app.github.dev",
    "*.app.github.dev",
  ],
  experimental: {
    serverActions: {
      allowedOrigins: [
        "bug-free-memory-vpp5w6r7q76hwx7q-3001.app.github.dev",
        "*.app.github.dev",
      ],
    },
  },
};

export default nextConfig;
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@game-crypto/auth",
    "@game-crypto/database",
    "@game-crypto/shared",
  ],
  output: "standalone",
};

export default nextConfig;

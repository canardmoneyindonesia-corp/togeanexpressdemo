import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Deployed on Vercel (serverless). No `output` needed — Vercel handles it.
  compress: true,
};

export default nextConfig;

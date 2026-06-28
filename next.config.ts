import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Deployed on Vercel (serverless). No `output` needed — Vercel handles it.
  compress: true,
  // Keep the headless-Chrome packages out of the bundle; they're loaded at
  // runtime by the flyer PNG/PDF export route only.
  serverExternalPackages: ["@sparticuz/chromium", "puppeteer-core"],
};

export default nextConfig;

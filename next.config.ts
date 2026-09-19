import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Optimize heavy third-party package module resolution for sub-second compiling
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "echarts",
      "xlsx",
      "papaparse",
      "@tanstack/react-query",
      "clsx",
      "tailwind-merge",
    ],
  },
  // Suppress source map parsing overhead during rapid dev iteration
  productionBrowserSourceMaps: false,
};

export default nextConfig;

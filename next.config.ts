import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  output: 'export',
  // GitHub Pages deploys to /drawit/ subdirectory
  basePath: isProd ? '/drawit' : '',
  assetPrefix: isProd ? '/drawit/' : '',
  images: {
    unoptimized: true,
  },
  // Ensure trailing slashes for GitHub Pages compatibility
  trailingSlash: true,
};

export default nextConfig;

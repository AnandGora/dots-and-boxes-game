import type { NextConfig } from 'next';

const isGithubPages = process.env.GITHUB_PAGES === 'true';

const nextConfig: NextConfig = {
  output: 'export',
  basePath: isGithubPages ? '/dots-and-boxes-game' : '',
  assetPrefix: isGithubPages ? '/dots-and-boxes-game/' : undefined,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const isGithubActions = process.env.GITHUB_ACTIONS || false;
let repo = "";
if (isGithubActions) {
  repo = "/BSCpE_2-1_OJT_Eportfolio";
}

const nextConfig: NextConfig = {
  output: process.env.BUILD_STANDALONE === "true" ? "standalone" : "export",
  images: {
    unoptimized: true,
  },
  basePath: repo,
  assetPrefix: repo ? `${repo}/` : "",
  allowedDevOrigins: ["127.0.0.1", "localhost", "172.18.0.1"],
  devIndicators: {
    buildActivityPosition: 'bottom-right',
  },
};

export default nextConfig;
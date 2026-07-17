import type { NextConfig } from "next";

const isGithubActions = process.env.GITHUB_ACTIONS || false;
let repo = "";
if (isGithubActions) {
  repo = "/BSCpE_2-1_OJT_Eportfolio";
}

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  basePath: repo,
  assetPrefix: repo ? `${repo}/` : "",
};

export default nextConfig;
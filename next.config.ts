import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: "/%EC%B7%A8%EB%93%9D%EC%84%B8",          destination: "/acquisition-tax" },
      { source: "/%EC%96%91%EB%8F%84%EC%86%8C%EB%93%9D%EC%84%B8", destination: "/capital-gains-tax" },
      { source: "/%EB%B3%B4%EC%9C%A0%EC%84%B8",          destination: "/property-tax" },
      { source: "/%EC%A6%9D%EC%97%AC%EC%84%B8",          destination: "/gift-tax" },
      { source: "/%EC%83%81%EC%86%8D%EC%84%B8",          destination: "/inheritance-tax" },
      { source: "/%EB%B2%95%EC%9D%B8%EC%96%91%EB%8F%84%EC%86%8C%EB%93%9D%EC%84%B8", destination: "/corporate-gains-tax" },
      { source: "/%EB%B6%80%EB%8B%B4%EB%B6%80%EC%A6%9D%EC%97%AC", destination: "/encumbered-gift" },
    ]
  },
}

export default nextConfig

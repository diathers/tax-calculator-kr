import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "부동산 세금 계산기",
    short_name: "세금계산기",
    description: "취득세, 양도소득세, 보유세, 증여세, 상속세 등 부동산 관련 세금 계산기. 2025년 세법 기준.",
    start_url: "/",
    display: "standalone",
    background_color: "#f9fafb",
    theme_color: "#1d4ed8",
    icons: [
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  }
}

import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "manapick career",
    short_name: "career",
    description: "仕事内容、必要スキル、学ぶ順番、資格、AI活用を公式情報から整理する職業情報サイト。",
    start_url: "/",
    display: "standalone",
    background_color: "#fbfaf7",
    theme_color: "#ffd700",
    lang: "ja",
    icons: [
      { src: "/brand/career-icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/brand/career-icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}

import type { MetadataRoute } from "next"
import { DEFAULT_LOCALE, getDictionary } from "@/lib/i18n"

export default function manifest(): MetadataRoute.Manifest {
  const dict = getDictionary(DEFAULT_LOCALE)
  return {
    name: dict.meta.title,
    short_name: dict.brand.name,
    description: dict.meta.description,
    lang: "pt-BR",
    start_url: `/${DEFAULT_LOCALE}`,
    display: "standalone",
    background_color: "#0C0D12",
    theme_color: "#171622",
    categories: ["entertainment", "lifestyle"],
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
    ],
  }
}

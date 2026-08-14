import type { MetadataRoute } from "next"
import { DEFAULT_LOCALE, HTML_LANG, LOCALES } from "@/lib/i18n"
import { localeUrl } from "@/lib/site"

export default function sitemap(): MetadataRoute.Sitemap {
  const languages = Object.fromEntries(LOCALES.map((l) => [HTML_LANG[l], localeUrl(l)]))

  return LOCALES.map((locale) => ({
    url: localeUrl(locale),
    changeFrequency: "daily",
    priority: locale === DEFAULT_LOCALE ? 1 : 0.8,
    alternates: { languages },
  }))
}

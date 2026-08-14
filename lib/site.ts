import { getDictionary, type Locale } from "./i18n"

export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000")
).replace(/\/$/, "")

export function siteName(locale: Locale) {
  return getDictionary(locale).brand.name
}

export function siteTitle(locale: Locale) {
  return getDictionary(locale).meta.title
}

export function siteDescription(locale: Locale) {
  return getDictionary(locale).meta.description
}

export function localeUrl(locale: Locale) {
  return `${SITE_URL}/${locale}`
}

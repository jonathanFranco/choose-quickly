import ptMessages from "@/messages/pt.json"
import enMessages from "@/messages/en.json"

export const LOCALES = ["pt", "en"] as const
export type Locale = (typeof LOCALES)[number]
export const DEFAULT_LOCALE: Locale = "pt"

export function isLocale(v: string | undefined): v is Locale {
  return !!v && (LOCALES as readonly string[]).includes(v)
}

export const TMDB_CONFIG: Record<Locale, { language: string; watchRegion: string }> = {
  pt: { language: "pt-BR", watchRegion: "BR" },
  en: { language: "en-US", watchRegion: "US" },
}

export const HTML_LANG: Record<Locale, string> = {
  pt: "pt-BR",
  en: "en-US",
}

export const LOCALE_NAMES: Record<Locale, string> = {
  pt: "Português",
  en: "English",
}

export type Dictionary = typeof ptMessages

const DICTIONARIES: Record<Locale, Dictionary> = {
  pt: ptMessages,
  en: enMessages,
}

export function getDictionary(locale: Locale): Dictionary {
  return DICTIONARIES[locale]
}

export function t(template: string, vars: Record<string, string | number> = {}) {
  return template.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`))
}

import { NextResponse } from "next/server"
import { fetchTitles } from "@/lib/tmdb"
import {
  DEFAULT_LIST,
  FALLBACK,
  LIST_META,
  PROVIDERS,
  isOrigin,
  type ListKind,
  type MediaType,
  type Origin,
} from "@/lib/movies"
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/lib/i18n"

export const dynamic = "force-dynamic"

function parseLocale(v: string | null): Locale {
  return isLocale(v ?? undefined) ? (v as Locale) : DEFAULT_LOCALE
}
function parseMedia(v: string | null): MediaType {
  return v === "tv" ? "tv" : "movie"
}
function parseList(v: string | null, media: MediaType): ListKind {
  const list = v && v in LIST_META ? (v as ListKind) : DEFAULT_LIST
  return LIST_META[list].movieOnly && media !== "movie" ? "top" : list
}
function parseProvider(v: string | null): number | null {
  if (!v) return null
  const id = Number(v)
  return PROVIDERS.some((p) => p.id === id) ? id : null
}

function parseOrigin(v: string | null, media: MediaType): Origin | null {
  return media === "tv" && isOrigin(v) ? v : null
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const locale = parseLocale(searchParams.get("locale"))
  const media = parseMedia(searchParams.get("media"))
  const list = parseList(searchParams.get("list"), media)
  const provider = parseProvider(searchParams.get("provider"))
  const origin = parseOrigin(searchParams.get("origin"), media)

  const titles = await fetchTitles(media, list, provider, locale, origin)

  if (titles) {
    return NextResponse.json({ titles, live: true })
  }

  return NextResponse.json({ titles: FALLBACK[media][list], live: false })
}

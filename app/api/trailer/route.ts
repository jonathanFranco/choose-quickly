import { NextResponse } from "next/server"
import { fetchTrailer } from "@/lib/tmdb"
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/lib/i18n"
import type { MediaType } from "@/lib/movies"

export const dynamic = "force-dynamic"

function parseLocale(v: string | null): Locale {
  return isLocale(v ?? undefined) ? (v as Locale) : DEFAULT_LOCALE
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const locale = parseLocale(searchParams.get("locale"))
  const media: MediaType = searchParams.get("media") === "tv" ? "tv" : "movie"
  const id = searchParams.get("id") ?? ""

  if (!/^\d+$/.test(id)) return NextResponse.json({ trailer: null })

  const trailer = await fetchTrailer(media, id, locale)
  return NextResponse.json({ trailer })
}

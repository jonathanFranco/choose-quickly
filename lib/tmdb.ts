import "server-only"
import {
  IMDB_TOP_250_LIST_ID,
  type ListKind,
  type MediaType,
  type Origin,
  type Title,
} from "./movies"
import { TMDB_CONFIG, getDictionary, type Locale } from "./i18n"

const BASE = "https://api.themoviedb.org/3"
const IMG = "https://image.tmdb.org/t/p/w500"

type TmdbItem = {
  id: number
  title?: string
  name?: string
  overview: string
  release_date?: string
  first_air_date?: string
  poster_path: string | null
  vote_average: number
  genre_ids: number[]
  media_type?: string
}

function auth(key: string) {
  const isV4 = key.startsWith("eyJ") || key.length > 45
  return {
    headers: isV4 ? { Authorization: `Bearer ${key}` } : undefined,
    query: isV4 ? "" : `&api_key=${key}`,
  }
}

const genreCache = new Map<string, Record<number, string>>()

async function getGenreMap(
  key: string,
  media: MediaType,
  language: string,
): Promise<Record<number, string>> {
  const cacheKey = `${media}:${language}`
  const cached = genreCache.get(cacheKey)
  if (cached) return cached
  const { headers, query } = auth(key)
  const res = await fetch(`${BASE}/genre/${media}/list?language=${language}${query}`, {
    headers,
    next: { revalidate: 86400 },
  })
  if (!res.ok) throw new Error(`genre list failed: ${res.status}`)
  const data = (await res.json()) as { genres: { id: number; name: string }[] }
  const map: Record<number, string> = {}
  for (const g of data.genres) map[g.id] = g.name
  genreCache.set(cacheKey, map)
  return map
}

function usesImdbList(
  media: MediaType,
  list: ListKind,
  provider: number | null,
  origin: Origin | null,
) {
  return list === "imdb" && media === "movie" && !provider && !origin
}

function buildUrl(
  media: MediaType,
  list: ListKind,
  provider: number | null,
  page: number,
  key: string,
  locale: Locale,
  origin: Origin | null,
) {
  const { query } = auth(key)
  const { language, watchRegion } = TMDB_CONFIG[locale]
  if (usesImdbList(media, list, provider, origin)) {
    return `${BASE}/list/${IMDB_TOP_250_LIST_ID}?language=${language}&page=${page}${query}`
  }
  if (provider || origin) {
    const sort = list === "popular" ? "popularity.desc" : "vote_average.desc"
    const voteFloor = media === "movie" ? 300 : 100
    const providerFilter = provider
      ? `&watch_region=${watchRegion}&with_watch_providers=${provider}`
      : ""
    const originFilter = origin ? `&with_original_language=${origin}` : ""
    return (
      `${BASE}/discover/${media}?language=${language}&page=${page}` +
      `&sort_by=${sort}&vote_count.gte=${voteFloor}` +
      `${providerFilter}${originFilter}${query}`
    )
  }
  const endpoint = list === "popular" ? "popular" : "top_rated"
  return `${BASE}/${media}/${endpoint}?language=${language}&page=${page}${query}`
}

export async function fetchTitles(
  media: MediaType,
  list: ListKind,
  provider: number | null,
  locale: Locale,
  origin: Origin | null = null,
): Promise<Title[] | null> {
  const key = process.env.TMDB_API_KEY
  if (!key) return null

  try {
    const { headers } = auth(key)
    const genreMap = await getGenreMap(key, media, TMDB_CONFIG[locale].language)
    const imdb = usesImdbList(media, list, provider, origin)

    const deep = imdb || (origin !== null && !provider) || (!provider && list === "top")
    const pageCount = deep ? 13 : 5
    const limit = deep ? 250 : 100
    const pages = Array.from({ length: pageCount }, (_, i) => i + 1)

    const responses = await Promise.all(
      pages.map((p) =>
        fetch(buildUrl(media, list, provider, p, key, locale, origin), {
          headers,
          next: { revalidate: 21600 },
        }),
      ),
    )

    const items: TmdbItem[] = []
    for (const res of responses) {
      if (!res.ok) throw new Error(`fetch failed: ${res.status}`)
      const data = (await res.json()) as { results?: TmdbItem[]; items?: TmdbItem[] }
      items.push(...(data.results ?? data.items ?? []))
    }

    const { misc } = getDictionary(locale)
    const titles = items
      .filter((m) => m.overview && m.poster_path)
      .filter((m) => !m.media_type || m.media_type === media)
      .map<Title>((m, i) => {
        const date = m.release_date || m.first_air_date || ""
        const genres = (m.genre_ids ?? []).map((id) => genreMap[id]).filter(Boolean)
        return {
          id: String(m.id),
          title: m.title || m.name || misc.untitled,
          year: date ? Number(date.slice(0, 4)) : 0,
          genre: genres[0] ?? misc.otherGenre,
          genres: genres.length > 0 ? genres : [misc.otherGenre],
          rating: Math.round(m.vote_average * 10) / 10,
          synopsis: m.overview,
          poster: m.poster_path ? `${IMG}${m.poster_path}` : null,
          rank: i + 1,
          mediaType: media,
        }
      })
      .slice(0, limit)
      .map((t, i) => ({ ...t, rank: i + 1 }))

    return titles.length > 0 ? titles : null
  } catch (error) {
    console.log("[v0] Erro ao buscar no TMDb:", (error as Error).message)
    return null
  }
}

type TmdbVideo = {
  key: string
  site: string
  type: string
  official: boolean
  name: string
}

function rankVideo(v: TmdbVideo) {
  if (v.site !== "YouTube") return -1
  if (v.type === "Trailer") return v.official ? 4 : 3
  if (v.type === "Teaser") return v.official ? 2 : 1
  return -1
}

async function videosFor(
  key: string,
  media: MediaType,
  id: string,
  language: string,
): Promise<TmdbVideo[]> {
  const { headers, query } = auth(key)
  const res = await fetch(`${BASE}/${media}/${id}/videos?language=${language}${query}`, {
    headers,
    next: { revalidate: 86400 },
  })
  if (!res.ok) return []
  const data = (await res.json()) as { results?: TmdbVideo[] }
  return data.results ?? []
}

export async function fetchTrailer(
  media: MediaType,
  id: string,
  locale: Locale,
): Promise<{ key: string; name: string } | null> {
  const apiKey = process.env.TMDB_API_KEY
  if (!apiKey) return null

  try {
    const { language } = TMDB_CONFIG[locale]
    const languages = language === "en-US" ? [language] : [language, "en-US"]

    for (const lang of languages) {
      const best = (await videosFor(apiKey, media, id, lang))
        .filter((v) => rankVideo(v) > 0)
        .sort((a, b) => rankVideo(b) - rankVideo(a))[0]
      if (best) return { key: best.key, name: best.name }
    }
    return null
  } catch (error) {
    console.log("[trailer] falha ao buscar no TMDb:", (error as Error).message)
    return null
  }
}

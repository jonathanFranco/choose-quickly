import { NextResponse, type NextRequest } from "next/server"
import { DEFAULT_LOCALE, LOCALES, type Locale } from "@/lib/i18n"

function pickLocale(request: NextRequest): Locale {
  const header = request.headers.get("accept-language") ?? ""
  const ranked = header
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";")
      const q = params.find((p) => p.startsWith("q="))
      return { tag: tag.toLowerCase(), q: q ? Number(q.slice(2)) : 1 }
    })
    .filter((l) => l.tag)
    .sort((a, b) => b.q - a.q)

  for (const { tag } of ranked) {
    const base = tag.split("-")[0]
    const match = LOCALES.find((l) => l === base)
    if (match) return match
  }
  return DEFAULT_LOCALE
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hasLocale = LOCALES.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`))
  if (hasLocale) return

  const url = request.nextUrl.clone()
  url.pathname = `/${pickLocale(request)}${pathname === "/" ? "" : pathname}`
  return NextResponse.redirect(url)
}

export const config = {
  matcher: [
    "/((?!_next|api|favicon\\.ico|icon.*|apple-icon.*|opengraph-image.*|robots\\.txt|sitemap\\.xml|manifest\\.webmanifest|placeholder.*).*)",
  ],
}

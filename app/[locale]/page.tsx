import { notFound } from "next/navigation"
import { MoviePicker } from "@/components/movie-picker"
import { LanguageSwitcher } from "@/components/language-switcher"
import { fetchTitles } from "@/lib/tmdb"
import { DEFAULT_LIST, FALLBACK } from "@/lib/movies"
import { HTML_LANG, LOCALES, getDictionary, isLocale } from "@/lib/i18n"
import { SITE_URL, localeUrl } from "@/lib/site"
import type { Locale } from "@/lib/i18n"

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }))
}

function buildJsonLd(locale: Locale) {
  const dict = getDictionary(locale)
  const url = localeUrl(locale)
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url,
        name: dict.brand.name,
        alternateName: "Choose Quickly",
        description: dict.meta.description,
        inLanguage: HTML_LANG[locale],
      },
      {
        "@type": "WebApplication",
        "@id": `${url}#app`,
        name: dict.meta.title,
        url,
        description: dict.meta.description,
        applicationCategory: "EntertainmentApplication",
        operatingSystem: "Any",
        inLanguage: HTML_LANG[locale],
        isPartOf: { "@id": `${SITE_URL}/#website` },
        offers: { "@type": "Offer", price: "0", priceCurrency: locale === "pt" ? "BRL" : "USD" },
      },
      {
        "@type": "FAQPage",
        "@id": `${url}#faq`,
        inLanguage: HTML_LANG[locale],
        mainEntity: dict.faq.items.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  }
}

export default async function Page({ params }: PageProps<'/[locale]'>) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()

  const dict = getDictionary(locale)
  const top = await fetchTitles("movie", DEFAULT_LIST, null, locale)
  const initialData = {
    titles: top ?? FALLBACK.movie[DEFAULT_LIST],
    live: Boolean(top),
  }

  return (
    <main className="relative flex min-h-dvh flex-col items-center px-4 py-10 sm:py-16">
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-96 w-[36rem] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />
      </div>

      <div className="z-10 mb-4 flex w-full max-w-3xl justify-end sm:mb-2">
        <LanguageSwitcher locale={locale} ariaLabel={dict.langSwitch.ariaLabel} />
      </div>

      <header className="z-10 mb-6 flex flex-col items-center text-center sm:mb-14">
        <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-1.5 text-[0.65rem] uppercase tracking-[0.25em] text-muted-foreground backdrop-blur sm:mb-4 sm:text-xs">
          {dict.header.badge}
        </span>
        <h1 className="text-balance font-display text-6xl leading-[0.85] tracking-wide text-foreground sm:text-8xl">
          {dict.brand.first} <span className="text-primary">{dict.brand.second}</span>
        </h1>
        <p className="mt-2 text-xs uppercase tracking-[0.3em] text-muted-foreground sm:mt-3 sm:text-sm">
          {dict.header.kicker}
        </p>
        <p className="mt-4 max-w-md text-pretty text-sm leading-relaxed text-muted-foreground sm:mt-5 sm:text-base">
          {dict.header.intro}
        </p>
      </header>

      <section aria-label={dict.mode.ariaLabel} className="z-10 flex w-full justify-center">
        <MoviePicker initialData={initialData} dict={dict} locale={locale} />
      </section>

      <section className="z-10 mt-16 w-full max-w-3xl">
        <h2 className="text-center font-display text-3xl tracking-wide text-foreground sm:text-4xl">
          {dict.faq.heading}
        </h2>
        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          {dict.faq.items.map((f) => (
            <div key={f.q} className="rounded-2xl border border-border bg-card/50 p-5 backdrop-blur">
              <dt className="font-medium text-foreground">{f.q}</dt>
              <dd className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground">{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildJsonLd(locale)) }}
      />

      <footer className="z-10 mt-14 max-w-md text-center text-xs text-muted-foreground">
        {initialData.live ? (
          dict.footer.live
        ) : (
          <>
            {dict.footer.offlinePrefix}
            <code className="text-primary">TMDB_API_KEY</code>
            {dict.footer.offlineSuffix}
          </>
        )}
      </footer>
    </main>
  )
}

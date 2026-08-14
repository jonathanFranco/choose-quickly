import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Geist, Bebas_Neue } from 'next/font/google'
import { notFound } from 'next/navigation'
import { DEFAULT_LOCALE, HTML_LANG, LOCALES, getDictionary, isLocale } from '@/lib/i18n'
import { SITE_URL, siteName } from '@/lib/site'
import '../globals.css'

const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
})

const bebas = Bebas_Neue({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-bebas',
})

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: LayoutProps<'/[locale]'>): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const dict = getDictionary(locale)
  const name = dict.brand.name

  const languages = Object.fromEntries(
    LOCALES.map((l) => [HTML_LANG[l], `/${l}`]),
  ) as Record<string, string>

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: dict.meta.title,
      template: `%s · ${name}`,
    },
    description: dict.meta.description,
    applicationName: name,
    alternates: {
      canonical: `/${locale}`,
      languages: { ...languages, 'x-default': `/${DEFAULT_LOCALE}` },
    },
    keywords: dict.meta.keywords,
    authors: [{ name }],
    creator: name,
    publisher: name,
    category: 'entertainment',
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },
    openGraph: {
      type: 'website',
      locale: HTML_LANG[locale].replace('-', '_'),
      siteName: name,
      title: dict.meta.title,
      description: dict.meta.description,
      url: `/${locale}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: dict.meta.title,
      description: dict.meta.description,
    },
    appleWebApp: { capable: true, title: name, statusBarStyle: 'black-translucent' },
    formatDetection: { telephone: false },
    generator: 'v0.app',
    icons: {
      icon: [
        { url: '/icon.svg', type: 'image/svg+xml' },
        { url: '/icon-light-32x32.png', sizes: '32x32', type: 'image/png' },
        { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      ],
      shortcut: '/favicon.ico',
      apple: '/apple-icon.png',
    },
  }
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#171622',
}

export default async function RootLayout({ children, params }: LayoutProps<'/[locale]'>) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()

  return (
    <html
      lang={HTML_LANG[locale]}
      className={`bg-background ${geistSans.variable} ${bebas.variable}`}
    >
      <body className="font-sans antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}

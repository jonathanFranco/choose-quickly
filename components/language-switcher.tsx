"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Languages } from "lucide-react"
import { cn } from "@/lib/utils"
import { LOCALES, LOCALE_NAMES, type Locale } from "@/lib/i18n"

export function LanguageSwitcher({ locale, ariaLabel }: { locale: Locale; ariaLabel: string }) {
  const pathname = usePathname()

  const hrefFor = (target: Locale) => {
    const rest = pathname.split("/").slice(2).join("/")
    return `/${target}${rest ? `/${rest}` : ""}`
  }

  return (
    <nav
      aria-label={ariaLabel}
      className="flex items-center gap-1 rounded-full border border-border bg-card/60 p-1 backdrop-blur"
    >
      <Languages className="ml-2 size-3.5 text-muted-foreground" aria-hidden />
      {LOCALES.map((l) => (
        <Link
          key={l}
          href={hrefFor(l)}
          hrefLang={l}
          aria-current={l === locale ? "true" : undefined}
          title={LOCALE_NAMES[l]}
          className={cn(
            "inline-flex min-h-8 items-center rounded-full px-3 text-xs font-medium uppercase transition-colors",
            l === locale
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {l}
        </Link>
      ))}
    </nav>
  )
}

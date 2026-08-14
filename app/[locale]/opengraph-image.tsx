import { ImageResponse } from "next/og"
import { DEFAULT_LOCALE, getDictionary, isLocale } from "@/lib/i18n"

const PIPS = [
  [0, 0],
  [2, 0],
  [1, 1],
  [0, 2],
  [2, 2],
]

export const alt = "Bora Assistir / Let's Watch"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const dict = getDictionary(isLocale(locale) ? locale : DEFAULT_LOCALE)
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          backgroundColor: "#0C0D12",
          backgroundImage: "radial-gradient(circle at 20% 0%, #2A2418 0%, #0C0D12 55%)",
          color: "#F1EEE7",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <div
            style={{
              position: "relative",
              display: "flex",
              width: 108,
              height: 108,
              borderRadius: 24,
              backgroundColor: "#F5AF20",
            }}
          >
            {PIPS.map(([col, row]) => (
              <div
                key={`${col}-${row}`}
                style={{
                  position: "absolute",
                  left: 18 + col * 26,
                  top: 18 + row * 26,
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  backgroundColor: "#0F111A",
                }}
              />
            ))}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 24,
              letterSpacing: 8,
              textTransform: "uppercase",
              color: "#9C9AA6",
            }}
          >
            {dict.header.badge}
          </div>
        </div>

        <div style={{ display: "flex", marginTop: 48, fontSize: 104, fontWeight: 700, letterSpacing: -3 }}>
          <span>{dict.brand.first}&nbsp;</span>
          <span style={{ color: "#F5AF20" }}>{dict.brand.second}</span>
        </div>

        <div style={{ display: "flex", marginTop: 24, fontSize: 34, lineHeight: 1.35, color: "#B9B6C2" }}>
          {dict.meta.description}
        </div>
      </div>
    ),
    size,
  )
}

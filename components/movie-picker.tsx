"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import useSWR from "swr"
import {
  Dices,
  Clock,
  Film,
  RotateCcw,
  Star,
  Tv,
  Hash,
  Loader2,
  X,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  Play,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  DEFAULT_LIST,
  LIST_META,
  PROVIDERS,
  getDecades,
  getGenres,
  hasGenre,
  inDecade,
  listsFor,
  ORIGINS,
  type ListKind,
  type MediaType,
  type Origin,
  type Title,
} from "@/lib/movies"
import { t, type Dictionary } from "@/lib/i18n"

type Mode = "single" | "triple"
type Phase = "idle" | "spinning" | "choices" | "result"

type ApiResponse = { titles: Title[]; live: boolean }
type CatalogData = ApiResponse & { key: string }

const fetchJson = (url: string) => fetch(url).then((r) => r.json())

const fetcher = async (url: string): Promise<CatalogData> => {
  const res = await fetch(url)
  const data = (await res.json()) as ApiResponse
  return { ...data, key: url }
}

function pickN<T>(arr: T[], n: number): T[] {
  const copy = [...arr]
  const out: T[] = []
  while (out.length < n && copy.length > 0) {
    const i = Math.floor(Math.random() * copy.length)
    out.push(copy.splice(i, 1)[0])
  }
  return out
}

export function MoviePicker({
  initialData,
  dict,
  locale,
}: {
  initialData: ApiResponse
  dict: Dictionary
  locale: string
}) {
  const [media, setMedia] = useState<MediaType>("movie")
  const [list, setList] = useState<ListKind>(DEFAULT_LIST)
  const [provider, setProvider] = useState<number | null>(null)
  const [mode, setMode] = useState<Mode>("single")
  const [genre, setGenre] = useState<string>("todos")
  const [decade, setDecade] = useState<number | null>(null)
  const [origin, setOrigin] = useState<Origin | null>(null)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [synopsisOpen, setSynopsisOpen] = useState(false)

  const [phase, setPhase] = useState<Phase>("idle")
  const [current, setCurrent] = useState<Title | null>(null)
  const [choices, setChoices] = useState<Title[]>([])
  const [reelTitle, setReelTitle] = useState<string>("")
  const [count, setCount] = useState(0)
  const seenRef = useRef<Set<string>>(new Set())
  const stageRef = useRef<HTMLDivElement>(null)

  const key =
    `/api/titles?locale=${locale}&media=${media}&list=${list}` +
    (provider ? `&provider=${provider}` : "") +
    (origin ? `&origin=${origin}` : "")

  const { data } = useSWR<CatalogData>(key, fetcher, {
    fallbackData:
      media === "movie" && list === DEFAULT_LIST && !provider && !origin
        ? { ...initialData, key }
        : undefined,
    keepPreviousData: true,
    revalidateOnFocus: false,
  })

  const stale = !data || data.key !== key
  const titles = stale ? [] : data.titles
  const live = stale ? false : data.live
  const genres = useMemo(() => getGenres(titles), [titles])
  const decades = useMemo(() => getDecades(titles), [titles])

  const pool = useMemo(
    () =>
      titles
        .filter((t) => genre === "todos" || hasGenre(t, genre))
        .filter((t) => decade === null || inDecade(t, decade)),
    [titles, genre, decade],
  )

  const hasFilters = genre !== "todos" || decade !== null || provider !== null || origin !== null
  const activeFilterCount = [
    genre !== "todos",
    decade !== null,
    provider !== null,
    origin !== null,
  ].filter(Boolean).length
  const filterSummary =
    [
      provider !== null ? PROVIDERS.find((p) => p.id === provider)?.name : null,
      origin !== null ? dict.origins[origin] : null,
      genre !== "todos" ? genre : null,
      decade !== null ? `${decade}s` : null,
    ]
      .filter(Boolean)
      .join(" · ") || dict.filters.placeholder
  const listCopy = dict.lists[list]
  const mediaMeta = dict.media[media]
  const availableLists = useMemo(() => listsFor(media), [media])

  const resetStage = useCallback(() => {
    setSynopsisOpen(false)
    setPhase("idle")
    setCurrent(null)
    setChoices([])
    seenRef.current.clear()
  }, [])

  const clearFilters = useCallback(() => {
    setGenre("todos")
    setDecade(null)
    setProvider(null)
    setOrigin(null)
    resetStage()
  }, [resetStage])

  useEffect(() => {
    if (genre !== "todos" && !genres.includes(genre)) setGenre("todos")
  }, [genres, genre])

  useEffect(() => {
    if (decade !== null && decades.length > 0 && !decades.includes(decade)) setDecade(null)
  }, [decades, decade])

  useEffect(() => {
    if (media !== "tv" && origin !== null) setOrigin(null)
  }, [media, origin])

  useEffect(() => {
    if (!availableLists.includes(list)) setList(availableLists[0])
  }, [availableLists, list])

  const draw = useCallback(() => {
    if (pool.length === 0 || phase === "spinning") return

    if (mode === "triple") {
      const chosen = pickN(pool, Math.min(3, pool.length))
      setPhase("spinning")
      let ticks = 0
      const totalTicks = 16
      const spin = () => {
        ticks++
        setReelTitle(pool[Math.floor(Math.random() * pool.length)].title)
        if (ticks >= totalTicks) {
          setChoices(chosen)
          setPhase("choices")
          return
        }
        window.setTimeout(spin, 40 + Math.pow(ticks / totalTicks, 3) * 220)
      }
      spin()
      return
    }

    let candidates = pool.filter((m) => !seenRef.current.has(m.id))
    if (candidates.length === 0) {
      seenRef.current.clear()
      candidates = pool
    }
    const chosen = candidates[Math.floor(Math.random() * candidates.length)]
    setPhase("spinning")
    let ticks = 0
    const totalTicks = 22
    const spin = () => {
      ticks++
      setReelTitle(pool[Math.floor(Math.random() * pool.length)].title)
      if (ticks >= totalTicks) {
        seenRef.current.add(chosen.id)
        setSynopsisOpen(false)
        setCurrent(chosen)
        setCount((c) => c + 1)
        setPhase("result")
        return
      }
      window.setTimeout(spin, 40 + Math.pow(ticks / totalTicks, 3) * 260)
    }
    spin()
  }, [pool, phase, mode])

  useEffect(() => {
    if (phase !== "choices" && phase !== "result") return
    if (!window.matchMedia("(max-width: 639px)").matches) return
    stageRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
  }, [phase])

  const chooseOne = (title: Title) => {
    setSynopsisOpen(false)
    setCurrent(title)
    setCount((c) => c + 1)
    setPhase("result")
  }

  const source = live ? listCopy.source : listCopy.label

  return (
    <div className="flex w-full max-w-3xl flex-col items-center gap-5 sm:gap-7">
      <div className="flex w-full flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Segmented
          ariaLabel={dict.media.ariaLabel}
          value={media}
          onChange={(v) => {
            setMedia(v as MediaType)
            resetStage()
          }}
          options={[
            { value: "movie", label: dict.media.movie.label, icon: <Film className="size-4" aria-hidden /> },
            { value: "tv", label: dict.media.tv.label, icon: <Tv className="size-4" aria-hidden /> },
          ]}
        />
        <Segmented
          ariaLabel={dict.mode.ariaLabel}
          value={mode}
          onChange={(v) => {
            setMode(v as Mode)
            resetStage()
          }}
          options={[
            { value: "single", label: dict.mode.single, icon: <Dices className="size-4" aria-hidden /> },
            { value: "triple", label: dict.mode.triple, icon: <Hash className="size-4" aria-hidden /> },
          ]}
        />
      </div>

      <div
        role="tablist"
        aria-label={dict.lists.ariaLabel}
        className="flex w-full max-w-md items-stretch gap-1 sm:max-w-lg rounded-full border border-border bg-card/60 p-1 backdrop-blur"
      >
        {availableLists.map((k) => (
          <button
            key={k}
            role="tab"
            aria-selected={list === k}
            title={dict.lists[k].label}
            onClick={() => {
              setList(k)
              resetStage()
            }}
            className={cn(
              "min-w-0 flex-1 whitespace-nowrap rounded-full px-2 py-2.5 text-xs font-medium transition-colors sm:px-4 sm:text-sm",
              list === k ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <span className="sm:hidden">{dict.lists[k].short}</span>
            <span className="hidden sm:inline">{dict.lists[k].label}</span>
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setFiltersOpen((v) => !v)}
        aria-expanded={filtersOpen}
        aria-controls="filtros"
        className="flex w-full max-w-md items-center justify-between gap-2 rounded-2xl border border-border bg-card/60 px-4 py-3 text-sm font-medium backdrop-blur sm:hidden"
      >
        <span className="inline-flex items-center gap-2">
          <SlidersHorizontal className="size-4 text-primary" aria-hidden />
          {dict.filters.button}
          {activeFilterCount > 0 && (
            <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-primary-foreground">
              {activeFilterCount}
            </span>
          )}
        </span>
        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
          {filtersOpen ? dict.filters.close : filterSummary}
          <ChevronDown className={cn("size-4 transition-transform", filtersOpen && "rotate-180")} aria-hidden />
        </span>
      </button>

      <div
        id="filtros"
        className={cn("w-full flex-col items-center gap-5 sm:gap-7", filtersOpen ? "flex" : "hidden sm:flex")}
      >
        <div className="flex w-full flex-col items-center gap-2">
          <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{dict.filters.whereToWatch}</span>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Chip
              active={provider === null}
              onClick={() => {
                setProvider(null)
                resetStage()
              }}
            >
              {dict.filters.anyService}
            </Chip>
            {PROVIDERS.map((p) => (
              <Chip
                key={p.id}
                active={provider === p.id}
                onClick={() => {
                  setProvider(p.id)
                  resetStage()
                }}
              >
                {p.name}
              </Chip>
            ))}
          </div>
          {provider !== null && !live && (
            <p className="text-xs text-accent">{dict.filters.needsLive}</p>
          )}
        </div>

        {media === "tv" && (
          <div className="flex w-full flex-col items-center gap-2">
            <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              {dict.filters.origin}
            </span>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Chip
                active={origin === null}
                onClick={() => {
                  setOrigin(null)
                  resetStage()
                }}
              >
                {dict.filters.allOrigins}
              </Chip>
              {ORIGINS.map((o) => (
                <Chip
                  key={o}
                  active={origin === o}
                  onClick={() => {
                    setOrigin(o)
                    resetStage()
                  }}
                >
                  {dict.origins[o]}
                </Chip>
              ))}
            </div>
          </div>
        )}

        {genres.length > 1 && (
          <div className="flex w-full flex-col items-center gap-2">
            <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{dict.filters.genre}</span>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Chip active={genre === "todos"} onClick={() => setGenre("todos")}>
                {dict.filters.allGenres}
              </Chip>
              {genres.map((g) => (
                <Chip key={g} active={genre === g} onClick={() => setGenre(g)}>
                  {g}
                </Chip>
              ))}
            </div>
          </div>
        )}

        {decades.length > 1 && (
          <div className="flex w-full flex-col items-center gap-2">
            <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{dict.filters.decade}</span>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Chip active={decade === null} onClick={() => setDecade(null)}>
                {dict.filters.allDecades}
              </Chip>
              {decades.map((d) => (
                <Chip key={d} active={decade === d} onClick={() => setDecade(d)}>
                  {d}s
                </Chip>
              ))}
            </div>
          </div>
        )}
      </div>

      {hasFilters && (
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
          <span>
            {t(pool.length === 1 ? dict.filters.countOne : dict.filters.countOther, { count: pool.length })}
          </span>
          <button
            onClick={clearFilters}
            className="inline-flex min-h-8 items-center gap-1 rounded-full border border-border px-3 py-1 font-medium transition-colors hover:border-primary/50 hover:text-foreground"
          >
            <X className="size-3" aria-hidden />
            {dict.filters.clear}
          </button>
        </div>
      )}

      <div
        ref={stageRef}
        className="relative flex min-h-[19rem] w-full scroll-mt-4 items-center justify-center pb-6 sm:min-h-[24rem] sm:pb-0"
      >
        {stale ? (
          <LoadingStage dict={dict} />
        ) : pool.length === 0 ? (
          <EmptyStage onClear={clearFilters} dict={dict} />
        ) : phase === "idle" ? (
          <IdleStage count={pool.length} label={mediaMeta.label} mode={mode} dict={dict} />
        ) : phase === "spinning" ? (
          <SpinningStage title={reelTitle} dict={dict} />
        ) : phase === "choices" ? (
          <ChoicesStage choices={choices} onPick={chooseOne} dict={dict} />
        ) : current ? (
          <ResultCard
            title={current}
            source={source}
            mediaLabel={mediaMeta.label}
            locale={locale}
            dict={dict}
            expanded={synopsisOpen}
            onToggleExpanded={() => setSynopsisOpen((v) => !v)}
          />
        ) : null}
      </div>

      <div
        className={cn(
          "z-20 flex w-full flex-col items-center gap-3 pb-3 pt-8 sm:static sm:bg-none sm:pb-0 sm:pt-0",
          synopsisOpen
            ? "static"
            : "sticky bottom-0 bg-linear-to-t from-background via-background/95 to-transparent",
        )}
      >
        <button
          onClick={draw}
          disabled={phase === "spinning" || pool.length === 0}
          className={cn(
            "group relative inline-flex min-h-14 items-center gap-3 rounded-full bg-primary px-8 py-4 text-base font-semibold text-primary-foreground sm:px-9 sm:text-lg",
            "shadow-[0_0_40px_-8px_var(--primary)] transition-transform active:scale-95 disabled:opacity-60",
            phase !== "spinning" && "hover:scale-[1.03]",
          )}
        >
          {phase === "result" || phase === "choices" ? (
            <RotateCcw className="size-5" aria-hidden />
          ) : (
            <Dices className={cn("size-5", phase === "spinning" && "animate-spin")} aria-hidden />
          )}
          {phase === "spinning"
            ? dict.actions.drawing
            : phase === "result" || phase === "choices"
              ? dict.actions.again
              : mode === "triple"
                ? dict.actions.drawThree
                : t(dict.actions.drawOne, { kind: mediaMeta.singular })}
        </button>
        {count > 0 && (
          <p className="text-xs text-muted-foreground">
            {t(count === 1 ? dict.actions.countOne : dict.actions.countOther, { count })}
          </p>
        )}
      </div>
    </div>
  )
}

function Segmented({
  value,
  onChange,
  options,
  ariaLabel,
}: {
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string; icon?: React.ReactNode }[]
  ariaLabel: string
}) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className="flex items-center gap-1 rounded-full border border-border bg-card/60 p-1 backdrop-blur"
    >
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          aria-pressed={value === o.value}
          className={cn(
            "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors",
            value === o.value
              ? "bg-primary text-primary-foreground shadow"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {o.icon}
          {o.label}
        </button>
      ))}
    </div>
  )
}

function Chip({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex min-h-9 items-center rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
        active
          ? "border-primary bg-primary/15 text-primary"
          : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground",
      )}
    >
      {children}
    </button>
  )
}

function LoadingStage({ dict }: { dict: Dictionary }) {
  return (
    <div className="flex flex-col items-center gap-4 text-muted-foreground">
      <Loader2 className="size-10 animate-spin text-primary" aria-hidden />
      <p className="text-sm">{dict.stage.loading}</p>
    </div>
  )
}

function EmptyStage({ onClear, dict }: { onClear: () => void; dict: Dictionary }) {
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <div className="flex size-28 items-center justify-center rounded-full border border-border bg-card/50">
        <Film className="size-12 text-muted-foreground" aria-hidden />
      </div>
      <p className="max-w-xs text-balance text-muted-foreground">{dict.stage.empty}</p>
      <button
        onClick={onClear}
        className="inline-flex items-center gap-2 rounded-full border border-primary px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
      >
        <X className="size-4" aria-hidden />
        {dict.filters.clear}
      </button>
    </div>
  )
}

function IdleStage({
  count,
  label,
  mode,
  dict,
}: {
  count: number
  label: string
  mode: Mode
  dict: Dictionary
}) {
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <div className="relative flex size-24 items-center justify-center rounded-full border border-border bg-card/50 sm:size-28">
        <div className="absolute inset-0 animate-ping rounded-full border border-primary/30" />
        <Film className="size-10 text-primary sm:size-12" aria-hidden />
      </div>
      <p className="max-w-xs text-balance text-muted-foreground">
        {mode === "triple" ? dict.stage.idleTriple : dict.stage.idleSingle}
        <span className="text-foreground">
          {count} {label.toLowerCase()}
        </span>{" "}
        {dict.stage.idleTail}
      </p>
    </div>
  )
}

function SpinningStage({ title, dict }: { title: string; dict: Dictionary }) {
  return (
    <div className="flex w-full flex-col items-center gap-4 overflow-hidden text-center">
      <span className="text-xs uppercase tracking-[0.3em] text-primary">{dict.stage.shuffling}</span>
      <div className="flex h-24 w-full items-center justify-center rounded-2xl border border-border bg-card/60 px-4">
        <span
          key={title}
          className="animate-in fade-in slide-in-from-bottom-2 font-display text-3xl text-foreground/90 duration-150 sm:text-4xl"
        >
          {title}
        </span>
      </div>
    </div>
  )
}

function ChoicesStage({
  choices,
  onPick,
  dict,
}: {
  choices: Title[]
  onPick: (t: Title) => void
  dict: Dictionary
}) {
  return (
    <div className="flex w-full flex-col gap-3 pb-20 sm:gap-4 sm:pb-0">
      <p className="text-center text-sm text-muted-foreground">{dict.stage.chooseOne}</p>
      <div className="flex w-full flex-col gap-3 sm:grid sm:grid-cols-3 sm:gap-4">
        {choices.map((item, i) => (
          <button
            key={item.id}
            onClick={() => onPick(item)}
            style={{ animationDelay: `${i * 80}ms` }}
            className="group animate-in fade-in zoom-in-95 flex flex-row items-stretch overflow-hidden rounded-2xl border border-border bg-card text-left shadow-lg transition-all duration-300 hover:border-primary hover:shadow-[0_0_30px_-10px_var(--primary)] focus:outline-none focus-visible:border-primary sm:flex-col"
          >
            <div className="relative aspect-2/3 w-18 shrink-0 overflow-hidden bg-secondary sm:w-full">
              {item.poster ? (
                <img
                  src={item.poster || "/placeholder.svg"}
                  alt={t(dict.result.posterAlt, { title: item.title })}
                  className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="flex size-full items-center justify-center">
                  <Film className="size-8 text-muted-foreground sm:size-10" aria-hidden />
                </div>
              )}
              <span className="absolute left-1 top-1 inline-flex items-center gap-0.5 rounded-full bg-background/85 px-1.5 py-0.5 text-[0.65rem] font-bold text-primary backdrop-blur sm:left-2 sm:top-2 sm:px-2 sm:text-xs">
                <Hash className="size-2.5 sm:size-3" aria-hidden />
                {item.rank}
              </span>
              <span className="absolute right-2 top-2 hidden items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-primary-foreground sm:inline-flex">
                <Star className="size-3 fill-current" aria-hidden />
                {item.rating.toFixed(1)}
              </span>
            </div>

            <div className="flex min-w-0 flex-1 flex-col justify-center gap-1 p-3 sm:justify-start sm:p-3">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-balance font-display text-xl leading-tight tracking-wide text-foreground">
                  {item.title}
                </h3>
                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-primary-foreground sm:hidden">
                  <Star className="size-3 fill-current" aria-hidden />
                  {item.rating.toFixed(1)}
                </span>
              </div>
              <p className="truncate text-xs text-muted-foreground">
                {item.year > 0 && <span>{item.year}</span>}
                {item.genre && <span> · {item.genre}</span>}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

type Trailer = { key: string; name: string } | null

function ResultCard({
  title,
  source,
  mediaLabel,
  locale,
  dict,
  expanded,
  onToggleExpanded,
}: {
  title: Title
  source: string
  mediaLabel: string
  locale: string
  dict: Dictionary
  expanded: boolean
  onToggleExpanded: () => void
}) {
  const [trailerOpen, setTrailerOpen] = useState(false)

  const isLong = title.synopsis.length > 220

  const { data: trailerData } = useSWR<{ trailer: Trailer }>(
    `/api/trailer?locale=${locale}&media=${title.mediaType}&id=${title.id}`,
    fetchJson,
    { revalidateOnFocus: false },
  )
  const trailer = trailerData?.trailer ?? null

  useEffect(() => {
    setTrailerOpen(false)
  }, [title.id])

  return (
    <>
      <article className="animate-in fade-in zoom-in-95 mb-16 grid w-full grid-cols-[auto_1fr] gap-x-4 gap-y-3 rounded-2xl border border-border bg-card p-4 shadow-lg duration-300 sm:mb-0 sm:gap-x-6 sm:gap-y-4 sm:rounded-3xl sm:p-6">
        {title.poster && (
          <img
            src={title.poster || "/placeholder.svg"}
            alt={t(dict.result.posterAlt, { title: title.title })}
            className="aspect-2/3 w-24 self-start rounded-xl border border-border/60 object-cover sm:row-span-2 sm:w-40 sm:rounded-2xl"
          />
        )}

        <div className="flex min-w-0 flex-col gap-2 sm:gap-3">
          <div className="flex items-start justify-between gap-3">
            <span className="min-w-0 text-[0.65rem] font-medium uppercase tracking-widest text-muted-foreground sm:text-xs">
              {source}
              <span className="hidden sm:inline"> · {mediaLabel}</span>
            </span>
            <RatingBadge value={title.rating} />
          </div>

          <div>
            <h2 className="text-balance font-display text-2xl leading-none tracking-wide text-foreground sm:text-4xl">
              {title.title}
            </h2>
            <p className="mt-2 text-xs text-muted-foreground sm:text-sm">
              <span className="text-primary">{t(dict.result.rank, { rank: title.rank })}</span>
              {title.year > 0 && <span> · {title.year}</span>}
              {title.director && <span> · {t(dict.result.directedBy, { name: title.director })}</span>}
            </p>
          </div>
        </div>

        <div className="col-span-2 flex min-w-0 flex-col gap-3 sm:col-span-1 sm:gap-4">
          <div>
            <p
              className={cn(
                "text-pretty text-sm leading-relaxed text-foreground/80 sm:text-base",
                !expanded && "line-clamp-4 sm:line-clamp-5",
              )}
            >
              {title.synopsis}
            </p>
            {isLong && (
              <button
                onClick={onToggleExpanded}
                aria-expanded={expanded}
                className="mt-1 inline-flex min-h-8 items-center gap-1 text-xs font-medium text-primary transition-colors hover:text-primary/80"
              >
                {expanded ? dict.result.readLess : dict.result.readMore}
                {expanded ? (
                  <ChevronUp className="size-3.5" aria-hidden />
                ) : (
                  <ChevronDown className="size-3.5" aria-hidden />
                )}
              </button>
            )}
          </div>

          <div className="mt-auto flex flex-wrap items-center gap-2">
            <Meta icon={<Film className="size-3.5" aria-hidden />}>{title.genre}</Meta>
            {title.runtime ? (
              <Meta icon={<Clock className="size-3.5" aria-hidden />}>
                {Math.floor(title.runtime / 60)}h{String(title.runtime % 60).padStart(2, "0")}
              </Meta>
            ) : null}
            {title.year > 0 && <Meta icon={<Star className="size-3.5" aria-hidden />}>{title.year}</Meta>}
          </div>

          {trailer && (
            <button
              onClick={() => setTrailerOpen(true)}
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary/60 hover:text-primary sm:w-auto sm:self-start"
            >
              <Play className="size-4 fill-current" aria-hidden />
              {dict.result.watchTrailer}
            </button>
          )}
        </div>
      </article>

      {trailer && trailerOpen && (
        <TrailerModal
          videoKey={trailer.key}
          label={t(dict.result.trailerOf, { title: title.title })}
          closeLabel={dict.result.closeTrailer}
          onClose={() => setTrailerOpen(false)}
        />
      )}
    </>
  )
}

function TrailerModal({
  videoKey,
  label,
  closeLabel,
  onClose,
}: {
  videoKey: string
  label: string
  closeLabel: string
  onClose: () => void
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", onKey)
    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = previous
    }
  }, [onClose])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={label}
      onClick={onClose}
      className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-background/90 p-4 backdrop-blur duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="animate-in zoom-in-95 flex w-full max-w-3xl flex-col gap-3 duration-200"
      >
        <div className="flex items-center justify-between gap-3">
          <span className="truncate text-sm font-medium text-foreground">{label}</span>
          <button
            onClick={onClose}
            aria-label={closeLabel}
            className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>
        <div className="aspect-video w-full overflow-hidden rounded-2xl border border-border bg-black">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${videoKey}?autoplay=1&rel=0`}
            title={label}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="size-full"
          />
        </div>
      </div>
    </div>
  )
}

function RatingBadge({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-primary-foreground">
      <Star className="size-3.5 fill-current" aria-hidden />
      <span className="text-sm font-bold tabular-nums">{value.toFixed(1)}</span>
    </div>
  )
}

function Meta({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/50 px-3 py-1 text-xs text-muted-foreground">
      {icon}
      {children}
    </span>
  )
}

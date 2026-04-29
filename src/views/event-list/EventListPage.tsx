import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Calendar, MapPin, Music, RefreshCw, AlertCircle, ExternalLink } from 'lucide-react'
import { apiBase } from '../../lib/api-base'
import { getExploreCategoryDef } from '../../data/exploreCategories'
import { getLocationCityById } from '../../data/locationRegions'
import { mapRemoteEventRowToEventItem } from '../../lib/map-event'
import type { EventItem } from '../../types'
import './event-list.css'

type EventRow = {
  item: EventItem
  raw: Record<string, unknown>
  sourceUrl?: string
}

type SourcePreview = {
  title?: string | null
  description?: string | null
  image?: string | null
}

const ESTIMATED_CARD_HEIGHT = 400
const VIRTUAL_OVERSCAN = 5

function eventsUrl(): string {
  const base = apiBase()
  if (!base) return '/api/events'
  return `${base}/api/events`
}

function sourcePreviewUrl(sourceUrl: string): string {
  const base = apiBase()
  const path = `/api/source-preview?url=${encodeURIComponent(sourceUrl)}`
  if (!base) return path
  return `${base}${path}`
}

function microlinkScreenshotUrl(sourceUrl: string): string {
  return `https://api.microlink.io/?url=${encodeURIComponent(sourceUrl)}&screenshot=true&meta=false&embed=screenshot.url`
}

function titleFromId(value: string): string {
  return value
    .replace(/[-_]+/g, ' ')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function categoryLabelFor(id: string): string | null {
  if (!id) return null
  const fromCatalog = getExploreCategoryDef(id)?.label
  if (fromCatalog) return fromCatalog
  if (/^\d+$/.test(id)) return `Category ${id}`
  return titleFromId(id)
}

function cityLabelFor(id: string): string | null {
  if (!id || id === 'unknown') return null
  return getLocationCityById(id)?.name ?? titleFromId(id)
}

function isMissingValue(value: unknown): boolean {
  return value == null || (typeof value === 'string' && value.trim().length === 0)
}

function formatRawValue(value: unknown): string {
  if (value === null) return 'null'
  if (value === undefined) return 'undefined'
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  return JSON.stringify(value)
}

export function EventListPage() {
  const [rows, setRows] = useState<EventRow[] | null>(null)
  const [previews, setPreviews] = useState<Record<string, SourcePreview>>({})
  const [visibleIndexes, setVisibleIndexes] = useState<Set<number>>(() => new Set())
  const [scrollTop, setScrollTop] = useState(0)
  const [viewportHeight, setViewportHeight] = useState(900)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const observerRef = useRef<IntersectionObserver | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(eventsUrl(), { credentials: 'include' })
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string }
        setRows(null)
        setError(j.error ?? `HTTP ${res.status}`)
        return
      }
      const data = (await res.json()) as Record<string, unknown>[]
      if (!Array.isArray(data)) {
        setRows(null)
        setError('Invalid response: expected a JSON array')
        return
      }
      setRows(
        data.map((r) => ({
          item: mapRemoteEventRowToEventItem(r),
          raw: r,
          sourceUrl: typeof r.source_url === 'string' ? r.source_url : undefined,
        })),
      )
    } catch (e) {
      setRows(null)
      setError(e instanceof Error ? e.message : 'Request failed')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    if (!rows) return

    const sourceUrls = [
      ...new Set(
        rows
          .filter((_, index) => visibleIndexes.has(index))
          .map((r) => r.sourceUrl)
          .filter((url): url is string => Boolean(url)),
      ),
    ]
    const missingUrls = sourceUrls.filter((url) => !(url in previews))
    if (missingUrls.length === 0) return

    let cancelled = false

    void Promise.all(
      missingUrls.map(async (url) => {
        try {
          const res = await fetch(sourcePreviewUrl(url), { credentials: 'include' })
          if (!res.ok) return [url, {}] as const
          const preview = (await res.json()) as SourcePreview
          return [url, preview] as const
        } catch {
          return [url, {}] as const
        }
      }),
    ).then((entries) => {
      if (cancelled) return
      setPreviews((current) => {
        const next = { ...current }
        for (const [url, preview] of entries) next[url] = preview
        return next
      })
    })

    return () => {
      cancelled = true
    }
  }, [rows, previews, visibleIndexes])

  useEffect(() => {
    observerRef.current?.disconnect()
    observerRef.current = new IntersectionObserver(
      (entries) => {
        setVisibleIndexes((current) => {
          let changed = false
          const next = new Set(current)

          for (const entry of entries) {
            if (!entry.isIntersecting) continue
            const index = Number((entry.target as HTMLElement).dataset.eventIndex)
            if (Number.isFinite(index) && !next.has(index)) {
              next.add(index)
              changed = true
            }
          }

          return changed ? next : current
        })
      },
      { rootMargin: '500px 0px' },
    )

    return () => observerRef.current?.disconnect()
  }, [])

  const observeCard = useCallback((node: HTMLLIElement | null) => {
    if (!node || !observerRef.current) return
    observerRef.current.observe(node)
  }, [])

  const handleRootScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const target = event.currentTarget
    setScrollTop(target.scrollTop)
    setViewportHeight(target.clientHeight)
  }, [])

  const totalRows = rows?.length ?? 0
  const startIndex = Math.max(0, Math.floor(scrollTop / ESTIMATED_CARD_HEIGHT) - VIRTUAL_OVERSCAN)
  const endIndex = Math.min(
    totalRows,
    Math.ceil((scrollTop + viewportHeight) / ESTIMATED_CARD_HEIGHT) + VIRTUAL_OVERSCAN,
  )
  const visibleRows = rows?.slice(startIndex, endIndex) ?? []
  const topSpacerHeight = startIndex * ESTIMATED_CARD_HEIGHT
  const bottomSpacerHeight = Math.max(0, (totalRows - endIndex) * ESTIMATED_CARD_HEIGHT)

  return (
    <div
      className="event-list-root"
      onScroll={handleRootScroll}
      style={{
        background: 'var(--bg)',
        color: 'var(--text)',
        padding: 'max(1rem, env(safe-area-inset-top)) 1rem 2rem',
      }}
    >
      <div className="event-list-inner">
        <header className="event-list-header">
          <div className="event-list-title-row">
            <Link to="/" className="event-list-back" aria-label="Back to app">
              <ArrowLeft size={20} strokeWidth={2} />
            </Link>
            <div>
              <h1 className="event-list-h1">Events</h1>
              <p className="event-list-sub">
                From <code className="event-list-code">/api/events</code> (Turso first)
                {rows ? ` · ${rows.length} results` : ''}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => void load()}
            disabled={loading}
            className="event-list-refresh"
          >
            <RefreshCw size={16} className={loading ? 'spin' : undefined} />
            Refresh
          </button>
        </header>

        {error && (
          <div className="event-list-alert" role="alert">
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <div>
              <p className="event-list-h1" style={{ fontSize: '0.9rem' }}>
                Could not load events
              </p>
              <p className="event-list-muted" style={{ marginTop: '0.25rem' }}>
                {error}
              </p>
            </div>
          </div>
        )}

        {loading && !rows && !error && <p className="event-list-muted">Loading…</p>}

        {rows && rows.length === 0 && !loading && (
          <p className="event-list-muted">No events returned.</p>
        )}

        {rows && rows.length > 0 && (
          <ul className="event-list-list" aria-live="polite">
            {topSpacerHeight > 0 ? (
              <li className="event-list-spacer" style={{ height: topSpacerHeight }} />
            ) : null}
            {visibleRows.map(({ item, raw, sourceUrl }, offset) => {
              const idx = startIndex + offset
              const categoryLabel = categoryLabelFor(item.exploreCategoryId)
              const cityLabel = cityLabelFor(item.locationCityId)
              const shouldLoadSourcePreview = visibleIndexes.has(idx)
              const preview = sourceUrl && shouldLoadSourcePreview ? previews[sourceUrl] : undefined
              const isScreenshot = Boolean(sourceUrl) && shouldLoadSourcePreview
              const image =
                preview?.image ||
                (isScreenshot ? microlinkScreenshotUrl(sourceUrl!) : item.image)

              return <li
                key={`${item.id ?? 'no-id'}-${idx}`}
                ref={observeCard}
                data-event-index={idx}
                className="event-list-card"
              >
                <div className="event-list-row">
                  <div className="event-list-thumb-wrap" aria-hidden>
                    <img src={image} alt="" className="event-list-thumb" loading="lazy" />
                    {isScreenshot ? (
                      <span className="event-list-preview-badge">Source preview</span>
                    ) : null}
                  </div>
                  <div className="event-list-body">
                    <h2 className="event-list-h2">{item.title || 'Untitled event'}</h2>
                    <p className="event-list-meta">{[item.venue, item.district].filter(Boolean).join(' · ') || 'Venue TBC'}</p>

                    <ul className="event-list-chips">
                      <li>
                        <Calendar size={12} aria-hidden />
                        {item.time || 'Time TBC'}
                      </li>
                      {item.genre ? (
                        <li>
                          <Music size={12} aria-hidden />
                          {item.genre}
                        </li>
                      ) : null}
                      {categoryLabel ? (
                        <li>{categoryLabel}</li>
                      ) : null}
                      {cityLabel ? (
                        <li>
                          <MapPin size={12} aria-hidden />
                          {cityLabel}
                        </li>
                      ) : null}
                    </ul>

                    {sourceUrl ? (
                      <a
                        href={sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="event-list-source"
                        title={sourceUrl}
                      >
                        View source
                        <ExternalLink size={12} aria-hidden />
                      </a>
                    ) : null}

                    <details className="event-list-raw">
                      <summary>All Turso fields</summary>
                      <dl className="event-list-raw-grid">
                        {Object.entries(item).map(([key, value]) => {
                          const missing = isMissingValue(value)

                          return (
                            <div
                              key={`mapped-${key}`}
                              className={`event-list-raw-field${missing ? ' is-missing' : ''}`}
                            >
                              <dt>{key}</dt>
                              <dd>{formatRawValue(value)}</dd>
                            </div>
                          )
                        })}
                        {Object.entries(raw).map(([key, value]) => {
                          const missing = isMissingValue(value)

                          return (
                            <div
                              key={`raw-${key}`}
                              className={`event-list-raw-field${missing ? ' is-missing' : ''}`}
                            >
                              <dt>{key}</dt>
                              <dd>{formatRawValue(value)}</dd>
                            </div>
                          )
                        })}
                      </dl>
                    </details>
                  </div>
                </div>
              </li>
            })}
            {bottomSpacerHeight > 0 ? (
              <li className="event-list-spacer" style={{ height: bottomSpacerHeight }} />
            ) : null}
          </ul>
        )}
      </div>
    </div>
  )
}

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Heart, Info, Share2, SlidersHorizontal } from 'lucide-react'
import { LocationCityPickerControl } from '../../components/LocationCityPickerControl'
import { useAppState } from '../../store/appStore'
import type { EventItem } from '../../types'

// ─── Genre → visual accent mapping ───────────────────────────────────────────
const GENRE_ACCENT: Record<string, string> = {
  Techno: '#ff4500',
  'Club Nights': '#00aaff',
  Jazz: '#00cc66',
  Underground: '#cc00ff',
  Electronic: '#ff6600',
  'Cocktail Bar': '#ffaa00',
  'Live Music': '#ff3d00',
  'Hip-Hop': '#ffcc00',
  House: '#ff6699',
}
const DEFAULT_ACCENT = '#ff3d00'

const GENRE_BG: Record<string, string> = {
  Techno: '#1a0a00',
  'Club Nights': '#000d1a',
  Jazz: '#000a05',
  Underground: '#0d0010',
  Electronic: '#0d0800',
  'Cocktail Bar': '#1a0e00',
  'Live Music': '#0d0500',
  'Hip-Hop': '#0d0d00',
  House: '#1a000d',
}
const DEFAULT_BG = '#0a0a0a'

const GENRES_FILTER = [
  'All',
  'Techno',
  'Club Nights',
  'Jazz',
  'Underground',
  'Live Music',
  'Electronic',
  'Cocktail Bar',
]

const TIME_FILTER = ['All', 'Before 9PM', '9PM-11PM', 'After 11PM'] as const
const AREA_FILTER = [
  'All',
  'Clarke Quay',
  'Marina Bay',
  'Tiong Bahru',
  'Raffles Place',
  'Downtown Core',
] as const
const PRICE_FILTER = ['All', 'Free', 'Under $20', '$20-$50', '$50+'] as const

export type EventFeedFilters = {
  genre: string
  time: (typeof TIME_FILTER)[number]
  area: (typeof AREA_FILTER)[number]
  price: (typeof PRICE_FILTER)[number]
}

const DEFAULT_FILTERS: EventFeedFilters = {
  genre: 'All',
  time: 'All',
  area: 'All',
  price: 'All',
}

function parseEventTimeMinutes(time: string): number | null {
  const m = time.trim().match(/^(\d{1,2}):(\d{2})/)
  if (!m) return null
  return Number(m[1]) * 60 + Number(m[2])
}

function parsePriceAmount(ticketPrice: string): number | null {
  const lower = ticketPrice.toLowerCase()
  if (lower.includes('free')) return 0
  const m = ticketPrice.match(/([\d.]+)/)
  if (!m) return null
  return Number.parseFloat(m[1])
}

function eventMatchesFilters(event: EventItem, f: EventFeedFilters): boolean {
  if (f.genre !== 'All' && event.genre !== f.genre) return false

  if (f.area !== 'All' && event.district !== f.area) return false

  if (f.time !== 'All') {
    const mins = parseEventTimeMinutes(event.time)
    if (mins != null) {
      const t21 = 21 * 60
      const t23 = 23 * 60
      if (f.time === 'Before 9PM' && mins >= t21) return false
      if (f.time === '9PM-11PM' && (mins < t21 || mins >= t23)) return false
      if (f.time === 'After 11PM' && mins < t23) return false
    }
  }

  if (f.price !== 'All') {
    const lower = event.ticketPrice.toLowerCase()
    const isFree = lower.includes('free')
    const n = parsePriceAmount(event.ticketPrice)
    const amount = n ?? (isFree ? 0 : NaN)

    if (f.price === 'Free') {
      if (!isFree && amount !== 0) return false
    } else if (Number.isNaN(amount)) {
      return false
    } else if (f.price === 'Under $20') {
      if (amount >= 20) return false
    } else if (f.price === '$20-$50') {
      if (amount < 20 || amount >= 50) return false
    } else if (f.price === '$50+') {
      if (amount < 50) return false
    }
  }

  return true
}

function countActiveFilters(f: EventFeedFilters): number {
  let n = 0
  if (f.genre !== 'All') n += 1
  if (f.time !== 'All') n += 1
  if (f.area !== 'All') n += 1
  if (f.price !== 'All') n += 1
  return n
}

function getAccent(genre: string) {
  return GENRE_ACCENT[genre] ?? DEFAULT_ACCENT
}

function getBg(genre: string) {
  return GENRE_BG[genre] ?? DEFAULT_BG
}

function getTag(event: EventItem): string {
  const buzz = event.buzzPct ?? event.verified
  if (buzz >= 97) return 'SELLING FAST'
  if (buzz >= 94) return 'HIGH BUZZ'
  if (buzz >= 90) return 'LIMITED SEATS'
  return 'TONIGHT'
}

// ─── Single card ─────────────────────────────────────────────────────────────
type EventCardProps = {
  event: EventItem
  isGoing: boolean
  isSaved: boolean
  onGoing: () => void
  onSave: () => void
  onMoreDetails: () => void
}

function EventCard({ event, isGoing, isSaved, onGoing, onSave, onMoreDetails }: EventCardProps) {
  const [loaded, setLoaded] = useState(false)
  const accent = getAccent(event.genre)
  const bgColor = getBg(event.genre)
  const buzz = event.buzzPct ?? event.verified
  const tag = getTag(event)

  return (
    <div className="ecf-slide" style={{ background: bgColor }}>
      <img
        src={event.image}
        alt={event.title}
        className={`ecf-bg-img${loaded ? ' ecf-bg-img--loaded' : ''}`}
        onLoad={() => setLoaded(true)}
        loading="lazy"
        decoding="async"
      />
      <div
        className="ecf-overlay"
        style={{
          background: `linear-gradient(160deg, ${bgColor}88 0%, transparent 50%, ${bgColor}ff 75%)`,
        }}
      />

      {/* Tag badge */}
      <div className="ecf-tags">
        <span
          className="ecf-tag"
          style={{ border: `1px solid ${accent}66`, color: accent }}
        >
          {tag}
        </span>
      </div>

      {/* Bottom content block */}
      <div className="ecf-body">
        {/* Buzz bar */}
        <div className="ecf-buzz-row">
          <div className="ecf-buzz-track">
            <div
              className="ecf-buzz-fill"
              style={{ width: `${buzz}%`, background: accent }}
            />
          </div>
          <span className="ecf-buzz-pct" style={{ color: accent }}>
            {buzz}% BUZZ
          </span>
        </div>

        <p className="ecf-genre" style={{ color: accent }}>
          {event.genre.toUpperCase()}
        </p>
        <h2 className="ecf-title">{event.title.toUpperCase()}</h2>
        <p className="ecf-subtitle">{event.venue}</p>
        <p className="ecf-desc">
          {event.vibeTags.join(' · ')}
          {event.hostPrompt ? <> &mdash; <em>{event.hostPrompt}</em></> : null}
        </p>

        {/* Meta row: WHERE / WHEN / PRICE */}
        <div className="ecf-meta-row">
          {[
            { label: 'WHERE', value: event.district },
            { label: 'WHEN', value: event.time },
            { label: 'PRICE', value: event.ticketPrice },
          ].map((m) => (
            <div key={m.label} className="ecf-meta-col">
              <p className="ecf-meta-label">{m.label}</p>
              <p className="ecf-meta-value">{m.value}</p>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="ecf-actions">
          <button
            type="button"
            className={`ecf-going-btn${isGoing ? ' ecf-going-btn--active' : ''}`}
            style={isGoing ? { background: accent, borderColor: accent } : undefined}
            onClick={onGoing}
          >
            {isGoing ? '✓ I\'m Going' : 'I\'m Going'}
          </button>
          <button
            type="button"
            className="ecf-details-btn"
            aria-label={`More details for ${event.title}`}
            onClick={onMoreDetails}
          >
            <Info size={16} strokeWidth={2} aria-hidden />
            <span className="ecf-details-btn-label">More details</span>
          </button>
          <button
            type="button"
            className="ecf-icon-btn"
            aria-label="Save event"
            onClick={onSave}
            style={isSaved ? { color: accent, borderColor: accent } : undefined}
          >
            <Heart
              size={18}
              strokeWidth={isSaved ? 2.5 : 2}
              fill={isSaved ? accent : 'none'}
              aria-hidden
            />
          </button>
          <button
            type="button"
            className="ecf-icon-btn"
            aria-label="Share event"
          >
            <Share2 size={18} strokeWidth={2} aria-hidden />
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Filter bottom sheet ──────────────────────────────────────────────────────
type FilterSheetProps = {
  applied: EventFeedFilters
  onApply: (next: EventFeedFilters) => void
  onClose: () => void
}

function FilterSheet({ applied, onApply, onClose }: FilterSheetProps) {
  const [draft, setDraft] = useState<EventFeedFilters>(applied)

  useLayoutEffect(() => {
    setDraft(applied)
  }, [applied])

  const chip = (
    active: boolean,
    label: string,
    onClick: () => void,
  ) => (
    <button
      key={label}
      type="button"
      className={`ecf-filter-chip${active ? ' ecf-filter-chip--active' : ''}`}
      onClick={onClick}
    >
      {label}
    </button>
  )

  return (
    <div className="ecf-filter-backdrop" onClick={onClose}>
      <div className="ecf-filter-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="ecf-filter-handle" />
        <h2 className="ecf-filter-title">Filter</h2>

        <div className="ecf-filter-body">
          <section className="ecf-filter-section">
            <p className="ecf-filter-section-label">Genre</p>
            <div className="ecf-filter-chips">
              {GENRES_FILTER.map((g) =>
                chip(draft.genre === g, g, () => setDraft((d) => ({ ...d, genre: g }))),
              )}
            </div>
          </section>

          <section className="ecf-filter-section">
            <p className="ecf-filter-section-label">Time</p>
            <div className="ecf-filter-chips">
              {TIME_FILTER.map((t) =>
                chip(draft.time === t, t, () => setDraft((d) => ({ ...d, time: t }))),
              )}
            </div>
          </section>

          <section className="ecf-filter-section">
            <p className="ecf-filter-section-label">Area</p>
            <div className="ecf-filter-chips">
              {AREA_FILTER.map((a) =>
                chip(draft.area === a, a, () => setDraft((d) => ({ ...d, area: a }))),
              )}
            </div>
          </section>

          <section className="ecf-filter-section">
            <p className="ecf-filter-section-label">Price</p>
            <div className="ecf-filter-chips">
              {PRICE_FILTER.map((p) =>
                chip(draft.price === p, p, () => setDraft((d) => ({ ...d, price: p }))),
              )}
            </div>
          </section>
        </div>

        <button
          type="button"
          className="ecf-filter-apply"
          onClick={() => onApply(draft)}
        >
          Show Results
        </button>
      </div>
    </div>
  )
}

// ─── Main EventCardFeed ───────────────────────────────────────────────────────
type EventCardFeedProps = {
  events: EventItem[]
  onMoreDetails: (eventId: string) => void
}

export function EventCardFeed({ events, onMoreDetails }: EventCardFeedProps) {
  const locationCityId = useAppState((s) => s.feedLocationCityId)
  const [filters, setFilters] = useState<EventFeedFilters>(DEFAULT_FILTERS)
  const [showFilter, setShowFilter] = useState(false)
  const [going, setGoing] = useState<string[]>([])
  const [saved, setSaved] = useState<string[]>([])
  const [cardIdx, setCardIdx] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)

  const activeCount = countActiveFilters(filters)
  const filtered = useMemo(
    () =>
      events
        .filter((e) => e.locationCityId === locationCityId)
        .filter((e) => eventMatchesFilters(e, filters)),
    [events, locationCityId, filters],
  )

  // Track which card is visible via scroll position
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const onScroll = () => {
      setCardIdx(Math.round(el.scrollTop / el.clientHeight))
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  // Reset scroll position when city or filters change
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0
    setCardIdx(0)
  }, [filters, locationCityId])

  const toggleGoing = (id: string) =>
    setGoing((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )

  const toggleSaved = (id: string) =>
    setSaved((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )

  return (
    <div className="ecf-root">
      {/* Header */}
      <div className="ecf-header">
        {/* Genre chips row */}
        <div className="ecf-chip-row">
          <button
            type="button"
            className={`ecf-chip-btn ecf-chip-btn--filter${activeCount > 0 ? ' ecf-chip-btn--active' : ''}`}
            onClick={() => setShowFilter(true)}
          >
            <SlidersHorizontal className="ecf-chip-filter-icon" size={14} strokeWidth={2.25} aria-hidden />
            <span>
              Filter{activeCount > 0 ? ` · ${activeCount}` : ''}
            </span>
          </button>
          <LocationCityPickerControl
            triggerClassName="ecf-chip-btn ecf-chip-btn--location"
            wrapClassName="ecf-chip-wrap"
          />
          {activeCount > 0 && (
            <button
              type="button"
              className="ecf-chip-btn ecf-chip-btn--active"
              onClick={() => setFilters(DEFAULT_FILTERS)}
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Progress dots */}
      <div className="ecf-progress-dots" aria-hidden>
        {filtered.map((_, i) => (
          <div
            key={i}
            className={`ecf-dot${i === cardIdx ? ' ecf-dot--active' : ''}`}
          />
        ))}
      </div>

      {/* Scroll container */}
      <div
        ref={scrollRef}
        className="ecf-scroll"
        role="feed"
        aria-label="Event cards"
      >
        {filtered.length === 0 ? (
          <div className="ecf-empty">
            <div className="ecf-empty-line" />
            <p className="ecf-empty-text">
              Nothing matches
              <br />
              <span>Try different filters</span>
            </p>
            <button
              type="button"
              className="ecf-empty-clear"
              onClick={() => setFilters(DEFAULT_FILTERS)}
            >
              Clear filters
            </button>
          </div>
        ) : (
          <>
            {filtered.map((ev) => (
              <EventCard
                key={ev.id}
                event={ev}
                isGoing={going.includes(ev.id)}
                isSaved={saved.includes(ev.id)}
                onGoing={() => toggleGoing(ev.id)}
                onSave={() => toggleSaved(ev.id)}
                onMoreDetails={() => onMoreDetails(ev.id)}
              />
            ))}
            {/* End-of-feed sentinel */}
            <div className="ecf-end-card" role="status">
              <div className="ecf-end-line" />
              <p className="ecf-end-text">
                That&apos;s all for tonight.
                <br />
                <span>More drops at midnight.</span>
              </p>
            </div>
          </>
        )}
      </div>

      {/* Filter bottom sheet */}
      {showFilter && (
        <FilterSheet
          applied={filters}
          onApply={(next) => {
            setFilters(next)
            setShowFilter(false)
          }}
          onClose={() => setShowFilter(false)}
        />
      )}
    </div>
  )
}

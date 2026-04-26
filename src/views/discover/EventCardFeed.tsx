import { useEffect, useLayoutEffect, useMemo, useRef, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Heart, Info, Map, Share2, SlidersHorizontal } from 'lucide-react'
import { LocationCityPickerControl, CityPickerSheet } from '../../components/LocationCityPickerControl'
import { useAppState } from '../../store/appStore'
import type { EventItem } from '../../types'

// ─── Category → visual accent mapping (keyed by exploreCategoryId) ───────────
const CATEGORY_ACCENT: Record<string, string> = {
  'live-music':  '#ff3d00',
  'club-nights': '#00aaff',
  'jazz-blues':  '#00cc66',
  underground:   '#cc00ff',
  arts:          '#00e5cc',
  food:          '#ffaa00',
  popups:        '#0d9488',
  festivals:     '#9333ea',
}
const DEFAULT_ACCENT = '#ff3d00'

const CATEGORY_BG: Record<string, string> = {
  'live-music':  '#0d0500',
  'club-nights': '#000d1a',
  'jazz-blues':  '#000a05',
  underground:   '#0d0010',
  arts:          '#00100e',
  food:          '#1a0e00',
  popups:        '#001210',
  festivals:     '#0d0020',
}
const DEFAULT_BG = '#0a0a0a'

// Genre label → exploreCategoryId (for card visuals)
const GENRE_TO_CATEGORY: Record<string, string> = {
  Techno:        'club-nights',
  'Club Nights': 'club-nights',
  Jazz:          'jazz-blues',
  Electronic:    'underground',
  'Live Music':  'live-music',
  'Cocktail Bar':'food',
}

const CATEGORIES_FILTER = [
  { id: 'All',         label: 'All' },
  { id: 'live-music',  label: 'Live Music' },
  { id: 'club-nights', label: 'Club Nights' },
  { id: 'jazz-blues',  label: 'Jazz & Blues' },
  { id: 'underground', label: 'Underground' },
  { id: 'arts',        label: 'Arts & Culture' },
  { id: 'food',        label: 'Food & Drink' },
  { id: 'popups',      label: 'Pop-ups' },
  { id: 'festivals',   label: 'Festivals' },
]

const DATE_FILTER = ['All', 'Tonight', 'Tomorrow', 'This Week', 'This Month', 'Next 90 Days'] as const
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
  category: string
  date: (typeof DATE_FILTER)[number]
  time: (typeof TIME_FILTER)[number]
  area: (typeof AREA_FILTER)[number]
  price: (typeof PRICE_FILTER)[number]
}

const DEFAULT_FILTERS: EventFeedFilters = {
  category: 'All',
  date: 'All',
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
  if (f.category !== 'All' && event.exploreCategoryId !== f.category) return false

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
  if (f.category !== 'All') n += 1
  if (f.date !== 'All') n += 1
  if (f.time !== 'All') n += 1
  if (f.area !== 'All') n += 1
  if (f.price !== 'All') n += 1
  return n
}

function getAccent(genre: string) {
  const catId = GENRE_TO_CATEGORY[genre] ?? genre
  return CATEGORY_ACCENT[catId] ?? DEFAULT_ACCENT
}

function getBg(genre: string) {
  const catId = GENRE_TO_CATEGORY[genre] ?? genre
  return CATEGORY_BG[catId] ?? DEFAULT_BG
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
const FILTER_SECTIONS = ['Category', 'Date', 'Time', 'Area', 'Price'] as const
type FilterSectionName = (typeof FILTER_SECTIONS)[number]

type FilterSheetProps = {
  applied: EventFeedFilters
  onApply: (next: EventFeedFilters) => void
  onClose: () => void
}

function FilterSheet({ applied, onApply, onClose }: FilterSheetProps) {
  const [draft, setDraft] = useState<EventFeedFilters>(applied)
  const [activeSection, setActiveSection] = useState<FilterSectionName>('Category')
  const bodyRef = useRef<HTMLDivElement>(null)
  const sectionRefs = useRef<Partial<Record<FilterSectionName, HTMLElement>>>({})
  const activeSectionRef = useRef<FilterSectionName>('Category')
  const cascadeTargetRef = useRef<FilterSectionName>('Category')
  const cascadeTimers = useRef<ReturnType<typeof setTimeout>[]>([])

  useLayoutEffect(() => {
    setDraft(applied)
  }, [applied])

  // Cascade to a target section one step at a time with 120 ms between each.
  // Guards against continuous scroll events restarting mid-cascade by only
  // acting when the target actually changes.
  const cascadeTo = useCallback((target: FilterSectionName) => {
    if (cascadeTargetRef.current === target) return   // already heading there

    cascadeTimers.current.forEach(clearTimeout)
    cascadeTimers.current = []
    cascadeTargetRef.current = target

    const fromIdx = FILTER_SECTIONS.indexOf(activeSectionRef.current)
    const toIdx   = FILTER_SECTIONS.indexOf(target)
    if (toIdx === fromIdx) return

    const dir = toIdx > fromIdx ? 1 : -1
    const steps: FilterSectionName[] = []
    for (let i = fromIdx + dir; dir > 0 ? i <= toIdx : i >= toIdx; i += dir) {
      steps.push(FILTER_SECTIONS[i])
    }

    steps.forEach((section, i) => {
      const t = setTimeout(() => {
        activeSectionRef.current = section
        setActiveSection(section)
      }, (i + 1) * 220)           // 220 ms per step so each section is clearly visible
      cascadeTimers.current.push(t)
    })
  }, [])

  useEffect(() => {
    return () => cascadeTimers.current.forEach(clearTimeout)
  }, [])

  // Scroll-spy: divide the full scroll range into N equal zones, one per
  // section. This guarantees every section (including Area and Price) gets its
  // own slice regardless of how much scrollable content is below it.
  const handleBodyScroll = useCallback(() => {
    const body = bodyRef.current
    if (!body) return

    const maxScroll = body.scrollHeight - body.clientHeight
    if (maxScroll <= 0) return

    const progress = body.scrollTop / maxScroll                        // 0 → 1
    const idx = Math.min(
      Math.floor(progress * FILTER_SECTIONS.length),
      FILTER_SECTIONS.length - 1,
    )
    cascadeTo(FILTER_SECTIONS[idx])
  }, [cascadeTo])

  const scrollToSection = useCallback((name: FilterSectionName) => {
    const el = sectionRefs.current[name]
    if (!el || !bodyRef.current) return
    bodyRef.current.scrollTo({ top: el.offsetTop, behavior: 'smooth' })
  }, [])

  const chip = (active: boolean, label: string, onClick: () => void) => (
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
    <motion.div
      className="ecf-filter-backdrop"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
    >
      <motion.div
        className="ecf-filter-sheet"
        onClick={(e) => e.stopPropagation()}
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
      >
        <div className="ecf-filter-handle" />

        {/* Section indicator dots */}
        <div className="ecf-filter-nav" aria-hidden>
          {FILTER_SECTIONS.map((name) => (
            <button
              key={name}
              type="button"
              className={`ecf-filter-nav-dot${activeSection === name ? ' ecf-filter-nav-dot--active' : ''}`}
              onClick={() => scrollToSection(name)}
              tabIndex={-1}
            >
              <span className="ecf-filter-nav-label">{name}</span>
            </button>
          ))}
        </div>

        <h2 className="ecf-filter-title">Filter</h2>

        <div className="ecf-filter-body" ref={bodyRef} onScroll={handleBodyScroll}>
          <section
            className="ecf-filter-section"
            data-section="Category"
            ref={(el) => { if (el) sectionRefs.current.Category = el }}
          >
            <p className="ecf-filter-section-label">Category</p>
            <div className="ecf-filter-chips">
              {CATEGORIES_FILTER.map((c) =>
                chip(draft.category === c.id, c.label, () => setDraft((d) => ({ ...d, category: c.id }))),
              )}
            </div>
          </section>

          <section
            className="ecf-filter-section"
            data-section="Date"
            ref={(el) => { if (el) sectionRefs.current.Date = el }}
          >
            <p className="ecf-filter-section-label">Date</p>
            <div className="ecf-filter-chips">
              {DATE_FILTER.map((d) =>
                chip(draft.date === d, d, () => setDraft((prev) => ({ ...prev, date: d }))),
              )}
            </div>
          </section>

          <section
            className="ecf-filter-section"
            data-section="Time"
            ref={(el) => { if (el) sectionRefs.current.Time = el }}
          >
            <p className="ecf-filter-section-label">Time</p>
            <div className="ecf-filter-chips">
              {TIME_FILTER.map((t) =>
                chip(draft.time === t, t, () => setDraft((d) => ({ ...d, time: t }))),
              )}
            </div>
          </section>

          <section
            className="ecf-filter-section"
            data-section="Area"
            ref={(el) => { if (el) sectionRefs.current.Area = el }}
          >
            <p className="ecf-filter-section-label">Area</p>
            <div className="ecf-filter-chips">
              {AREA_FILTER.map((a) =>
                chip(draft.area === a, a, () => setDraft((d) => ({ ...d, area: a }))),
              )}
            </div>
          </section>

          <section
            className="ecf-filter-section"
            data-section="Price"
            ref={(el) => { if (el) sectionRefs.current.Price = el }}
          >
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
      </motion.div>
    </motion.div>
  )
}

// ─── Main EventCardFeed ───────────────────────────────────────────────────────
type EventCardFeedProps = {
  events: EventItem[]
  onMoreDetails: (eventId: string) => void
  onMapView?: () => void
}

export function EventCardFeed({ events, onMoreDetails, onMapView }: EventCardFeedProps) {
  const locationCityId = useAppState((s) => s.feedLocationCityId)
  const [filters, setFilters] = useState<EventFeedFilters>(DEFAULT_FILTERS)
  const [showFilter, setShowFilter] = useState(false)
  const [showCityPicker, setShowCityPicker] = useState(false)
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
        <div className="ecf-header-inner">
          {/* Left: filter chips */}
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
              onOpen={() => setShowCityPicker(true)}
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

          {/* Right: Map View */}
          <button
            type="button"
            className="ecf-map-view-btn"
            onClick={onMapView}
            aria-label="Switch to map view"
          >
            <Map size={14} strokeWidth={2.25} aria-hidden />
            <span>Map</span>
          </button>
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
            {activeCount > 0 ? (
              <>
                <p className="ecf-empty-text">
                  No matching events
                  <br />
                  <span>Try adjusting your filters</span>
                </p>
                <button
                  type="button"
                  className="ecf-empty-clear"
                  onClick={() => setFilters(DEFAULT_FILTERS)}
                >
                  Clear filters
                </button>
              </>
            ) : (
              <p className="ecf-empty-text">
                Nothing on in this city yet
                <br />
                <span>Check back soon or try another city</span>
              </p>
            )}
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
      {createPortal(
        <AnimatePresence>
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
        </AnimatePresence>,
        (document.querySelector('main.phone-shell') ?? document.getElementById('root')) as HTMLElement,
      )}

      {/* City picker — identical portal/animation structure as filter sheet */}
      {createPortal(
        <AnimatePresence>
          {showCityPicker && (
            <motion.div
              className="ecf-filter-backdrop"
              onClick={() => setShowCityPicker(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
            >
              <motion.div
                className="lcp-sheet"
                onClick={(e) => e.stopPropagation()}
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
              >
                <CityPickerSheet onClose={() => setShowCityPicker(false)} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        (document.querySelector('main.phone-shell') ?? document.getElementById('root')) as HTMLElement,
      )}
    </div>
  )
}

import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { CalendarClock, ChevronDown, MapPin, Search, X, Zap } from 'lucide-react'
import { feedWireframePosts } from '../../data/demoData'
import { filterLocationRegionsByQuery, getLocationCityById } from '../../data/locationRegions'
import { mapFeedRowToWireframe, type FeedPostRow } from '../../lib/map-feed'
import { api } from '../../lib/trpc'
import { useAppState } from '../../store/appStore'
import type { FeedWireframePost } from '../../types'

type FeedTabProps = {
  onOpenEvent: (eventId: string) => void
}

const FEED_TIME_OPTIONS = [
  'Tonight',
  'This weekend',
  'Next 7 days',
  'Next 30 days',
  'Next 90 days',
  '1 year',
] as const

function feedLocationPortalTarget(): HTMLElement {
  if (typeof document === 'undefined') {
    return null as unknown as HTMLElement
  }
  return (document.querySelector('main.phone-shell') ??
    document.getElementById('root')) as HTMLElement
}

/** UI heading only: "Asia & Pacific" → "Asia Pacific" */
function displayRegionHeading(label: string): string {
  return label.replace(/\s*&\s*/g, ' ').trim()
}

function FeedPostCard({
  post,
  onOpenEvent,
  index,
}: {
  post: FeedWireframePost
  onOpenEvent: (eventId: string) => void
  index: number
}) {
  const verbLabel = post.hostVerb === 'asked' ? 'asked' : 'scrawled'
  const kickerIsQuote = post.kickerStyle === 'quote'

  return (
    <article className="feed-wf-post">
      <header className="feed-wf-post-head">
        <img
          className="feed-wf-avatar"
          src={post.hostAvatar}
          alt=""
          width={40}
          height={40}
          loading={index === 0 ? 'eager' : 'lazy'}
          decoding="async"
        />
        <div className="feed-wf-post-head-copy">
          <span className="feed-wf-host-name">{post.host}</span>
          <p className="feed-wf-host-context">
            <em>
              {post.host} {verbLabel}: {post.hostLine}
            </em>
          </p>
        </div>
      </header>

      <div className="feed-wf-card feed-wf-card--hero">
        <img
          className={
            post.imageGrayscale
              ? 'feed-wf-hero-img feed-wf-hero-img--mono'
              : 'feed-wf-hero-img'
          }
          src={post.heroImage}
          alt=""
          loading={index === 0 ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={index === 0 ? 'high' : 'low'}
        />
        <div className="feed-wf-hero-scrim" aria-hidden />
        <div className="feed-wf-badges">
          <span className="feed-wf-badge feed-wf-badge--bp">+{post.bp} BP</span>
          {post.buzzPct != null ? (
            <span className="feed-wf-badge feed-wf-badge--buzz">
              <Zap size={12} strokeWidth={2.5} aria-hidden />
              {post.buzzPct}% BUZZ
            </span>
          ) : null}
        </div>
        <div className="feed-wf-hero-copy">
          <p
            className={
              kickerIsQuote ? 'feed-wf-kicker feed-wf-kicker--quote' : 'feed-wf-kicker feed-wf-kicker--neon'
            }
          >
            {kickerIsQuote ? (
              <em>
                &ldquo;{post.kicker}&rdquo;
              </em>
            ) : (
              post.kicker
            )}
          </p>
          <h3 className="feed-wf-venue-title">{post.venueName}</h3>
          <p className="feed-wf-venue-line">{post.venueLine}</p>
        </div>
      </div>

      <button
        type="button"
        className="feed-wf-cta feed-wf-cta--full"
        onClick={() => onOpenEvent(post.eventId)}
      >
        I&apos;M GOING
      </button>
    </article>
  )
}

export function FeedTab({ onOpenEvent }: FeedTabProps) {
  const reduceMotion = useReducedMotion()
  const openSubscription = useAppState((s) => s.openSubscription)
  const locationCityId = useAppState((s) => s.feedLocationCityId)
  const setLocationCityId = useAppState((s) => s.setFeedLocationCityId)
  const locationCity = getLocationCityById(locationCityId)
  const locationLabel = locationCity?.name ?? 'Singapore'
  const feedQuery = api.feed.get.useQuery(
    { limit: 20, cityId: locationCityId },
    { staleTime: 30_000, retry: 1 },
  )
  const feedPosts = useMemo(() => {
    const raw = feedQuery.data?.items
    if (raw?.length) {
      return raw.map((row) => mapFeedRowToWireframe(row as unknown as FeedPostRow))
    }
    return feedWireframePosts
  }, [feedQuery.data])
  const [locationMenuOpen, setLocationMenuOpen] = useState(false)
  const [locationSearchQuery, setLocationSearchQuery] = useState('')
  const locationWrapRef = useRef<HTMLDivElement>(null)
  const locationCurtainRef = useRef<HTMLDivElement>(null)
  const locationSearchInputRef = useRef<HTMLInputElement>(null)

  const filteredLocationRegions = useMemo(
    () => filterLocationRegionsByQuery(locationSearchQuery),
    [locationSearchQuery],
  )

  useEffect(() => {
    if (!locationMenuOpen) {
      setLocationSearchQuery('')
      return
    }
    const id = requestAnimationFrame(() => locationSearchInputRef.current?.focus())
    return () => cancelAnimationFrame(id)
  }, [locationMenuOpen])

  const [timeFilter, setTimeFilter] = useState<(typeof FEED_TIME_OPTIONS)[number]>('Tonight')
  const [timeMenuOpen, setTimeMenuOpen] = useState(false)
  const timeWrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!locationMenuOpen && !timeMenuOpen) return

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      const t = e.target as Node
      if (
        locationMenuOpen &&
        locationWrapRef.current &&
        !locationWrapRef.current.contains(t) &&
        !locationCurtainRef.current?.contains(t)
      ) {
        setLocationMenuOpen(false)
      }
      if (timeMenuOpen && timeWrapRef.current && !timeWrapRef.current.contains(t)) {
        setTimeMenuOpen(false)
      }
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLocationMenuOpen(false)
        setTimeMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('touchstart', onPointerDown, { passive: true })
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('touchstart', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [locationMenuOpen, timeMenuOpen])

  return (
    <motion.div
      className="screen-content feed-wf"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="feed-filters-row">
        <div className="feed-filter-wrap" ref={locationWrapRef}>
          <button
            type="button"
            className="feed-filter-pill"
            aria-expanded={locationMenuOpen}
            aria-haspopup="dialog"
            aria-controls="feed-location-curtain"
            id="feed-location-trigger"
            aria-label={`Location: ${locationLabel}. Choose city`}
            onClick={() => {
              setTimeMenuOpen(false)
              setLocationMenuOpen((open) => !open)
            }}
          >
            <MapPin className="feed-filter-pill-icon feed-filter-pill-icon--pin" size={16} strokeWidth={2.25} aria-hidden />
            <span>{locationLabel}</span>
            <Search
              className="feed-filter-pill-search-hint"
              size={14}
              strokeWidth={2.25}
              aria-hidden
            />
            <ChevronDown className="feed-filter-pill-chevron" size={14} strokeWidth={2.25} aria-hidden />
          </button>
        </div>

        <div className="feed-filter-wrap" ref={timeWrapRef}>
          <button
            type="button"
            className="feed-filter-pill"
            aria-expanded={timeMenuOpen}
            aria-haspopup="listbox"
            aria-controls="feed-time-listbox"
            id="feed-time-trigger"
            aria-label={`Time: ${timeFilter}. Choose when`}
            onClick={() => {
              setLocationMenuOpen(false)
              setTimeMenuOpen((open) => !open)
            }}
          >
            <CalendarClock className="feed-filter-pill-icon" size={16} strokeWidth={2.25} aria-hidden />
            <span>{timeFilter}</span>
            <ChevronDown className="feed-filter-pill-chevron" size={14} strokeWidth={2.25} aria-hidden />
          </button>
          {timeMenuOpen ? (
            <ul
              className="feed-filter-menu"
              id="feed-time-listbox"
              role="listbox"
              aria-labelledby="feed-time-trigger"
            >
              {FEED_TIME_OPTIONS.map((label) => (
                <li key={label} role="presentation">
                  <button
                    type="button"
                    className={
                      label === timeFilter ? 'feed-filter-menu-item is-active' : 'feed-filter-menu-item'
                    }
                    role="option"
                    aria-selected={label === timeFilter}
                    onClick={() => {
                      setTimeFilter(label)
                      setTimeMenuOpen(false)
                    }}
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>

      <div className="feed-wf-stack">
        {feedPosts.map((post, index) => (
          <FeedPostCard
            key={`${post.eventId}-${index}`}
            post={post}
            onOpenEvent={onOpenEvent}
            index={index}
          />
        ))}
      </div>

      <section className="feed-pro-upsell" aria-labelledby="feed-pro-headline">
        <p className="feed-pro-eyebrow">You&apos;re seeing the surface</p>
        <h2 id="feed-pro-headline" className="feed-pro-headline">
          See your full network – go Pro
        </h2>
        <button type="button" className="feed-pro-cta" onClick={openSubscription}>
          Unlock the underground
        </button>
      </section>

      {createPortal(
        <AnimatePresence>
          {locationMenuOpen ? (
            <motion.div
              key="feed-location-curtain"
              ref={locationCurtainRef}
              id="feed-location-curtain"
              className="feed-location-curtain"
              role="dialog"
              aria-modal="true"
              aria-labelledby="feed-location-curtain-title"
              initial={{ opacity: reduceMotion ? 1 : 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: reduceMotion ? 1 : 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.22 }}
            >
              <motion.button
                type="button"
                className="feed-location-curtain__backdrop"
                aria-label="Close city picker"
                initial={{ opacity: reduceMotion ? 1 : 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: reduceMotion ? 1 : 0 }}
                transition={{ duration: reduceMotion ? 0 : 0.2 }}
                onClick={() => setLocationMenuOpen(false)}
              />
              <motion.div
                className="feed-location-curtain__panel"
                initial={{ y: reduceMotion ? 0 : '-100%' }}
                animate={{ y: 0 }}
                exit={{ y: reduceMotion ? 0 : '-100%' }}
                transition={{
                  duration: reduceMotion ? 0 : 0.34,
                  ease: [0.32, 0.72, 0, 1],
                }}
              >
                <header className="feed-location-curtain__header">
                  <h2 id="feed-location-curtain-title" className="feed-location-curtain__title">
                    Choose a city
                  </h2>
                  <button
                    type="button"
                    className="feed-location-curtain__close"
                    onClick={() => setLocationMenuOpen(false)}
                    aria-label="Close"
                  >
                    <X size={20} strokeWidth={2.25} aria-hidden />
                  </button>
                </header>

                <div className="feed-location-curtain__search-wrap" role="presentation">
                  <input
                    ref={locationSearchInputRef}
                    id="feed-location-search"
                    type="search"
                    className="feed-filter-menu-search feed-location-curtain__search"
                    placeholder="Search cities or regions…"
                    value={locationSearchQuery}
                    onChange={(e) => setLocationSearchQuery(e.target.value)}
                    aria-label="Search cities and regions"
                    autoComplete="off"
                    onKeyDown={(e) => {
                      e.stopPropagation()
                    }}
                  />
                </div>

                <div
                  className="feed-location-curtain__scroll"
                  id="feed-location-listbox"
                  role="listbox"
                  aria-labelledby="feed-location-trigger"
                >
                  {filteredLocationRegions.length === 0 ? (
                    <p className="feed-location-curtain__empty">No cities match</p>
                  ) : (
                    filteredLocationRegions.map((region) => (
                      <section
                        key={region.id}
                        className="feed-location-curtain__section"
                        aria-labelledby={`feed-region-${region.id}`}
                      >
                        <h3 className="feed-location-curtain__region-heading" id={`feed-region-${region.id}`}>
                          {displayRegionHeading(region.label)}
                        </h3>
                        <ul className="feed-location-curtain__chip-row">
                          {region.cities.map((city) => (
                            <li key={city.id} role="presentation" className="feed-location-curtain__chip-item">
                              <button
                                type="button"
                                className={
                                  city.id === locationCityId
                                    ? 'feed-location-curtain__chip is-active'
                                    : 'feed-location-curtain__chip'
                                }
                                role="option"
                                aria-selected={city.id === locationCityId}
                                onClick={() => {
                                  setLocationCityId(city.id)
                                  setLocationMenuOpen(false)
                                }}
                              >
                                {city.name}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </section>
                    ))
                  )}
                </div>
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>,
        feedLocationPortalTarget(),
      )}
    </motion.div>
  )
}

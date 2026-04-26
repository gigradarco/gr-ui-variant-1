import { useEffect, useMemo, useRef, useState, type RefObject } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, usePresence, useReducedMotion } from 'framer-motion'
import { ChevronDown, MapPin, Search, X } from 'lucide-react'
import {
  filterLocationRegionsByQuery,
  getLocationCityById,
  type LocationRegion,
} from '../data/locationRegions'
import { useAppState } from '../store/appStore'

/** Stable DOM id prefix for the city picker (Discover). */
const PICKER_DOM_ID = 'discover'

function portalTarget(): HTMLElement {
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

type LocationCityPickerCurtainProps = {
  curtainId: string
  titleId: string
  searchId: string
  listboxId: string
  triggerId: string
  reduceMotion: boolean | null
  locationCurtainRef: RefObject<HTMLDivElement | null>
  locationSearchInputRef: RefObject<HTMLInputElement | null>
  locationSearchQuery: string
  setLocationSearchQuery: (q: string) => void
  filteredRegions: LocationRegion[]
  locationCityId: string
  setLocationCityId: (id: string) => void
  setLocationMenuOpen: (open: boolean) => void
}

/** Child of `AnimatePresence` — `usePresence` flips off as soon as exit starts so hit targets don’t block the app. */
function LocationCityPickerCurtain({
  curtainId,
  titleId,
  searchId,
  listboxId,
  triggerId,
  reduceMotion,
  locationCurtainRef,
  locationSearchInputRef,
  locationSearchQuery,
  setLocationSearchQuery,
  filteredRegions,
  locationCityId,
  setLocationCityId,
  setLocationMenuOpen,
}: LocationCityPickerCurtainProps) {
  const [isPresent] = usePresence()
  const pointerEvents = isPresent ? 'auto' : 'none'

  return (
    <motion.div
      ref={locationCurtainRef}
      id={curtainId}
      className="feed-location-curtain"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      initial={{ opacity: reduceMotion ? 1 : 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: reduceMotion ? 1 : 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.22 }}
    >
      <motion.button
        type="button"
        className="feed-location-curtain__backdrop"
        aria-label="Close city picker"
        style={{ pointerEvents }}
        initial={{ opacity: reduceMotion ? 1 : 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: reduceMotion ? 1 : 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.2 }}
        onClick={() => setLocationMenuOpen(false)}
      />
      <motion.div
        className="feed-location-curtain__panel"
        style={{ pointerEvents }}
        initial={{ y: reduceMotion ? 0 : '-100%' }}
        animate={{ y: 0 }}
        exit={{ y: reduceMotion ? 0 : '-100%' }}
        transition={{
          duration: reduceMotion ? 0 : 0.34,
          ease: [0.32, 0.72, 0, 1],
        }}
      >
        <header className="feed-location-curtain__header">
          <h2 id={titleId} className="feed-location-curtain__title">
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
            id={searchId}
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
          id={listboxId}
          role="listbox"
          aria-labelledby={triggerId}
        >
          {filteredRegions.length === 0 ? (
            <p className="feed-location-curtain__empty">No cities match</p>
          ) : (
            filteredRegions.map((region) => (
              <section
                key={region.id}
                className="feed-location-curtain__section"
                aria-labelledby={`${PICKER_DOM_ID}-region-${region.id}`}
              >
                <h3
                  className="feed-location-curtain__region-heading"
                  id={`${PICKER_DOM_ID}-region-${region.id}`}
                >
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
  )
}

export type LocationCityPickerControlProps = {
  /** Class names for the trigger button (e.g. ecf-chip-btn) */
  triggerClassName: string
  /** Optional class on the wrapper around the trigger */
  wrapClassName?: string
}

export function LocationCityPickerControl({
  triggerClassName,
  wrapClassName,
}: LocationCityPickerControlProps) {
  const reduceMotion = useReducedMotion()
  const locationCityId = useAppState((s) => s.feedLocationCityId)
  const setLocationCityId = useAppState((s) => s.setFeedLocationCityId)
  const locationCity = getLocationCityById(locationCityId)
  const locationLabel = locationCity?.name ?? 'Singapore'

  const [locationMenuOpen, setLocationMenuOpen] = useState(false)
  const [locationSearchQuery, setLocationSearchQuery] = useState('')
  const locationWrapRef = useRef<HTMLDivElement>(null)
  const locationCurtainRef = useRef<HTMLDivElement>(null)
  const locationSearchInputRef = useRef<HTMLInputElement>(null)

  const triggerId = `${PICKER_DOM_ID}-location-trigger`
  const curtainId = `${PICKER_DOM_ID}-location-curtain`
  const titleId = `${PICKER_DOM_ID}-location-curtain-title`
  const searchId = `${PICKER_DOM_ID}-location-search`
  const listboxId = `${PICKER_DOM_ID}-location-listbox`

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

  useEffect(() => {
    if (!locationMenuOpen) return

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      const t = e.target as Node
      if (
        locationWrapRef.current &&
        !locationWrapRef.current.contains(t) &&
        !locationCurtainRef.current?.contains(t)
      ) {
        setLocationMenuOpen(false)
      }
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLocationMenuOpen(false)
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('touchstart', onPointerDown, { passive: true })
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('touchstart', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [locationMenuOpen])

  const wrapClass = wrapClassName ?? 'feed-filter-wrap'

  return (
    <>
      <div className={wrapClass} ref={locationWrapRef}>
        <button
          type="button"
          className={triggerClassName}
          aria-expanded={locationMenuOpen}
          aria-haspopup="dialog"
          aria-controls={curtainId}
          id={triggerId}
          aria-label={`Location: ${locationLabel}. Choose city`}
          onClick={() => setLocationMenuOpen((open) => !open)}
        >
          <MapPin className="feed-filter-pill-icon feed-filter-pill-icon--pin" size={16} strokeWidth={2.25} aria-hidden />
          <span>{locationLabel}</span>
          <Search className="feed-filter-pill-search-hint" size={14} strokeWidth={2.25} aria-hidden />
          <ChevronDown className="feed-filter-pill-chevron" size={14} strokeWidth={2.25} aria-hidden />
        </button>
      </div>

      {createPortal(
        <AnimatePresence>
          {locationMenuOpen ? (
            <LocationCityPickerCurtain
              key={`${PICKER_DOM_ID}-location-curtain`}
              curtainId={curtainId}
              titleId={titleId}
              searchId={searchId}
              listboxId={listboxId}
              triggerId={triggerId}
              reduceMotion={reduceMotion}
              locationCurtainRef={locationCurtainRef}
              locationSearchInputRef={locationSearchInputRef}
              locationSearchQuery={locationSearchQuery}
              setLocationSearchQuery={setLocationSearchQuery}
              filteredRegions={filteredLocationRegions}
              locationCityId={locationCityId}
              setLocationCityId={setLocationCityId}
              setLocationMenuOpen={setLocationMenuOpen}
            />
          ) : null}
        </AnimatePresence>,
        portalTarget(),
      )}
    </>
  )
}

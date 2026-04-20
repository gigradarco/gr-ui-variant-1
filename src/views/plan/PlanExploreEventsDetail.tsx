import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, ChevronDown, Clock, MapPin, Search } from 'lucide-react'
import { events } from '../../data/demoData'
import { EXPLORE_CATEGORY_DEFS, getExploreCategoryDef } from '../../data/exploreCategories'
import { filterLocationRegionsByQuery, getLocationCityById } from '../../data/locationRegions'
import { useAppState } from '../../store/appStore'

export type PlanExploreDetailFocus =
  | { type: 'category'; id: string }
  | { type: 'city'; id: string }

type PlanExploreEventsDetailProps = {
  focus: PlanExploreDetailFocus
  onBack: () => void
  onOpenEvent: (eventId: string) => void
}

export function PlanExploreEventsDetail({
  focus,
  onBack,
  onOpenEvent,
}: PlanExploreEventsDetailProps) {
  const [filterCategoryId, setFilterCategoryId] = useState('')
  const [filterCityId, setFilterCityId] = useState('')

  useEffect(() => {
    if (focus.type === 'category') {
      setFilterCategoryId(focus.id)
      setFilterCityId(useAppState.getState().feedLocationCityId)
    } else {
      setFilterCityId(focus.id)
      setFilterCategoryId('')
    }
  }, [focus.type, focus.id])

  const title = useMemo(() => {
    const cat = filterCategoryId ? getExploreCategoryDef(filterCategoryId)?.label : null
    const city = filterCityId ? getLocationCityById(filterCityId)?.name : null
    if (cat && city) return `${cat} · ${city}`
    if (cat) return cat
    if (city) return city
    return 'Explore'
  }, [filterCategoryId, filterCityId])

  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      const catOk = !filterCategoryId || e.exploreCategoryId === filterCategoryId
      const cityOk = !filterCityId || e.locationCityId === filterCityId
      return catOk && cityOk
    })
  }, [filterCategoryId, filterCityId])

  const filterCityLabel = filterCityId
    ? getLocationCityById(filterCityId)?.name ?? filterCityId
    : null
  const filterCategoryLabel = filterCategoryId
    ? getExploreCategoryDef(filterCategoryId)?.label ?? filterCategoryId
    : null

  const [cityMenuOpen, setCityMenuOpen] = useState(false)
  const [citySearchQuery, setCitySearchQuery] = useState('')
  const cityWrapRef = useRef<HTMLDivElement>(null)
  const citySearchInputRef = useRef<HTMLInputElement>(null)

  const filteredCityRegions = useMemo(
    () => filterLocationRegionsByQuery(citySearchQuery),
    [citySearchQuery],
  )

  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false)
  const [categorySearchQuery, setCategorySearchQuery] = useState('')
  const categoryWrapRef = useRef<HTMLDivElement>(null)
  const categorySearchInputRef = useRef<HTMLInputElement>(null)

  const filteredCategories = useMemo(() => {
    const q = categorySearchQuery.trim().toLowerCase()
    if (!q) return EXPLORE_CATEGORY_DEFS
    return EXPLORE_CATEGORY_DEFS.filter(
      (c) => c.label.toLowerCase().includes(q) || c.id.toLowerCase().includes(q),
    )
  }, [categorySearchQuery])

  useEffect(() => {
    if (!categoryMenuOpen) {
      setCategorySearchQuery('')
      return
    }
    const focusId = requestAnimationFrame(() => categorySearchInputRef.current?.focus())
    const onPointer = (e: MouseEvent | TouchEvent) => {
      const t = e.target as Node
      if (categoryWrapRef.current && !categoryWrapRef.current.contains(t)) {
        setCategoryMenuOpen(false)
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setCategoryMenuOpen(false)
    }
    document.addEventListener('mousedown', onPointer)
    document.addEventListener('touchstart', onPointer, { passive: true })
    document.addEventListener('keydown', onKey)
    return () => {
      cancelAnimationFrame(focusId)
      document.removeEventListener('mousedown', onPointer)
      document.removeEventListener('touchstart', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [categoryMenuOpen])

  useEffect(() => {
    if (!cityMenuOpen) {
      setCitySearchQuery('')
      return
    }
    const focusId = requestAnimationFrame(() => citySearchInputRef.current?.focus())
    const onPointer = (e: MouseEvent | TouchEvent) => {
      const t = e.target as Node
      if (cityWrapRef.current && !cityWrapRef.current.contains(t)) {
        setCityMenuOpen(false)
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setCityMenuOpen(false)
    }
    document.addEventListener('mousedown', onPointer)
    document.addEventListener('touchstart', onPointer, { passive: true })
    document.addEventListener('keydown', onKey)
    return () => {
      cancelAnimationFrame(focusId)
      document.removeEventListener('mousedown', onPointer)
      document.removeEventListener('touchstart', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [cityMenuOpen])

  return (
    <motion.div
      className="screen-content plan-page plan-explore-events plan-explore-events-detail"
      initial={{ opacity: 0, x: 14 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
    >
      <header className="plan-toolbar">
        <button
          type="button"
          className="plan-toolbar-btn"
          onClick={onBack}
          aria-label="Back to explore"
        >
          <ArrowLeft size={22} strokeWidth={2} />
        </button>
        <h1 className="plan-toolbar-heading">{title}</h1>
        <span className="plan-toolbar-trail" aria-hidden />
      </header>

      <div className="plan-explore-events-body">
        <p className="plan-explore-events-sub">
          Use <strong className="plan-explore-detail-emphasis">Category</strong> and{' '}
          <strong className="plan-explore-detail-emphasis">Country / City</strong> together to
          narrow your results faster.
        </p>

        <div className="plan-explore-detail-filters" aria-label="Filters">
          <div
            className="plan-explore-detail-filter plan-explore-detail-filter--combo"
            ref={categoryWrapRef}
          >
            <span className="plan-explore-detail-filter-key" id="plan-explore-category-key">
              Category
            </span>
            <div className="plan-explore-detail-combo-wrap">
              <button
                type="button"
                className={
                  categoryMenuOpen
                    ? 'plan-explore-detail-combo-trigger is-open'
                    : 'plan-explore-detail-combo-trigger'
                }
                aria-expanded={categoryMenuOpen}
                aria-haspopup="listbox"
                aria-controls="plan-explore-category-dropdown"
                id="plan-explore-category-trigger"
                aria-label={`Category filter: ${filterCategoryLabel ?? 'All categories'}. Open list; type to search`}
                onClick={() => setCategoryMenuOpen((o) => !o)}
              >
                <span className="plan-explore-detail-combo-value">
                  {filterCategoryLabel ?? 'All categories'}
                </span>
                <Search
                  className="plan-explore-detail-combo-search-ic"
                  size={14}
                  strokeWidth={2.25}
                  aria-hidden
                />
                <ChevronDown
                  className="plan-explore-detail-combo-chevron"
                  size={14}
                  strokeWidth={2.25}
                  aria-hidden
                />
              </button>
              {categoryMenuOpen ? (
                <div
                  className="feed-filter-menu feed-filter-menu--stack plan-explore-detail-combo-menu"
                  id="plan-explore-category-dropdown"
                >
                  <div className="feed-filter-menu-search-wrap" role="presentation">
                    <input
                      ref={categorySearchInputRef}
                      type="search"
                      className="feed-filter-menu-search"
                      placeholder="Search categories…"
                      value={categorySearchQuery}
                      onChange={(e) => setCategorySearchQuery(e.target.value)}
                      aria-label="Type to shortlist categories"
                      autoComplete="off"
                      onKeyDown={(e) => e.stopPropagation()}
                    />
                  </div>
                  <ul
                    className="feed-filter-menu-scroll"
                    role="listbox"
                    aria-labelledby="plan-explore-category-trigger"
                  >
                    <li role="presentation">
                      <button
                        type="button"
                        className={
                          !filterCategoryId
                            ? 'feed-filter-menu-item is-active'
                            : 'feed-filter-menu-item'
                        }
                        role="option"
                        aria-selected={!filterCategoryId}
                        onClick={() => {
                          setFilterCategoryId('')
                          setCategoryMenuOpen(false)
                        }}
                      >
                        All categories
                      </button>
                    </li>
                    {filteredCategories.length === 0 ? (
                      <li className="feed-filter-menu-empty" role="presentation">
                        No categories match
                      </li>
                    ) : (
                      filteredCategories.map((c) => (
                        <li key={c.id} role="presentation">
                          <button
                            type="button"
                            className={
                              c.id === filterCategoryId
                                ? 'feed-filter-menu-item is-active plan-explore-detail-cat-item'
                                : 'feed-filter-menu-item plan-explore-detail-cat-item'
                            }
                            role="option"
                            aria-selected={c.id === filterCategoryId}
                            onClick={() => {
                              setFilterCategoryId(c.id)
                              setCategoryMenuOpen(false)
                            }}
                          >
                            <span
                              className="plan-explore-detail-cat-dot"
                              style={{ background: c.accent }}
                              aria-hidden
                            />
                            <span className="plan-explore-detail-cat-label">{c.label}</span>
                          </button>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              ) : null}
            </div>
          </div>
          <div
            className="plan-explore-detail-filter plan-explore-detail-filter--combo"
            ref={cityWrapRef}
          >
            <span className="plan-explore-detail-filter-key" id="plan-explore-city-key">
              Country / city
            </span>
            <div className="plan-explore-detail-combo-wrap">
              <button
                type="button"
                className={
                  cityMenuOpen
                    ? 'plan-explore-detail-combo-trigger is-open'
                    : 'plan-explore-detail-combo-trigger'
                }
                aria-expanded={cityMenuOpen}
                aria-haspopup="listbox"
                aria-controls="plan-explore-city-dropdown"
                id="plan-explore-city-trigger"
                aria-label={`City filter: ${filterCityLabel ?? 'All cities'}. Open list; type to search`}
                onClick={() => setCityMenuOpen((o) => !o)}
              >
                <span className="plan-explore-detail-combo-value">
                  {filterCityLabel ?? 'All cities'}
                </span>
                <Search
                  className="plan-explore-detail-combo-search-ic"
                  size={14}
                  strokeWidth={2.25}
                  aria-hidden
                />
                <ChevronDown
                  className="plan-explore-detail-combo-chevron"
                  size={14}
                  strokeWidth={2.25}
                  aria-hidden
                />
              </button>
              {cityMenuOpen ? (
                <div
                  className="feed-filter-menu feed-filter-menu--stack plan-explore-detail-combo-menu"
                  id="plan-explore-city-dropdown"
                >
                  <div className="feed-filter-menu-search-wrap" role="presentation">
                    <input
                      ref={citySearchInputRef}
                      type="search"
                      className="feed-filter-menu-search"
                      placeholder="Search cities…"
                      value={citySearchQuery}
                      onChange={(e) => setCitySearchQuery(e.target.value)}
                      aria-label="Type to shortlist cities and regions"
                      autoComplete="off"
                      onKeyDown={(e) => e.stopPropagation()}
                    />
                  </div>
                  <ul
                    className="feed-filter-menu-scroll"
                    role="listbox"
                    aria-labelledby="plan-explore-city-trigger"
                  >
                    <li role="presentation">
                      <button
                        type="button"
                        className={
                          !filterCityId ? 'feed-filter-menu-item is-active' : 'feed-filter-menu-item'
                        }
                        role="option"
                        aria-selected={!filterCityId}
                        onClick={() => {
                          setFilterCityId('')
                          setCityMenuOpen(false)
                        }}
                      >
                        All cities
                      </button>
                    </li>
                    {filteredCityRegions.length === 0 ? (
                      <li className="feed-filter-menu-empty" role="presentation">
                        No cities match
                      </li>
                    ) : (
                      filteredCityRegions.map((region) => (
                        <Fragment key={region.id}>
                          <li className="feed-filter-menu-group-label" role="presentation">
                            {region.label}
                          </li>
                          {region.cities.map((c) => (
                            <li key={c.id} role="presentation">
                              <button
                                type="button"
                                className={
                                  c.id === filterCityId
                                    ? 'feed-filter-menu-item is-active'
                                    : 'feed-filter-menu-item'
                                }
                                role="option"
                                aria-selected={c.id === filterCityId}
                                onClick={() => {
                                  setFilterCityId(c.id)
                                  setCityMenuOpen(false)
                                }}
                              >
                                {c.name}
                              </button>
                            </li>
                          ))}
                        </Fragment>
                      ))
                    )}
                  </ul>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {filteredEvents.length === 0 ? (
          <p className="plan-explore-category-events-empty">
            No events match this pair ({filterCategoryLabel ?? 'All categories'},{' '}
            {filterCityLabel ?? 'All cities'}). Broaden one or both filters, or add{' '}
            <code className="plan-explore-detail-code">events</code> rows with the same ids.
          </p>
        ) : (
          <div className="plan-list" role="list">
            {filteredEvents.map((ev) => (
              <button
                type="button"
                key={ev.id}
                className="plan-list-card"
                onClick={() => onOpenEvent(ev.id)}
              >
                <img src={ev.image} alt="" className="plan-list-card-img" decoding="async" />
                <div className="plan-list-card-body">
                  <span className="plan-list-card-label">{ev.genre}</span>
                  <h2 className="plan-list-card-title">{ev.title}</h2>
                  <p className="plan-list-card-meta">
                    <MapPin size={13} aria-hidden />
                    {ev.venue}, {ev.district}
                  </p>
                  <p className="plan-list-card-meta">
                    <Clock size={13} aria-hidden />
                    {ev.time}
                    {ev.ticketPrice ? ` · ${ev.ticketPrice}` : ''}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}

import { motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  ArrowLeft,
  Disc3,
  Globe,
  Headphones,
  MicVocal,
  Music,
  Palette,
  Store,
  Tent,
  UtensilsCrossed,
} from 'lucide-react'
import { EXPLORE_CATEGORY_DEFS } from '../../data/exploreCategories'
import { EXPLORE_LOCAL_REGIONS } from '../../data/locationRegionIcons'

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  'live-music': Music,
  'club-nights': Disc3,
  'jazz-blues': MicVocal,
  underground: Headphones,
  arts: Palette,
  food: UtensilsCrossed,
  popups: Store,
  festivals: Tent,
}

type PlanExploreEventsProps = {
  onBack: () => void
  onSelectCategory: (categoryId: string) => void
  onSelectCity: (cityId: string) => void
}

export function PlanExploreEvents({
  onBack,
  onSelectCategory,
  onSelectCity,
}: PlanExploreEventsProps) {
  const [localRegionId, setLocalRegionId] = useState(EXPLORE_LOCAL_REGIONS[0]?.id ?? 'asia')
  const localRegion = useMemo(
    () => EXPLORE_LOCAL_REGIONS.find((r) => r.id === localRegionId) ?? EXPLORE_LOCAL_REGIONS[0],
    [localRegionId],
  )
  const localCities = localRegion?.cities ?? []

  return (
    <motion.div
      className="screen-content plan-page plan-explore-events"
      initial={{ opacity: 0, x: 14 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
    >
      <header className="plan-toolbar">
        <button
          type="button"
          className="plan-toolbar-btn"
          onClick={onBack}
          aria-label="Back to plan"
        >
          <ArrowLeft size={22} strokeWidth={2} />
        </button>
        <h1 className="plan-toolbar-heading">Explore events</h1>
        <span className="plan-toolbar-trail" aria-hidden />
      </header>

      <div className="plan-explore-events-body">
        <p className="plan-explore-events-sub">Browse nights to add to your plan.</p>

        <section className="plan-explore-categories" aria-labelledby="plan-explore-cat-heading">
          <h2 id="plan-explore-cat-heading" className="plan-explore-categories-title">
            Browse by category
          </h2>
          <div className="plan-explore-category-grid" role="list">
            {EXPLORE_CATEGORY_DEFS.map((cat) => {
              const Icon = CATEGORY_ICONS[cat.id] ?? Globe
              return (
                <button
                  key={cat.id}
                  type="button"
                  className="plan-explore-category-card"
                  role="listitem"
                  aria-label={`View ${cat.label} events`}
                  onClick={() => onSelectCategory(cat.id)}
                >
                  <span
                    className="plan-explore-category-icon-wrap"
                    style={{ ['--plan-cat-accent' as string]: cat.accent }}
                  >
                    <Icon size={20} strokeWidth={2} aria-hidden />
                  </span>
                  <span className="plan-explore-category-copy">
                    <span className="plan-explore-category-name">{cat.label}</span>
                    <span className="plan-explore-category-count">{cat.countLabel}</span>
                  </span>
                </button>
              )
            })}
          </div>
        </section>

        <section className="plan-explore-local" aria-labelledby="plan-explore-local-heading">
          <h2 id="plan-explore-local-heading" className="plan-explore-local-title">
            Explore local events
          </h2>
          <div
            className="plan-explore-local-tabs"
            role="tablist"
            aria-label="Regions"
          >
            {EXPLORE_LOCAL_REGIONS.map((r) => {
              const isOn = r.id === localRegionId
              return (
                <button
                  key={r.id}
                  type="button"
                  role="tab"
                  aria-selected={isOn}
                  id={`plan-explore-tab-${r.id}`}
                  aria-controls="plan-explore-local-cities"
                  className={
                    isOn ? 'plan-explore-local-tab plan-explore-local-tab--on' : 'plan-explore-local-tab'
                  }
                  onClick={() => setLocalRegionId(r.id)}
                >
                  {r.label}
                </button>
              )
            })}
          </div>
          <div
            role="tabpanel"
            id="plan-explore-local-cities"
            aria-labelledby={`plan-explore-tab-${localRegionId}`}
            className="plan-explore-local-panel"
          >
            <div className="plan-explore-local-grid" role="list">
              {localCities.map((city) => {
                const CityIcon = city.Icon
                return (
                  <button
                    key={city.id}
                    type="button"
                    className="plan-explore-local-cell"
                    role="listitem"
                    aria-label={`View events in ${city.name}`}
                    onClick={() => onSelectCity(city.id)}
                  >
                    <span
                      className="plan-explore-local-orb"
                      style={{ ['--plan-orb' as string]: city.accent }}
                    >
                      <CityIcon size={17} strokeWidth={2} aria-hidden />
                    </span>
                    <span className="plan-explore-local-cell-copy">
                      <span className="plan-explore-local-city">{city.name}</span>
                      <span className="plan-explore-local-count">
                        {city.events} {city.events === 1 ? 'event' : 'events'}
                      </span>
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </section>
      </div>
    </motion.div>
  )
}

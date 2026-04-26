import { motion } from 'framer-motion'
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

      </div>
    </motion.div>
  )
}

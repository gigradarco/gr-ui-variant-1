import { motion } from 'framer-motion'
import { Clock, Heart, MapPin } from 'lucide-react'
import { useAppState, type FavoriteEvent } from '../../store/appStore'

type FavoritesTabProps = {
  onOpenFavorite: (event: FavoriteEvent) => void
}

export function FavoritesTab({ onOpenFavorite }: FavoritesTabProps) {
  const favoriteEvents = useAppState((s) => s.favoriteEvents)
  const toggleFavoriteEvent = useAppState((s) => s.toggleFavoriteEvent)

  return (
    <motion.div
      className="screen-content plan-home favorites-tab"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <header className="plan-home-header">
        <div className="plan-home-header-row">
          <h1 className="plan-home-title">Saved events</h1>
        </div>
        <p className="plan-home-sub">Quickly reopen your favorited nights.</p>
      </header>

      {favoriteEvents.length === 0 ? (
        <div className="favorites-empty">
          <Heart size={22} aria-hidden />
          <p className="favorites-empty-title">No saved events yet</p>
          <p className="favorites-empty-copy">Tap the heart on any event detail to save it here.</p>
        </div>
      ) : (
        <div className="plan-list" role="list" aria-label="Saved events">
          {favoriteEvents.map((event) => (
            <div key={event.id} className="favorites-list-item-wrap" role="listitem">
              <button
                type="button"
                className="plan-list-card favorites-list-card"
                onClick={() => onOpenFavorite(event)}
              >
                <img src={event.image} alt="" className="plan-list-card-img" decoding="async" />
                <div className="plan-list-card-body favorites-list-card-body">
                  <span
                    className={`plan-list-card-label${event.variant === 'past' ? ' plan-list-card-label--past' : ''}`}
                  >
                    {event.variant === 'past' ? 'Past favorite' : 'Upcoming favorite'}
                  </span>
                  <h2 className="plan-list-card-title">{event.title}</h2>
                  <p className="plan-list-card-meta">
                    <MapPin size={13} aria-hidden />
                    {event.venueLine}
                  </p>
                  <p className="plan-list-card-meta">
                    <Clock size={13} aria-hidden />
                    {event.timeLabel}
                  </p>
                </div>
              </button>
              <button
                type="button"
                className="favorites-list-remove"
                aria-label={`Remove ${event.title} from favorites`}
                onClick={() => toggleFavoriteEvent(event)}
              >
                <Heart size={18} fill="currentColor" aria-hidden />
              </button>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}

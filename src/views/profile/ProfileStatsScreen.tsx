import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, MapPin, Music, Ticket } from 'lucide-react'
import {
  PROFILE_CITIES_COUNT,
  PROFILE_GENRES_TRACKED,
  PROFILE_GIGS_TOTAL,
  profileCitiesVisited,
  profileGenreFootprint,
  profileGigsRecent,
} from '../../data/profileStats'
import type { ProfileStatsFocus } from '../../store/appStore'
import { useAppState } from '../../store/appStore'

const TABS: { id: ProfileStatsFocus; label: string; count: number; icon: typeof MapPin }[] = [
  { id: 'cities', label: 'Cities', count: PROFILE_CITIES_COUNT, icon: MapPin },
  { id: 'gigs', label: 'Gigs', count: PROFILE_GIGS_TOTAL, icon: Ticket },
  { id: 'genres', label: 'Genres', count: PROFILE_GENRES_TRACKED, icon: Music },
]

export function ProfileStatsScreen() {
  const { closeProfileStats, profileStatsFocus } = useAppState()
  const [activeTab, setActiveTab] = useState<ProfileStatsFocus>(
    () => profileStatsFocus ?? 'cities',
  )

  useEffect(() => {
    if (profileStatsFocus) {
      setActiveTab(profileStatsFocus)
    }
  }, [profileStatsFocus])

  return (
    <motion.div
      className="profile-list-screen profile-stats-screen"
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', stiffness: 320, damping: 34 }}
    >
      <header className="profile-list-screen-header">
        <button
          type="button"
          className="profile-list-screen-back"
          onClick={closeProfileStats}
          aria-label="Back to profile"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="profile-list-screen-title">Your scene stats</h1>
        <span className="profile-list-screen-spacer" aria-hidden />
      </header>

      <div className="profile-stats-layout">
        <p className="profile-stats-layout-intro">
          Check-ins and tickets (demo). Switch tab to load each list.
        </p>

        <div
          className="profile-stats-tablist"
          role="tablist"
          aria-label="Stats categories"
        >
          {TABS.map(({ id, label, count, icon: Icon }) => {
            const selected = activeTab === id
            return (
              <button
                key={id}
                type="button"
                role="tab"
                id={`profile-stats-tab-${id}`}
                aria-selected={selected}
                aria-controls={`profile-stats-panel-${id}`}
                tabIndex={selected ? 0 : -1}
                className={`profile-stats-tab${selected ? ' profile-stats-tab--active' : ''}`}
                onClick={() => setActiveTab(id)}
              >
                <Icon size={16} strokeWidth={2} aria-hidden />
                <span className="profile-stats-tab-label">{label}</span>
                <span className="profile-stats-tab-count">{count}</span>
              </button>
            )
          })}
        </div>

        <div
          className="profile-stats-panel-wrap"
          role="tabpanel"
          id={`profile-stats-panel-${activeTab}`}
          aria-labelledby={`profile-stats-tab-${activeTab}`}
        >
          {activeTab === 'cities' && (
            <div className="profile-stats-panel profile-stats-panel--cities">
              <p className="profile-stats-panel-lead">
                {PROFILE_CITIES_COUNT} cities with at least one night out logged.
              </p>
              <ul className="profile-stats-city-list">
                {profileCitiesVisited.map((c) => (
                  <li key={c.name} className="profile-stats-city-row">
                    <div className="profile-stats-city-main">
                      <strong>{c.name}</strong>
                      <span>{c.country}</span>
                    </div>
                    <div className="profile-stats-city-meta">
                      <span>{c.visits} visits</span>
                      <span className="profile-stats-city-last">{c.lastVisit}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {activeTab === 'gigs' && (
            <div className="profile-stats-panel profile-stats-panel--gigs">
              <p className="profile-stats-panel-lead">
                {PROFILE_GIGS_TOTAL} total — showing recent {profileGigsRecent.length}.
              </p>
              <ul className="profile-stats-gig-list">
                {profileGigsRecent.map((g) => (
                  <li key={`${g.date}-${g.title}`} className="profile-stats-gig-row">
                    <strong>{g.title}</strong>
                    <span>
                      {g.venue} · {g.city}
                    </span>
                    <span className="profile-stats-gig-date">{g.date}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {activeTab === 'genres' && (
            <div className="profile-stats-panel profile-stats-panel--genres">
              <p className="profile-stats-panel-lead">
                {PROFILE_GENRES_TRACKED} genres from sets you&apos;ve checked into.
              </p>
              <ul className="profile-stats-genre-list">
                {profileGenreFootprint.map((g) => (
                  <li key={g.label} className="profile-stats-genre-row">
                    <span className="profile-stats-genre-label">{g.label}</span>
                    <span className="profile-stats-genre-count">{g.gigs} gigs</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

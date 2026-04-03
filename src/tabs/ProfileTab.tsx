import type { CSSProperties } from 'react'
import { motion } from 'framer-motion'
import { Lock, Star, Building2, Moon, Settings, Zap, Trophy, ChevronRight } from 'lucide-react'
import { gigHistory } from '../demoData'
import { useAppState } from '../store/appStore'
import { GigHistoryList } from '../components/GigHistoryList'

const PREVIEW_COUNT = 5

type ProfileTabProps = {
  /**
   * 0–1 — how far the circular XP / tier ring is filled, clockwise from 12 o'clock.
   * Omit to use `PROFILE_EXPERIENCE_RING_FALLBACK`; later, pass from buzz / level logic.
   */
  experienceRingFill?: number
}

/** Default ring fullness for demo UI; change here or pass `experienceRingFill` from parent / API. */
export const PROFILE_EXPERIENCE_RING_FALLBACK = 0.75

const tasteGenres = [
  { label: 'DARK DISCO', accent: true },
  { label: 'MINIMAL TECHNO', accent: false },
  { label: 'INDUSTRIAL', accent: false },
  { label: 'EBM', accent: false },
  { label: 'POST-PUNK', accent: 'muted' },
  { label: 'ACID HOUSE', accent: false },
]

const badges = [
  { icon: Star, label: 'FIRST\nCHECK-IN' },
  { icon: Building2, label: 'CITY\nCURATOR' },
  { icon: Moon, label: 'NIGHT\nOWL' },
  { icon: Zap, label: 'STREAK\nMASTER' },
  { icon: Trophy, label: 'LEGEND' },
]

export function ProfileTab({
  experienceRingFill = PROFILE_EXPERIENCE_RING_FALLBACK,
}: ProfileTabProps) {
  const { openGigHistory, openSettings } = useAppState()
  const ringFill = Math.min(1, Math.max(0, experienceRingFill))
  const ringPercent = Math.round(ringFill * 100)
  const ringStyle = { '--ring-fill': ringFill } as CSSProperties

  const previewGigs = gigHistory.slice(0, PREVIEW_COUNT)
  const remaining = gigHistory.length - PREVIEW_COUNT

  return (
    <motion.div
      className="screen-content profile-screen"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="profile-toolbar">
        <button
          className="icon-btn"
          type="button"
          aria-label="Open settings"
          onClick={openSettings}
        >
          <Settings size={18} />
        </button>
      </div>

      {/* Hero */}
      <div className="profile-hero-new">
        <div className="profile-avatar-wrap">
          <div
            className="profile-avatar-ring"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={ringPercent}
            aria-label={`Experience toward next tier, ${ringPercent} percent`}
            style={ringStyle}
          >
            <div className="profile-avatar-inner">
              <img
                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80"
                alt="Vincenzo_K"
                className="profile-avatar-img"
              />
            </div>
          </div>
          <span className="profile-rank-badge">SCENE REGULAR</span>
        </div>
        <h2 className="profile-username">@VINCENZO_K</h2>
        <p className="profile-buzz">9,420 BUZZ POINTS</p>
        <div className="profile-stats-row">
          <div className="profile-stat">
            <strong>12</strong>
            <span>CITIES</span>
          </div>
          <div className="profile-stat-divider" />
          <div className="profile-stat">
            <strong>87</strong>
            <span>GIGS</span>
          </div>
          <div className="profile-stat-divider" />
          <div className="profile-stat">
            <strong>24</strong>
            <span>GENRES</span>
          </div>
        </div>
      </div>

      {/* Taste Identity */}
      <section className="profile-section">
        <div className="section-title-rule"><span>TASTE IDENTITY</span></div>
        <div className="taste-tags">
          {tasteGenres.map((g) => (
            <span
              key={g.label}
              className={`taste-tag${g.accent === true ? ' taste-tag--primary' : g.accent === 'muted' ? ' taste-tag--muted' : ''}`}
            >
              {g.label}
            </span>
          ))}
        </div>
      </section>

      {/* Reputation */}
      <section className="profile-section">
        <div className="section-title-rule"><span>REPUTATION</span></div>
        <div className="badges-row">
          {badges.map(({ icon: Icon, label }, i) => {
            const active = i === 0 || i === 2
            return (
              <div key={label} className="badge-item">
                <div className={`badge-icon${active ? ' badge-icon--active' : ''}`}>
                  <Icon size={22} />
                </div>
                <span className="badge-label">{label}</span>
              </div>
            )
          })}
        </div>
      </section>

      {/* Gig History — preview (top 5) */}
      <section className="profile-section">
        <div className="section-title-rule"><span>GIG HISTORY</span></div>
        <GigHistoryList items={previewGigs} hasMore={remaining > 0} />
        {remaining > 0 && (
          <button
            type="button"
            className="show-all-gigs-btn"
            onClick={openGigHistory}
          >
            <span>Show all {gigHistory.length} gigs</span>
            <ChevronRight size={15} />
          </button>
        )}
      </section>

      {/* Go Pro upsell */}
      <div className="gopro-card">
        <div className="gopro-lock">
          <Lock size={22} />
        </div>
        <h3 className="gopro-title">LEVEL UP YOUR LEGEND</h3>
        <p className="gopro-desc">
          Unlock your full 3-year history, deep data analytics, and early access to buzzed guestlists.
        </p>
        <button type="button" className="gopro-btn">
          GO PRO — €4.99/MO
        </button>
      </div>
    </motion.div>
  )
}

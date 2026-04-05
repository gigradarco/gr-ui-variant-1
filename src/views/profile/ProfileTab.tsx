import type { CSSProperties } from 'react'
import { motion } from 'framer-motion'
import {
  Building2,
  ChevronRight,
  Lock,
  LogOut,
  Moon,
  Settings,
  Star,
  Trophy,
  Zap,
} from 'lucide-react'
import { BUZO_PRO_UPSELL_CTA } from '../../config/pricing'
import { buzzSummary, getBuzzTierState } from '../../data/demoData'
import { useAppState } from '../../store/appStore'

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
  const { openSettings, openBuzzPoints, returnToLanding, userProfile } = useAppState()
  const { current: buzzTier } = getBuzzTierState(buzzSummary.total)
  const headline =
    userProfile.displayName.trim() !== ''
      ? userProfile.displayName.trim()
      : `@${userProfile.username}`
  const avatarLabel =
    userProfile.displayName.trim() !== '' ? userProfile.displayName.trim() : userProfile.username
  const ringFill = Math.min(1, Math.max(0, experienceRingFill))
  const ringPercent = Math.round(ringFill * 100)
  const ringStyle = { '--ring-fill': ringFill } as CSSProperties

  const tasteCount = tasteGenres.length
  const badgeCount = badges.length

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
        <button
          className="icon-btn profile-toolbar-logout"
          type="button"
          aria-label="Log out"
          onClick={returnToLanding}
        >
          <LogOut size={18} aria-hidden />
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
                src={userProfile.avatarUrl}
                alt={avatarLabel}
                className="profile-avatar-img"
                decoding="async"
                fetchPriority="high"
              />
            </div>
          </div>
          <span className="profile-rank-badge">
            Lv.{buzzTier.level} {buzzTier.label}
          </span>
        </div>
        <h2 className="profile-display-name">{headline}</h2>
        <span className="profile-handle-pill">@{userProfile.username}</span>
        <button
          type="button"
          className="profile-buzz-row"
          onClick={openBuzzPoints}
          aria-label="Open buzz points details"
        >
          <span className="profile-buzz">
            {buzzSummary.total.toLocaleString('en-US')} BUZZ POINTS
          </span>
          <ChevronRight size={16} className="profile-buzz-chevron" aria-hidden />
        </button>
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
      <section className="profile-section" aria-labelledby="profile-taste-heading">
        <div className="section-title-rule" id="profile-taste-heading">
          <span>
            Taste identity <span className="section-title-count">({tasteCount})</span>
          </span>
        </div>
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
      <section className="profile-section" aria-labelledby="profile-reputation-heading">
        <div className="section-title-rule" id="profile-reputation-heading">
          <span>
            Reputation <span className="section-title-count">({badgeCount})</span>
          </span>
        </div>
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
          {BUZO_PRO_UPSELL_CTA}
        </button>
      </div>
    </motion.div>
  )
}

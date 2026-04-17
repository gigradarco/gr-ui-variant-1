import { useEffect, useState, type CSSProperties } from 'react'
import { motion } from 'framer-motion'
import { ChevronRight, Lock, LogOut, Settings } from 'lucide-react'
import { BUZO_PRO_UPSELL_CTA } from '../../config/pricing'
import { buzzSummary, getBuzzTierState } from '../../data/demoData'
import {
  PROFILE_REPUTATION_PREVIEW_COUNT,
  PROFILE_TASTE_PREVIEW_COUNT,
  reputationBadges,
  tasteIdentityTags,
} from '../../data/profileIdentity'
import {
  PROFILE_CITIES_COUNT,
  PROFILE_GENRES_TRACKED,
  PROFILE_GIGS_TOTAL,
} from '../../data/profileStats'
import { postSignOut } from '../../lib/auth-api'
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

export function ProfileTab({
  experienceRingFill = PROFILE_EXPERIENCE_RING_FALLBACK,
}: ProfileTabProps) {
  const {
    openSettings,
    openBuzzPoints,
    openProfileTasteAll,
    openProfileReputationAll,
    openProfileStats,
    returnToLanding,
    userProfile,
    isAuthenticated,
    setTab,
  } = useAppState()
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
  const [avatarLoaded, setAvatarLoaded] = useState(false)

  const tastePreview = tasteIdentityTags.slice(0, PROFILE_TASTE_PREVIEW_COUNT)
  const badgesPreview = reputationBadges.slice(0, PROFILE_REPUTATION_PREVIEW_COUNT)
  const tasteCount = tasteIdentityTags.length
  const badgeCount = reputationBadges.length

  // Redirect unauthenticated users to discover with sign-in prompt
  useEffect(() => {
    if (!isAuthenticated) {
      setTab('discover')
      setTimeout(() => {
        useAppState.setState({
          showSignIn: true,
          signInRedirectError: 'Please sign in to view your profile.',
        })
      }, 300)
    }
  }, [isAuthenticated, setTab])

  useEffect(() => {
    setAvatarLoaded(false)
  }, [userProfile.avatarUrl])

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
          onClick={() => {
            void postSignOut().finally(() => returnToLanding())
          }}
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
            <div className={`profile-avatar-inner${avatarLoaded ? ' is-loaded' : ''}`}>
              <span className="profile-avatar-placeholder" aria-hidden />
              <img
                src={userProfile.avatarUrl}
                alt={avatarLabel}
                className="profile-avatar-img"
                decoding="async"
                fetchPriority="high"
                loading="eager"
                onLoad={() => setAvatarLoaded(true)}
                onError={() => setAvatarLoaded(true)}
              />
              <span className="profile-avatar-gloss" aria-hidden />
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
        <div className="profile-stats-row" role="group" aria-label="Scene stats">
          <button
            type="button"
            className="profile-stat profile-stat-btn"
            onClick={() => openProfileStats('cities')}
            aria-label={`Open cities: ${PROFILE_CITIES_COUNT} cities visited`}
          >
            <strong>{PROFILE_CITIES_COUNT}</strong>
            <span>CITIES</span>
          </button>
          <div className="profile-stat-divider" aria-hidden />
          <button
            type="button"
            className="profile-stat profile-stat-btn"
            onClick={() => openProfileStats('gigs')}
            aria-label={`Open gigs: ${PROFILE_GIGS_TOTAL} gigs attended`}
          >
            <strong>{PROFILE_GIGS_TOTAL}</strong>
            <span>GIGS</span>
          </button>
          <div className="profile-stat-divider" aria-hidden />
          <button
            type="button"
            className="profile-stat profile-stat-btn"
            onClick={() => openProfileStats('genres')}
            aria-label={`Open genres: ${PROFILE_GENRES_TRACKED} genres tracked`}
          >
            <strong>{PROFILE_GENRES_TRACKED}</strong>
            <span>GENRES</span>
          </button>
        </div>
        <button
          type="button"
          className="profile-stats-overview-link"
          onClick={() => openProfileStats()}
        >
          View full breakdown
        </button>
      </div>

      {/* Taste Identity */}
      <section className="profile-section" aria-labelledby="profile-taste-heading">
        <div className="section-title-rule section-title-rule--with-action" id="profile-taste-heading">
          <span className="section-title-rule__text">
            Taste identity <span className="section-title-count">({tasteCount})</span>
          </span>
          <span className="section-title-rule__line" aria-hidden />
          <button
            type="button"
            className="section-title-action"
            onClick={openProfileTasteAll}
          >
            Show all
          </button>
        </div>
        <div className="taste-tags">
          {tastePreview.map((g) => (
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
        <div className="section-title-rule section-title-rule--with-action" id="profile-reputation-heading">
          <span className="section-title-rule__text">
            Reputation <span className="section-title-count">({badgeCount})</span>
          </span>
          <span className="section-title-rule__line" aria-hidden />
          <button
            type="button"
            className="section-title-action"
            onClick={openProfileReputationAll}
          >
            Show all
          </button>
        </div>
        <div className="badges-row">
          {badgesPreview.map(({ icon: Icon, label, accent }, i) => {
            const active = accent === true
            return (
              <div key={`${i}-${label}`} className="badge-item">
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

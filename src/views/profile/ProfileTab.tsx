import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { motion } from 'framer-motion'
import { Lock, LogOut, Settings } from 'lucide-react'
import { BUZO_PRO_UPSELL_CTA } from '../../config/pricing'
import { buzzSummary, getBuzzTierState } from '../../data/demoData'
import {
  mapReputationBadgeFromApi,
  reputationBadgesFallback,
  TASTE_AND_RECOMMENDATIONS_TITLE,
  type TasteIdentityItem,
} from '../../data/profileIdentity'
import {
  PROFILE_CITIES_COUNT,
  PROFILE_GENRES_TRACKED,
  PROFILE_GIGS_TOTAL,
} from '../../data/profileStats'
import { postSignOut } from '../../lib/auth-api'
import { flushPersistUserTasteCategories } from '../../lib/persist-user-taste'
import { api } from '../../lib/trpc'
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
    openProfileReputationAll,
    openProfileStats,
    returnToLanding,
    userProfile,
    isAuthenticated,
    setTab,
    tasteIdentityItems,
    cycleTasteIdentityTag,
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
  const [avatarFailed, setAvatarFailed] = useState(false)
  const [tasteEditMode, setTasteEditMode] = useState(false)
  const [tooltipBadgeId, setTooltipBadgeId] = useState<string | null>(null)
  const tasteEditBaselineRef = useRef<TasteIdentityItem[] | null>(null)
  const reputationQuery = api.profile.reputation.useQuery(undefined, {
    enabled: isAuthenticated,
    staleTime: 60_000,
  })

  const tasteTagsShown = tasteIdentityItems
  const reputationBadges =
    reputationQuery.data?.badges.map(mapReputationBadgeFromApi) ?? reputationBadgesFallback
  const earnedReputationBadges = reputationBadges.filter((badge) => badge.status === 'earned')
  const recentEarnedReputationBadges = [...earnedReputationBadges].sort((a, b) => {
    const aTs = a.earnedAt ? Date.parse(a.earnedAt) : Number.NaN
    const bTs = b.earnedAt ? Date.parse(b.earnedAt) : Number.NaN
    const aValid = Number.isFinite(aTs)
    const bValid = Number.isFinite(bTs)
    if (aValid && bValid) return bTs - aTs
    if (aValid) return -1
    if (bValid) return 1
    return 0
  })
  const badgesPreview =
    (recentEarnedReputationBadges.length > 0 ? recentEarnedReputationBadges : reputationBadges).slice(0, 5)
  const tasteHighlightedCount = tasteIdentityItems.filter((t) => t.accent).length
  const badgeCount = earnedReputationBadges.length
  const reputationPreviewCopy =
    earnedReputationBadges.length > 0
      ? `Showing latest ${badgesPreview.length} earned badge${badgesPreview.length === 1 ? '' : 's'} (up to 5).`
      : 'No earned badges yet. Showing starter badges.'

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
    setAvatarFailed(false)
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
            <div className={`profile-avatar-inner${avatarLoaded && !avatarFailed ? ' is-loaded' : ''}`}>
              <span className="profile-avatar-placeholder" aria-hidden>
                {avatarFailed ? (
                  <span className="profile-avatar-initial">
                    {avatarLabel.charAt(0).toUpperCase()}
                  </span>
                ) : null}
              </span>
              {!avatarFailed && userProfile.avatarUrl ? (
                <img
                  src={userProfile.avatarUrl}
                  alt={avatarLabel}
                  className="profile-avatar-img"
                  decoding="async"
                  fetchPriority="high"
                  loading="eager"
                  referrerPolicy="no-referrer"
                  onLoad={() => setAvatarLoaded(true)}
                  onError={() => {
                    setAvatarFailed(true)
                    setAvatarLoaded(false)
                  }}
                />
              ) : null}
              <span className="profile-avatar-gloss" aria-hidden />
            </div>
          </div>
          <span className="profile-rank-badge">
            Lv.{buzzTier.level} {buzzTier.label}
          </span>
        </div>
        <h2
          className="profile-display-name"
          data-profile-headline={userProfile.displayName.trim() !== '' ? 'display' : 'handle'}
        >
          {headline}
        </h2>
        <span className="profile-handle-pill">@{userProfile.username}</span>
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

      {/* Taste & recommendations */}
      <section
        className="profile-section"
        aria-labelledby="profile-taste-heading"
        {...(tasteEditMode
          ? { 'aria-describedby': 'profile-taste-edit-hint' as const }
          : {})}
      >
        <div className="section-title-rule section-title-rule--with-action" id="profile-taste-heading">
          <span className="section-title-rule__text">
            {TASTE_AND_RECOMMENDATIONS_TITLE}{' '}
            <span className="section-title-count">({tasteHighlightedCount})</span>
          </span>
          <span className="section-title-rule__line" aria-hidden />
          <button
            type="button"
            className="section-title-action"
            onClick={() => {
              if (tasteEditMode) {
                void flushPersistUserTasteCategories(
                  () => useAppState.getState().tasteIdentityItems,
                  () => useAppState.getState().isAuthenticated,
                  { baseline: tasteEditBaselineRef.current },
                ).finally(() => {
                  tasteEditBaselineRef.current = null
                  setTasteEditMode(false)
                })
              } else {
                tasteEditBaselineRef.current = useAppState
                  .getState()
                  .tasteIdentityItems.map((t) => ({ ...t }))
                setTasteEditMode(true)
              }
            }}
            aria-expanded={tasteEditMode}
          >
            {tasteEditMode ? 'Done' : 'Edit'}
          </button>
        </div>
        {tasteEditMode ? (
          <p id="profile-taste-edit-hint" className="profile-taste-edit-hint">
            Tap a tag to highlight it on your profile or turn the highlight off.
          </p>
        ) : null}
        <div className={`taste-tags${tasteEditMode ? ' taste-tags--editing' : ''}`}>
          {tasteTagsShown.map((g) => {
            const cls = `taste-tag${g.accent ? ' taste-tag--primary' : ''}`
            if (tasteEditMode) {
              return (
                <button
                  key={g.label}
                  type="button"
                  className={cls}
                  onClick={() => cycleTasteIdentityTag(g.label)}
                  aria-label={`Update style for ${g.label}`}
                >
                  {g.label}
                </button>
              )
            }
            return (
              <span key={g.label} className={cls}>
                {g.label}
              </span>
            )
          })}
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
          {badgesPreview.map(({ id, icon: Icon, label, status, unlockHint, progressValue, progressTarget }, i) => {
            const active = status === 'earned'
            const inProgress = status === 'in_progress'
            const tooltipText =
              status === 'earned'
                ? `Earned. ${unlockHint}`
                : `${unlockHint} (${progressValue}/${progressTarget})`
            return (
              <div key={`${id}-${i}`} className="badge-item">
                <button
                  type="button"
                  className={`badge-icon badge-icon-btn${active ? ' badge-icon--active' : ''}${
                    inProgress ? ' badge-icon--in-progress' : ''
                  }`}
                  title={tooltipText}
                  aria-label={`${label.replace('\n', ' ')}: ${tooltipText}`}
                  onClick={() => setTooltipBadgeId((current) => (current === id ? null : id))}
                >
                  <Icon size={28} />
                </button>
                <span className="badge-label">{label}</span>
                {tooltipBadgeId === id ? (
                  <div className="badge-tooltip" role="status">
                    {tooltipText}
                  </div>
                ) : null}
              </div>
            )
          })}
        </div>
        <p className="profile-reputation-preview-note">{reputationPreviewCopy}</p>
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

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Lock, LogOut, Settings } from 'lucide-react'
import { BUZO_PRO_UPSELL_CTA } from '../../config/pricing'
import { buzzSummary, getBuzzTierState } from '../../data/demoData'
import {
  mapReputationBadgeFromApi,
  reputationBadgesFallback,
  TASTE_AND_RECOMMENDATIONS_TITLE,
} from '../../data/profileIdentity'
import {
  getCachedAvatarDataUrl,
  persistAvatarToLocalCache,
  warmAvatarCacheIfEmpty,
} from '../../lib/avatar-image-cache.ts'
import { postSignOut } from '../../lib/auth-api'
import { api } from '../../lib/trpc'
import { useAppState } from '../../store/appStore'

export const PROFILE_EXPERIENCE_RING_FALLBACK = 0.75

export function ProfileTab() {
  const {
    openSettings,
    openProfileReputationAll,
    openSubscription,
    returnToLanding,
    userProfile,
    isAuthenticated,
    setTab,
    subscriptionTier,
    tasteIdentityItems,
  } = useAppState()
  const { current: buzzTier } = getBuzzTierState(buzzSummary.total)
  const headline =
    userProfile.displayName.trim() !== ''
      ? userProfile.displayName.trim()
      : `@${userProfile.username}`
  const avatarLabel =
    userProfile.displayName.trim() !== '' ? userProfile.displayName.trim() : userProfile.username
  const [avatarLoaded, setAvatarLoaded] = useState(false)
  const [avatarFailed, setAvatarFailed] = useState(false)
  /** Bumps when `warmAvatarCacheIfEmpty` writes so the `<img>` remounts with the cached data URL. */
  const [avatarCacheRevision, setAvatarCacheRevision] = useState(0)
  const remoteAvatarUrl = userProfile.avatarUrl
  const cachedAvatarSrc = getCachedAvatarDataUrl(remoteAvatarUrl)
  const avatarDisplaySrc = cachedAvatarSrc ?? remoteAvatarUrl
  const [tooltipBadgeId, setTooltipBadgeId] = useState<string | null>(null)
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
  const tasteCount = tasteIdentityItems.length
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
  }, [avatarDisplaySrc])

  useEffect(() => {
    if (!isAuthenticated || !remoteAvatarUrl?.trim()) return
    let cancelled = false
    void warmAvatarCacheIfEmpty(remoteAvatarUrl.trim()).then((wrote: boolean) => {
      if (!cancelled && wrote) setAvatarCacheRevision((t) => t + 1)
    })
    return () => {
      cancelled = true
    }
  }, [isAuthenticated, remoteAvatarUrl])

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
          >
            <div className={`profile-avatar-inner${avatarLoaded && !avatarFailed ? ' is-loaded' : ''}`}>
              <span className="profile-avatar-placeholder" aria-hidden>
                {avatarFailed ? (
                  <span className="profile-avatar-initial">
                    {avatarLabel.charAt(0).toUpperCase()}
                  </span>
                ) : null}
              </span>
              {!avatarFailed && avatarDisplaySrc ? (
                <img
                  key={`${avatarDisplaySrc}:${avatarCacheRevision}`}
                  src={avatarDisplaySrc}
                  alt={avatarLabel}
                  className="profile-avatar-img"
                  decoding="async"
                  fetchPriority="high"
                  loading="eager"
                  referrerPolicy="no-referrer"
                  onLoad={(e) => {
                    setAvatarLoaded(true)
                    if (remoteAvatarUrl) persistAvatarToLocalCache(remoteAvatarUrl, e.currentTarget)
                  }}
                  onError={() => {
                    setAvatarFailed(true)
                    setAvatarLoaded(false)
                  }}
                />
              ) : null}
              <span className="profile-avatar-gloss" aria-hidden />
            </div>
          </div>
          <span className="profile-rank-badge" style={{ display: 'none' }} aria-hidden>
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
      </div>

      {/* Taste & recommendations */}
      <section className="profile-section" aria-labelledby="profile-taste-heading">
        <div className="section-title-rule" id="profile-taste-heading">
          <span className="section-title-rule__text">
            {TASTE_AND_RECOMMENDATIONS_TITLE}{' '}
            <span className="section-title-count">({tasteCount})</span>
          </span>
          <span className="section-title-rule__line" aria-hidden />
        </div>
        <div className="taste-tags">
          {tasteTagsShown.map((g) => (
            <span key={g.label} className="taste-tag">
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

      {subscriptionTier === 'basic' ? (
        <div className="gopro-card">
          <div className="gopro-lock">
            <Lock size={22} />
          </div>
          <h3 className="gopro-title">LEVEL UP YOUR LEGEND</h3>
          <p className="gopro-desc">
            Unlock your full 3-year history, deep data analytics, and early access to buzzed
            guestlists.
          </p>
          <button type="button" className="gopro-btn" onClick={openSubscription}>
            {BUZO_PRO_UPSELL_CTA}
          </button>
        </div>
      ) : null}
    </motion.div>
  )
}

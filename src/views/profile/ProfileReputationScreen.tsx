import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { mapReputationBadgeFromApi, reputationBadgesFallback } from '../../data/profileIdentity'
import { api } from '../../lib/trpc'
import { useAppState } from '../../store/appStore'

export function ProfileReputationScreen() {
  const { closeProfileReputationAll, isAuthenticated } = useAppState()
  const [tooltipBadgeId, setTooltipBadgeId] = useState<string | null>(null)
  const reputationQuery = api.profile.reputation.useQuery(undefined, {
    enabled: isAuthenticated,
    staleTime: 60_000,
  })
  const reputationBadges =
    reputationQuery.data?.badges.map(mapReputationBadgeFromApi) ?? reputationBadgesFallback

  return (
    <motion.div
      className="profile-list-screen"
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', stiffness: 320, damping: 34 }}
    >
      <header className="profile-list-screen-header">
        <button
          type="button"
          className="profile-list-screen-back"
          onClick={closeProfileReputationAll}
          aria-label="Back to profile"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="profile-list-screen-title">Reputation</h1>
        <span className="profile-list-screen-spacer" aria-hidden />
      </header>
      <div className="profile-list-screen-body">
        <p className="profile-list-screen-intro">
          Badges earned from check-ins, streaks, and scene contributions.
        </p>
        <div className="profile-reputation-grid">
          {reputationBadges.map(
            ({ id, icon: Icon, label, status, unlockHint, progressValue, progressTarget }) => (
            <div key={id} className="badge-item profile-reputation-grid__item">
              <button
                type="button"
                className={`badge-icon badge-icon-btn${status === 'earned' ? ' badge-icon--active' : ''}${
                  status === 'in_progress' ? ' badge-icon--in-progress' : ''
                }`}
                title={
                  status === 'earned'
                    ? `Earned. ${unlockHint}`
                    : `${unlockHint} (${progressValue}/${progressTarget})`
                }
                aria-label={`${label.replace('\n', ' ')}: ${unlockHint}`}
                onClick={() => setTooltipBadgeId((current) => (current === id ? null : id))}
              >
                  <Icon size={28} />
              </button>
              <span className="badge-label">{label}</span>
              {tooltipBadgeId === id ? (
                <div className="badge-tooltip" role="status">
                  {status === 'earned'
                    ? `Earned. ${unlockHint}`
                    : `${unlockHint} (${progressValue}/${progressTarget})`}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { reputationBadges } from '../../data/profileIdentity'
import { useAppState } from '../../store/appStore'

export function ProfileReputationScreen() {
  const { closeProfileReputationAll } = useAppState()

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
          {reputationBadges.map(({ icon: Icon, label, accent }, index) => (
            <div key={`${index}-${label}`} className="badge-item profile-reputation-grid__item">
              <div className={`badge-icon${accent ? ' badge-icon--active' : ''}`}>
                <Icon size={22} />
              </div>
              <span className="badge-label">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

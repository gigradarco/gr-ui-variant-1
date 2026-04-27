import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { TASTE_AND_RECOMMENDATIONS_TITLE } from '../../data/profileIdentity'
import { useAppState } from '../../store/appStore'

export function ProfileTasteIdentityScreen() {
  const { closeProfileTasteAll, tasteIdentityItems } = useAppState()

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
          onClick={closeProfileTasteAll}
          aria-label="Back to profile"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="profile-list-screen-title">{TASTE_AND_RECOMMENDATIONS_TITLE}</h1>
        <span className="profile-list-screen-spacer" aria-hidden />
      </header>
      <div className="profile-list-screen-body">
        <p className="profile-list-screen-intro">
          Genres and tags that shape your recommendations and discovery.
        </p>
        <div className="taste-tags profile-taste-tags--full">
          {tasteIdentityItems.map((g) => (
            <span key={g.label} className="taste-tag">
              {g.label}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

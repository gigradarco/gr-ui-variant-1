import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { TASTE_AND_RECOMMENDATIONS_TITLE } from '../../data/profileIdentity'
import { flushPersistUserTasteCategories } from '../../lib/persist-user-taste'
import { useAppState } from '../../store/appStore'

export function ProfileTasteIdentityScreen() {
  const { closeProfileTasteAll, tasteIdentityItems, cycleTasteIdentityTag } = useAppState()

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
          onClick={() => {
            void flushPersistUserTasteCategories(
              () => useAppState.getState().tasteIdentityItems,
              () => useAppState.getState().isAuthenticated,
            ).finally(() => closeProfileTasteAll())
          }}
          aria-label="Back to profile"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="profile-list-screen-title">{TASTE_AND_RECOMMENDATIONS_TITLE}</h1>
        <span className="profile-list-screen-spacer" aria-hidden />
      </header>
      <div className="profile-list-screen-body">
        <p className="profile-list-screen-intro">
          Genres and tags that shape your recommendations and discovery. Tap a tag to cycle its
          style.
        </p>
        <div className="taste-tags profile-taste-tags--full taste-tags--editing">
          {tasteIdentityItems.map((g) => (
            <button
              key={g.label}
              type="button"
              className={`taste-tag${g.accent === true ? ' taste-tag--primary' : g.accent === 'muted' ? ' taste-tag--muted' : ''}`}
              onClick={() => cycleTasteIdentityTag(g.label)}
              aria-label={`Update style for ${g.label}`}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

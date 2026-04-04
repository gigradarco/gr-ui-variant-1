import { useState, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Camera } from 'lucide-react'
import { useAppState } from '../../../store/appStore'

export function EditProfileScreen() {
  const closeEditProfile = useAppState((s) => s.closeEditProfile)
  const setUserProfile = useAppState((s) => s.setUserProfile)
  const avatarUrl = useAppState((s) => s.userProfile.avatarUrl)

  const [displayName, setDisplayName] = useState(
    () => useAppState.getState().userProfile.displayName,
  )
  const [username, setUsername] = useState(() => useAppState.getState().userProfile.username)
  const [bio, setBio] = useState(() => useAppState.getState().userProfile.bio)

  const changePhoto = () => {
    window.alert('Demo: open camera roll or image picker, then upload to your profile API.')
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const handle = username.trim().replace(/^@+/, '').toUpperCase()
    if (!handle) {
      window.alert('Choose a username.')
      return
    }
    setUserProfile({
      displayName: displayName.trim(),
      username: handle,
      bio: bio.trim(),
    })
    closeEditProfile()
    window.alert('Profile saved. (Demo — connect to your API.)')
  }

  return (
    <motion.div
      className="edit-profile-screen"
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', stiffness: 320, damping: 34 }}
    >
      <header className="edit-profile-screen-header">
        <button
          type="button"
          className="edit-profile-screen-back"
          onClick={closeEditProfile}
          aria-label="Back to settings"
        >
          <ArrowLeft size={18} />
        </button>
        <span className="edit-profile-screen-title">Edit profile</span>
        <span className="edit-profile-screen-spacer" aria-hidden />
      </header>

      <form className="edit-profile-body" onSubmit={handleSubmit}>
        <div className="edit-profile-group">
          <h3 className="edit-profile-group-title">Photo</h3>
          <div className="edit-profile-group-card edit-profile-photo-card">
            <div className="edit-profile-avatar-wrap">
              <img
                src={avatarUrl}
                alt=""
                className="edit-profile-avatar"
                decoding="async"
              />
            </div>
            <button type="button" className="edit-profile-change-photo" onClick={changePhoto}>
              <Camera size={18} aria-hidden />
              <span>Change photo</span>
            </button>
          </div>
        </div>

        <div className="edit-profile-group">
          <h3 className="edit-profile-group-title">Public profile</h3>
          <div className="edit-profile-group-card edit-profile-fields">
            <label className="edit-profile-label" htmlFor="edit-profile-display-name">
              Display name
            </label>
            <input
              id="edit-profile-display-name"
              className="edit-profile-input"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              autoComplete="name"
              placeholder="Your name"
            />

            <div className="edit-profile-field-divider" aria-hidden />

            <label className="edit-profile-label" htmlFor="edit-profile-username">
              Username
            </label>
            <div className="edit-profile-username-field">
              <span className="edit-profile-username-prefix" aria-hidden>
                @
              </span>
              <input
                id="edit-profile-username"
                className="edit-profile-input edit-profile-input--username"
                value={username}
                onChange={(e) =>
                  setUsername(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, ''))
                }
                autoCapitalize="characters"
                autoCorrect="off"
                spellCheck={false}
                maxLength={24}
                placeholder="HANDLE"
              />
            </div>
          </div>
        </div>

        <div className="edit-profile-group">
          <h3 className="edit-profile-group-title">About</h3>
          <div className="edit-profile-group-card edit-profile-fields">
            <label className="edit-profile-label" htmlFor="edit-profile-bio">
              Bio <span className="edit-profile-optional">(optional)</span>
            </label>
            <textarea
              id="edit-profile-bio"
              className="edit-profile-textarea"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Clubs, genres, what you’re into…"
              rows={4}
              maxLength={280}
            />
            <p className="edit-profile-char-count" aria-live="polite">
              {bio.length}/280
            </p>
          </div>
        </div>

        <div className="edit-profile-footer">
          <button type="submit" className="edit-profile-save">
            Save changes
          </button>
        </div>
      </form>
    </motion.div>
  )
}

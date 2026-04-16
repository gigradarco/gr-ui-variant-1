import { useCallback, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, Camera } from 'lucide-react'
import { UploadToast, type UploadToastState } from '../../../components/UploadToast'
import { postProfileAvatar } from '../../../lib/auth-api'
import { resizeImageForAvatar } from '../../../lib/resizeImageForAvatar'
import { useAppState } from '../../../store/appStore'
import { AvatarCropModal } from './AvatarCropModal'

export function EditProfileScreen() {
  const closeEditProfile = useAppState((s) => s.closeEditProfile)
  const setUserProfile = useAppState((s) => s.setUserProfile)
  const avatarUrl = useAppState((s) => s.userProfile.avatarUrl)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [photoBusy, setPhotoBusy] = useState(false)
  const [photoError, setPhotoError] = useState<string | null>(null)
  const [pendingCropFile, setPendingCropFile] = useState<File | null>(null)
  const [uploadToast, setUploadToast] = useState<UploadToastState>(null)
  const toastIdRef = useRef(0)

  const dismissUploadToast = useCallback(() => setUploadToast(null), [])

  const pushUploadToast = useCallback((message: string, variant: 'success' | 'error') => {
    toastIdRef.current += 1
    setUploadToast({ id: toastIdRef.current, variant, message })
  }, [])

  const [displayName, setDisplayName] = useState(
    () => useAppState.getState().userProfile.displayName,
  )
  const [username, setUsername] = useState(() => useAppState.getState().userProfile.username)
  const [bio, setBio] = useState(() => useAppState.getState().userProfile.bio)

  const openPhotoPicker = () => {
    setPhotoError(null)
    fileInputRef.current?.click()
  }

  const onPhotoSelected = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file || !file.type.startsWith('image/')) {
      setPhotoError('Choose an image file.')
      return
    }
    setPhotoError(null)
    setPendingCropFile(file)
  }

  const onCropConfirm = async (cropped: File) => {
    setPhotoBusy(true)
    setPhotoError(null)
    try {
      const prepared = await resizeImageForAvatar(cropped)
      const url = await postProfileAvatar(prepared)
      setUserProfile({ avatarUrl: url })
      setPendingCropFile(null)
      pushUploadToast('Profile photo updated.', 'success')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Upload failed'
      setPhotoError(msg)
      pushUploadToast(msg, 'error')
      throw err
    } finally {
      setPhotoBusy(false)
    }
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
              <div className="edit-profile-avatar-inner">
                <img
                  src={avatarUrl}
                  alt=""
                  className="edit-profile-avatar"
                  decoding="async"
                />
                <span className="edit-profile-avatar-gloss" aria-hidden />
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/*"
              className="edit-profile-photo-input"
              aria-hidden
              tabIndex={-1}
              onChange={onPhotoSelected}
            />
            <button
              type="button"
              className="edit-profile-change-photo"
              onClick={openPhotoPicker}
              disabled={photoBusy}
              aria-busy={photoBusy}
              aria-describedby="edit-profile-photo-hint"
            >
              <Camera size={18} aria-hidden />
              <span>{photoBusy ? 'Uploading…' : 'Change photo'}</span>
            </button>
            <p id="edit-profile-photo-hint" className="edit-profile-photo-hint">
              JPEG, PNG, or WebP · max 2&nbsp;MB
            </p>
            {photoError ? (
              <p className="edit-profile-photo-error" role="alert">
                {photoError}
              </p>
            ) : null}
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

      <AnimatePresence>
        {pendingCropFile ? (
          <AvatarCropModal
            key={`${pendingCropFile.name}-${pendingCropFile.size}-${pendingCropFile.lastModified}`}
            file={pendingCropFile}
            onCancel={() => setPendingCropFile(null)}
            onConfirm={onCropConfirm}
          />
        ) : null}
      </AnimatePresence>

      <UploadToast toast={uploadToast} onDismiss={dismissUploadToast} />
    </motion.div>
  )
}

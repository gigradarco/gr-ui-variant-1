import { useCallback, useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, Camera } from 'lucide-react'
import { UploadToast, type UploadToastState } from '../../../components/UploadToast'
import { postProfileAvatar } from '../../../lib/auth-api'
import { resizeImageForAvatar } from '../../../lib/resizeImageForAvatar'
import { api } from '../../../lib/trpc'
import { useAppState } from '../../../store/appStore'
import { AvatarCropModal } from './AvatarCropModal'

function normalizeProfileUsername(s: string): string {
  return s.trim().replace(/^@+/, '').toLowerCase()
}

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

  const initialNormalized = useRef(
    normalizeProfileUsername(useAppState.getState().userProfile.username),
  )
  const [verifiedFor, setVerifiedFor] = useState<string | null>(null)

  const checkUsernameMu = api.profile.checkUsername.useMutation()
  const updateProfileMu = api.profile.update.useMutation()

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

  useEffect(() => {
    const n = normalizeProfileUsername(username)
    setVerifiedFor((prev) => (prev !== null && n !== prev ? null : prev))
  }, [username])

  const normalizedNow = normalizeProfileUsername(username)
  const usernameChanged = normalizedNow !== initialNormalized.current

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

  const onVerifyUsername = async () => {
    const n = normalizeProfileUsername(username)
    if (n.length < 4) {
      pushUploadToast('Username must be at least 4 characters.', 'error')
      return
    }
    if (!usernameChanged) {
      pushUploadToast('This is already your username.', 'success')
      setVerifiedFor(n)
      return
    }
    try {
      const r = await checkUsernameMu.mutateAsync({ username: n })
      if (r.available) {
        setVerifiedFor(n)
        pushUploadToast('Username is available.', 'success')
      } else {
        pushUploadToast('That username is taken.', 'error')
      }
    } catch (err) {
      pushUploadToast(err instanceof Error ? err.message : 'Could not verify username.', 'error')
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const n = normalizeProfileUsername(username)
    if (!n) {
      pushUploadToast('Choose a username.', 'error')
      return
    }
    if (usernameChanged) {
      if (n.length < 4) {
        pushUploadToast('Username must be at least 4 characters.', 'error')
        return
      }
      if (verifiedFor !== n) {
        pushUploadToast('Verify your new username before saving.', 'error')
        return
      }
    }
    const payload: {
      displayName: string
      bio: string
      username?: string
    } = {
      displayName: displayName.trim(),
      bio: bio.trim(),
    }
    if (usernameChanged) {
      payload.username = n
    }
    try {
      const data = await updateProfileMu.mutateAsync(payload)
      setUserProfile({
        displayName: String(data.display_name ?? '').trim() || displayName.trim(),
        username: String(data.username ?? n)
          .replace(/^@/, '')
          .toUpperCase(),
        bio: String(data.bio ?? '').trim(),
        avatarUrl: String(data.avatar_url ?? avatarUrl),
      })
      closeEditProfile()
      pushUploadToast('Profile saved.', 'success')
    } catch (err) {
      pushUploadToast(err instanceof Error ? err.message : 'Could not save profile.', 'error')
    }
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
                aria-describedby="edit-profile-username-hint"
                value={username}
                onChange={(e) =>
                  setUsername(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, ''))
                }
                autoCapitalize="characters"
                autoCorrect="off"
                spellCheck={false}
                maxLength={30}
                placeholder="HANDLE"
              />
            </div>
            <div className="edit-profile-username-actions">
              <button
                type="button"
                className="edit-profile-verify-username"
                onClick={onVerifyUsername}
                disabled={checkUsernameMu.isPending || !usernameChanged}
              >
                {checkUsernameMu.isPending ? 'Checking…' : 'Verify username'}
              </button>
              <p className="edit-profile-username-hint" id="edit-profile-username-hint">
                {usernameChanged
                  ? verifiedFor === normalizedNow
                    ? 'Verified — you can save.'
                    : 'New handle: 4–30 characters · verify before save.'
                  : '4–30 characters. Change handle to verify before save.'}
              </p>
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
          <button
            type="submit"
            className="edit-profile-save"
            disabled={updateProfileMu.isPending}
          >
            {updateProfileMu.isPending ? 'Saving…' : 'Save changes'}
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

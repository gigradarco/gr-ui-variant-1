import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Check } from 'lucide-react'
import { TASTE_AND_RECOMMENDATIONS_TITLE } from '../../data/profileIdentity'
import { postProfileTastePreferences } from '../../lib/auth-api'
import { useAppState } from '../../store/appStore'

export function ProfileTasteIdentityScreen() {
  const {
    closeProfileTasteAll,
    tasteIdentityItems,
    setTasteIdentityItems,
  } = useAppState()

  // All labels the user currently has selected
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(tasteIdentityItems.map((t) => t.label)),
  )
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const toggle = (label: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(label)) {
        next.delete(label)
      } else {
        next.add(label)
      }
      return next
    })
    setSaveError(null)
  }

  const handleSave = async () => {
    setSaving(true)
    setSaveError(null)
    const labels = [...selected].sort()
    try {
      await postProfileTastePreferences(labels)
      // Optimistically update the profile display
      setTasteIdentityItems(labels.map((label) => ({ label })))
      closeProfileTasteAll()
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Could not save. Try again.')
    } finally {
      setSaving(false)
    }
  }

  const hasChanges =
    selected.size !== tasteIdentityItems.length ||
    tasteIdentityItems.some((t) => !selected.has(t.label))

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
          disabled={saving}
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="profile-list-screen-title">{TASTE_AND_RECOMMENDATIONS_TITLE}</h1>
        <button
          type="button"
          className="profile-list-screen-action"
          onClick={handleSave}
          disabled={saving || !hasChanges}
          aria-busy={saving}
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
      </header>

      <div className="profile-list-screen-body">
        <p className="profile-list-screen-intro">
          Tap to toggle genres and tags that shape your recommendations.
          <span className="profile-taste-selection-count"> {selected.size} selected</span>
        </p>

        <div className="taste-tags profile-taste-tags--edit">
          {tasteIdentityItems.map((g) => {
            const active = selected.has(g.label)
            return (
              <button
                key={g.label}
                type="button"
                className={`taste-tag taste-tag--toggle${active ? ' taste-tag--active' : ''}`}
                aria-pressed={active}
                onClick={() => toggle(g.label)}
                disabled={saving}
              >
                {active ? <Check size={11} aria-hidden /> : null}
                {g.label}
              </button>
            )
          })}
        </div>

        {saveError ? (
          <p className="profile-taste-save-error" role="alert">
            {saveError}
          </p>
        ) : null}
      </div>
    </motion.div>
  )
}

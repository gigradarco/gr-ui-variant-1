import type { ComponentType, ReactNode } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  ChevronRight,
  CreditCard,
  Fingerprint,
  Globe,
  Info,
  MapPin,
  MessageSquare,
  Moon,
  Shield,
  Sun,
  Trash2,
  User,
} from 'lucide-react'
import { postDeleteAccount } from '../../../lib/auth-api'
import { useAppState } from '../../../store/appStore'

type RowIcon = ComponentType<{ size?: number; className?: string }>

function SettingsGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="settings-group">
      <h3 className="settings-group-title">{title}</h3>
      <div className="settings-group-card">{children}</div>
    </div>
  )
}

function SettingsRow({
  icon: Icon,
  label,
  value,
  onClick,
  destructive,
}: {
  icon: RowIcon
  label: string
  value?: string
  onClick?: () => void
  destructive?: boolean
}) {
  const showChevron = onClick != null
  const content = (
    <>
      <span className="settings-row-icon" aria-hidden>
        <Icon size={18} />
      </span>
      <span className="settings-row-label">{label}</span>
      {value != null && <span className="settings-row-value">{value}</span>}
      {showChevron && <ChevronRight size={16} className="settings-row-chevron" aria-hidden />}
    </>
  )

  if (onClick) {
    return (
      <button
        type="button"
        className={`settings-row${destructive ? ' settings-row--destructive' : ''}`}
        onClick={onClick}
      >
        {content}
      </button>
    )
  }

  return <div className="settings-row settings-row--static">{content}</div>
}

export function SettingsScreen() {
   const {
    closeSettings,
    openLanguage,
    openPrivacySafety,
    openFeedback,
    openEditProfile,
    openSubscription,
    returnToLanding,
    theme,
    setTheme,
  } = useAppState()

  const noop = () => {
    window.alert('Demo: connect this row to your flow.')
  }

  const handleDeleteAccount = () => {
    const ok = window.confirm(
      'Delete your Buzo account permanently? Your profile and activity will be removed. This cannot be undone.',
    )
    if (!ok) return
    void (async () => {
      try {
        await postDeleteAccount()
        closeSettings()
        returnToLanding()
        window.location.reload()
      } catch (e) {
        window.alert(e instanceof Error ? e.message : 'Could not delete account. Try again.')
      }
    })()
  }

  return (
    <motion.div
      className="settings-screen"
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', stiffness: 320, damping: 34 }}
    >
      <header className="settings-screen-header">
        <button
          type="button"
          className="settings-screen-back"
          onClick={closeSettings}
          aria-label="Back to profile"
        >
          <ArrowLeft size={18} />
        </button>
        <span className="settings-screen-title">Settings</span>
        <span className="settings-screen-spacer" aria-hidden />
      </header>

      <div className="settings-scroll">
        <SettingsGroup title="Buzo Pro">
          <SettingsRow icon={CreditCard} label="Manage subscription" onClick={openSubscription} />
        </SettingsGroup>

        <SettingsGroup title="Preferences">
          <SettingsRow icon={MapPin} label="Location & gigs near you" onClick={noop} />
          <SettingsRow icon={Fingerprint} label="Taste & recommendations" onClick={noop} />
          <SettingsRow
            icon={theme === 'dark' ? Moon : Sun}
            label="Appearance"
            value={theme === 'dark' ? 'Dark' : 'Light'}
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          />
          <SettingsRow icon={Globe} label="Language" value="English" onClick={openLanguage} />
        </SettingsGroup>

        <SettingsGroup title="Support">
          <SettingsRow icon={Shield} label="Privacy & safety" onClick={openPrivacySafety} />
          <SettingsRow icon={MessageSquare} label="Send feedback" onClick={openFeedback} />
        </SettingsGroup>

        <SettingsGroup title="About">
          <SettingsRow icon={Info} label="App version" value="0.1.0 demo" />
        </SettingsGroup>

        <SettingsGroup title="Account">
          <SettingsRow icon={User} label="Edit profile" onClick={openEditProfile} />
          <SettingsRow
            icon={Trash2}
            label="Delete account"
            destructive
            onClick={handleDeleteAccount}
          />
        </SettingsGroup>
      </div>
    </motion.div>
  )
}

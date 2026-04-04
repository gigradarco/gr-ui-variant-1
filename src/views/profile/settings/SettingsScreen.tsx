import type { ComponentType, ReactNode } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  ChevronRight,
  CreditCard,
  Fingerprint,
  Globe,
  Info,
  LogOut,
  Mail,
  MapPin,
  MessageSquare,
  Shield,
  User,
} from 'lucide-react'
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
}: {
  icon: RowIcon
  label: string
  value?: string
  onClick?: () => void
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
      <button type="button" className="settings-row" onClick={onClick}>
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
    openEmailLogin,
    openEditProfile,
    openSubscription,
  } = useAppState()

  const handleLogout = () => {
    closeSettings()
    window.alert('You’re signed out. (Demo — hook your auth session here.)')
  }

  const noop = () => {
    window.alert('Demo: connect this row to your flow.')
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

        <SettingsGroup title="Account">
          <SettingsRow icon={User} label="Edit profile" onClick={openEditProfile} />
          <SettingsRow icon={Mail} label="Change Email & Login" onClick={openEmailLogin} />
        </SettingsGroup>

        <SettingsGroup title="Preferences">
          <SettingsRow icon={MapPin} label="Location & gigs near you" onClick={noop} />
          <SettingsRow icon={Fingerprint} label="Taste & recommendations" onClick={noop} />
          <SettingsRow icon={Globe} label="Language" value="English" onClick={openLanguage} />
        </SettingsGroup>

        <SettingsGroup title="Support">
          <SettingsRow icon={Shield} label="Privacy & safety" onClick={openPrivacySafety} />
          <SettingsRow icon={MessageSquare} label="Send feedback" onClick={openFeedback} />
        </SettingsGroup>

        <SettingsGroup title="About">
          <SettingsRow icon={Info} label="App version" value="0.1.0 demo" />
        </SettingsGroup>
      </div>

      <div className="settings-footer">
        <button type="button" className="settings-logout-btn" onClick={handleLogout}>
          <LogOut size={18} aria-hidden />
          <span>Log out</span>
        </button>
      </div>
    </motion.div>
  )
}

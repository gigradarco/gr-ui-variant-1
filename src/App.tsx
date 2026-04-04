import { lazy, Suspense, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Moon, Sun, X } from 'lucide-react'
import { events } from './data/demoData'
import { useAppState } from './store/appStore'
import { tabNavItems } from './config/tabNavigation'
import { FeedTab } from './views'
import { BuzzPointsScreen } from './views/profile/BuzzPointsScreen'
import {
  SettingsScreen,
  EditProfileScreen,
  LanguageScreen,
  PrivacySafetyScreen,
  FeedbackScreen,
  EmailLoginScreen,
  SubscriptionScreen,
} from './views/profile/settings'

const ExploreTab = lazy(() =>
  import('./views/explore/ExploreTab').then((m) => ({ default: m.ExploreTab })),
)
const PlanTab = lazy(() =>
  import('./views/plan/PlanTab').then((m) => ({ default: m.PlanTab })),
)
const ProfileTab = lazy(() =>
  import('./views/profile/ProfileTab').then((m) => ({ default: m.ProfileTab })),
)

function App() {
  const {
    tab,
    theme,
    activeEventId,
    showBuzzPoints,
    showSettings,
    showLanguage,
    showPrivacySafety,
    showFeedback,
    showEmailLogin,
    showEditProfile,
    showSubscription,
    setTab,
    setTheme,
    openEvent,
    closeEvent,
  } = useAppState()
  const [explorePrefill, setExplorePrefill] = useState('')

  const activeEvent = useMemo(
    () => events.find((event) => event.id === activeEventId) ?? null,
    [activeEventId],
  )

  return (
    <div className={`app theme-${theme}`}>
      <div className="glow glow-1" />
      <div className="glow glow-2" />

      <main className="phone-shell">
        <header className="topbar">
          <div className="brand-wrap">
            <img
              src="/assets/logo/buzo-app-logo.png"
              alt="Buzo"
              className="brand-logo"
              decoding="async"
              fetchPriority="high"
            />
          </div>
          <div className="actions">
            <button
              className="icon-btn"
              type="button"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </header>

        <section className="screen">
          <Suspense fallback={<div className="tab-suspense-fallback" aria-hidden />}>
            {tab === 'feed' && (
              <FeedTab
                onOpenEvent={openEvent}
                onAsk={(prompt) => {
                  setExplorePrefill(prompt)
                  setTab('explore')
                }}
              />
            )}
            {tab === 'explore' && (
              <ExploreTab
                onOpenEvent={openEvent}
                prefillPrompt={explorePrefill}
                onConsumePrefill={() => setExplorePrefill('')}
              />
            )}
            {tab === 'plan' && <PlanTab onOpenEvent={openEvent} />}
            {tab === 'profile' && <ProfileTab />}
          </Suspense>
        </section>

        <AnimatePresence>
          {showBuzzPoints && <BuzzPointsScreen key="buzz-points" />}
          {showSettings && <SettingsScreen key="settings" />}
          {showEditProfile && <EditProfileScreen key="edit-profile" />}
          {showLanguage && <LanguageScreen key="language" />}
          {showPrivacySafety && <PrivacySafetyScreen key="privacy-safety" />}
          {showFeedback && <FeedbackScreen key="feedback" />}
          {showEmailLogin && <EmailLoginScreen key="email-login" />}
          {showSubscription && <SubscriptionScreen key="subscription" />}
        </AnimatePresence>

        <nav className="bottom-nav" aria-label="Main">
          {tabNavItems.map((item) => {
            const Icon = item.icon
            const isActive = tab === item.key

            return (
              <button
                className={isActive ? 'nav-item active' : 'nav-item'}
                key={item.key}
                type="button"
                onClick={() => setTab(item.key)}
                aria-current={isActive ? 'page' : undefined}
              >
                <span className={item.iconDot ? 'nav-item-icon nav-item-icon--plan' : 'nav-item-icon'}>
                  <Icon size={22} strokeWidth={isActive ? 2.25 : 2} aria-hidden />
                  {item.iconDot ? <span className="nav-item-plan-dot" aria-hidden /> : null}
                </span>
                <span className="nav-item-label">{item.label}</span>
                {isActive ? <span className="nav-item-active-bar" aria-hidden /> : null}
              </button>
            )
          })}
        </nav>
      </main>

      <AnimatePresence>
        {activeEvent && (
          <motion.aside
            className="event-sheet"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.2 }}
          >
            <button className="close" type="button" onClick={closeEvent}>
              <X size={16} />
            </button>
            <img
              src={activeEvent.image}
              alt={activeEvent.title}
              className="sheet-image"
              loading="lazy"
              decoding="async"
            />
            <div className="sheet-content">
              <div className="chip-row">
                <span className="chip live">Live Now</span>
                <span className="chip">{activeEvent.genre}</span>
                <span className="chip verified">{activeEvent.verified} Verified</span>
              </div>
              <h2>{activeEvent.title}</h2>
              <p>
                {activeEvent.venue}, {activeEvent.district} · {activeEvent.time}
              </p>
              <div className="stats-grid">
                <div>
                  <span>Starts</span>
                  <strong>{activeEvent.time}</strong>
                </div>
                <div>
                  <span>Entry</span>
                  <strong>{activeEvent.ticketPrice}</strong>
                </div>
              </div>
              <button type="button" className="cta-full">
                I'm Going
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  )
}

export default App

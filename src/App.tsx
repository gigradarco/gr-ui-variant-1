import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Info, Moon, Sun, X, Zap } from 'lucide-react'
import {
  events,
  getPlanDetailPast,
  getPlanDetailUpcoming,
} from './data/demoData'
import { useAppState } from './store/appStore'
import type { Tab } from './types'
import { PlanEventDetail } from './views/plan/PlanEventDetail'
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
import { WelcomeScreen, SignInSheet } from './views/welcome'

const DiscoverTab = lazy(() =>
  import('./views/discover/DiscoverTab').then((m) => ({ default: m.DiscoverTab })),
)
const PlanTab = lazy(() =>
  import('./views/plan/PlanTab').then((m) => ({ default: m.PlanTab })),
)
const ProfileTab = lazy(() =>
  import('./views/profile/ProfileTab').then((m) => ({ default: m.ProfileTab })),
)

type SheetPlanOverlay =
  | { kind: 'upcoming'; id: string }
  | { kind: 'past'; id: string }

function tabReturnAriaLabel(t: Tab): string {
  switch (t) {
    case 'feed':
      return 'Back to feed'
    case 'discover':
      return 'Back to discover'
    case 'plan':
      return 'Back to plan list'
    case 'profile':
      return 'Back to profile'
  }
}

function App() {
  const {
    tab,
    theme,
    welcomeDismissed,
    showSignIn,
    activeEventId,
    showBuzzPoints,
    showSettings,
    showLanguage,
    showPrivacySafety,
    showFeedback,
    showEmailLogin,
    showEditProfile,
    showSubscription,
    dismissWelcome,
    setTab,
    setTheme,
    openEvent,
    closeEvent,
    requestPlanDetail,
    pendingPlanDetail,
    clearPendingPlanDetail,
    isDiscoverExpanded,
  } = useAppState()
  const [discoverPrefill, setDiscoverPrefill] = useState('')
  const [sheetPlanOverlay, setSheetPlanOverlay] = useState<SheetPlanOverlay | null>(null)
  const [sheetPlanReturnTab, setSheetPlanReturnTab] = useState<Tab | null>(null)

  useEffect(() => {
    if (!pendingPlanDetail) return
    if (pendingPlanDetail.returnTab != null && pendingPlanDetail.returnTab !== 'plan') {
      setSheetPlanOverlay({ kind: pendingPlanDetail.kind, id: pendingPlanDetail.id })
      setSheetPlanReturnTab(pendingPlanDetail.returnTab)
      clearPendingPlanDetail()
    }
  }, [pendingPlanDetail, clearPendingPlanDetail])

  useEffect(() => {
    if (
      !sheetPlanOverlay ||
      sheetPlanReturnTab == null ||
      tab === sheetPlanReturnTab
    ) {
      return
    }
    setSheetPlanOverlay(null)
    setSheetPlanReturnTab(null)
  }, [tab, sheetPlanOverlay, sheetPlanReturnTab])

  const closeSheetPlanOverlay = useCallback(() => {
    setSheetPlanOverlay(null)
    setSheetPlanReturnTab(null)
  }, [])

  const activeEvent = useMemo(
    () => events.find((event) => event.id === activeEventId) ?? null,
    [activeEventId],
  )

  const sheetPlanOverlayBody = useMemo(() => {
    if (!sheetPlanOverlay) return null
    const data =
      sheetPlanOverlay.kind === 'upcoming'
        ? getPlanDetailUpcoming(sheetPlanOverlay.id)
        : getPlanDetailPast(sheetPlanOverlay.id)
    if (!data) {
      return (
        <div className="plan-detail-overlay-fallback screen-content plan-home">
          <p className="plan-home-sub">This event is no longer available.</p>
          <button
            type="button"
            className="plan-segment plan-segment--on"
            onClick={closeSheetPlanOverlay}
          >
            {sheetPlanReturnTab ? tabReturnAriaLabel(sheetPlanReturnTab) : 'Back'}
          </button>
        </div>
      )
    }
    return (
      <PlanEventDetail
        data={data}
        variant={sheetPlanOverlay.kind}
        backAriaLabel={
          sheetPlanReturnTab ? tabReturnAriaLabel(sheetPlanReturnTab) : 'Back'
        }
        onBack={closeSheetPlanOverlay}
        onOpenEvent={openEvent}
      />
    )
  }, [sheetPlanOverlay, sheetPlanReturnTab, closeSheetPlanOverlay, openEvent])

  return (
    <div className={`app theme-${theme}`}>
      <div className="glow glow-1" />
      <div className="glow glow-2" />

      {!welcomeDismissed ? (
        <WelcomeScreen
          onEnterApp={(prefill, initialTab = 'discover') => {
            setDiscoverPrefill(prefill)
            setTab(initialTab)
            dismissWelcome()
          }}
        />
      ) : (
        <main
          className={
            activeEvent
              ? 'phone-shell phone-shell--behind-event-sheet'
              : sheetPlanOverlay
                ? 'phone-shell phone-shell--behind-plan-overlay'
                : tab === 'discover'
                  ? `phone-shell phone-shell--discover ${isDiscoverExpanded ? 'phone-shell--expanded' : ''}`
                  : 'phone-shell'
          }
        >
          <AnimatePresence initial={false}>
            {!isDiscoverExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
                style={{ overflow: 'hidden', flexShrink: 0 }}
              >
                <header className="topbar">
                  <div className="brand-wrap">
                    <img
                      className="brand-logo"
                      src="/assets/logo/b-logo.svg"
                      alt="Buzo"
                      width={34}
                      height={34}
                      decoding="async"
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
              </motion.div>
            )}
          </AnimatePresence>

          <section className="screen">
            <Suspense fallback={<div className="tab-suspense-fallback" aria-hidden />}>
              {tab === 'feed' && (
                <FeedTab
                  onOpenEvent={openEvent}
                  onAsk={(prompt) => {
                    setDiscoverPrefill(prompt)
                    setTab('discover')
                  }}
                />
              )}
              {tab === 'discover' && (
                <DiscoverTab
                  onOpenEvent={openEvent}
                  prefillPrompt={discoverPrefill}
                  onConsumePrefill={() => setDiscoverPrefill('')}
                />
              )}
              {tab === 'plan' && <PlanTab onOpenEvent={openEvent} />}
              {tab === 'profile' && <ProfileTab />}
            </Suspense>
          </section>

          <AnimatePresence>
            {sheetPlanOverlay ? (
              <motion.div
                key="sheet-plan-detail"
                className="plan-detail-overlay"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 14 }}
                transition={{ duration: 0.22 }}
              >
                {sheetPlanOverlayBody}
              </motion.div>
            ) : null}
            {showBuzzPoints && <BuzzPointsScreen key="buzz-points" />}
            {showSettings && <SettingsScreen key="settings" />}
            {showEditProfile && <EditProfileScreen key="edit-profile" />}
            {showLanguage && <LanguageScreen key="language" />}
            {showPrivacySafety && <PrivacySafetyScreen key="privacy-safety" />}
            {showFeedback && <FeedbackScreen key="feedback" />}
            {showEmailLogin && <EmailLoginScreen key="email-login" />}
            {showSubscription && <SubscriptionScreen key="subscription" />}
          </AnimatePresence>

          <AnimatePresence initial={false}>
            {!isDiscoverExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
                style={{ overflow: 'hidden', flexShrink: 0 }}
              >
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
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      )}

      <AnimatePresence>
        {showSignIn ? <SignInSheet key="welcome-sign-in" /> : null}
      </AnimatePresence>

      <AnimatePresence>
        {activeEvent && (
          <motion.aside
            className="event-sheet"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.2 }}
          >
            <div className="event-sheet-hero">
              <img
                src={activeEvent.image}
                alt={activeEvent.title}
                className="sheet-image"
                loading="lazy"
                decoding="async"
              />
              <button
                className="event-sheet-close"
                type="button"
                onClick={closeEvent}
                aria-label="Close event details"
              >
                <X size={18} strokeWidth={2.25} aria-hidden />
              </button>
              {activeEvent.bpReward != null || activeEvent.buzzPct != null ? (
                <div className="feed-wf-badges event-sheet-badges">
                  {activeEvent.bpReward != null ? (
                    <span className="feed-wf-badge feed-wf-badge--bp">
                      +{activeEvent.bpReward} BP
                    </span>
                  ) : null}
                  {activeEvent.buzzPct != null ? (
                    <span className="feed-wf-badge feed-wf-badge--buzz">
                      <Zap size={12} strokeWidth={2.5} aria-hidden />
                      {activeEvent.buzzPct}% BUZZ
                    </span>
                  ) : null}
                </div>
              ) : null}
            </div>
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
              <div className="event-sheet-actions">
                <button type="button" className="event-sheet-cta-primary">
                  I&apos;m Going
                </button>
                <button
                  type="button"
                  className="event-sheet-details-btn"
                  aria-label={`More details for ${activeEvent.title}`}
                  onClick={() => {
                    const id = activeEvent.id
                    closeEvent()
                    requestPlanDetail(id, 'upcoming', tab)
                  }}
                >
                  <Info size={17} strokeWidth={2} aria-hidden />
                  <span>More details</span>
                </button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  )
}

export default App

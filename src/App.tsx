import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Moon, Settings, Sun, X } from 'lucide-react'
import { events } from './demoData'
import { useAppState } from './store/appStore'
import { tabNavItems } from './tabNavigation'
import { ExploreTab, FeedTab, PlanTab, ProfileTab } from './tabs'

function App() {
  const { tab, theme, activeEventId, setTab, setTheme, openEvent, closeEvent } = useAppState()
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
            <img src="/assets/logo/bzzo-transparent.png" alt="Buzo" className="brand-logo" />
          </div>
          <div className="actions">
            {tab === 'profile' ? (
              <button className="icon-btn" type="button" aria-label="Open settings">
                <Settings size={18} />
              </button>
            ) : (
              <button
                className="icon-btn"
                type="button"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            )}
          </div>
        </header>

        <section className="screen">
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
          {tab === 'profile' && <ProfileTab onOpenEvent={openEvent} />}
        </section>

        <nav className="bottom-nav">
          {tabNavItems.map((item) => {
            const Icon = item.icon
            const isActive = tab === item.key

            return (
              <button
                className={isActive ? 'nav-item active' : 'nav-item'}
                key={item.key}
                type="button"
                onClick={() => setTab(item.key)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
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
            <img src={activeEvent.image} alt={activeEvent.title} className="sheet-image" />
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

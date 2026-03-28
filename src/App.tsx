import { useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { create } from 'zustand'
import {
  Compass,
  Flame,
  LocateFixed,
  Search,
  Send,
  Sparkles,
  Ticket,
  User,
  X,
} from 'lucide-react'

type Tab = 'feed' | 'explore' | 'plan' | 'profile'
type Theme = 'dark' | 'light'

type EventItem = {
  id: string
  title: string
  venue: string
  district: string
  time: string
  genre: string
  verified: number
  image: string
  host: string
  hostPrompt: string
  friendsGoing: number
  vibeTags: string[]
  ticketPrice: string
}

type AppState = {
  tab: Tab
  theme: Theme
  activeEventId: string | null
  setTab: (tab: Tab) => void
  setTheme: (theme: Theme) => void
  openEvent: (eventId: string) => void
  closeEvent: () => void
}

const useAppState = create<AppState>((set) => ({
  tab: 'feed',
  theme: 'dark',
  activeEventId: null,
  setTab: (tab) => set({ tab }),
  setTheme: (theme) => set({ theme }),
  openEvent: (eventId) => set({ activeEventId: eventId }),
  closeEvent: () => set({ activeEventId: null }),
}))

const events: EventItem[] = [
  {
    id: 'marquee',
    title: 'Marquee Singapore',
    venue: 'Marquee',
    district: 'Clarke Quay',
    time: '22:30',
    genre: 'Techno',
    verified: 89,
    image:
      'https://images.unsplash.com/photo-1571266028243-d220c9c3b8f8?auto=format&fit=crop&w=1200&q=80',
    host: 'Marcus',
    hostPrompt: 'any techno in Clarke Quay tonight?',
    friendsGoing: 2,
    vibeTags: ['Warehouse', 'Peak Energy'],
    ticketPrice: '$42.00',
  },
  {
    id: 'bluenote',
    title: 'The Blue Note Session',
    venue: 'BeBop Lounge',
    district: 'Tiong Bahru',
    time: '22:00',
    genre: 'Jazz',
    verified: 94,
    image:
      'https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&w=1200&q=80',
    host: 'Sarah Chen',
    hostPrompt: "who's down for some deep house tonight?",
    friendsGoing: 3,
    vibeTags: ['Intimate', 'Vinyl Audio'],
    ticketPrice: '$35.00',
  },
  {
    id: 'neonpulse',
    title: 'Neon Pulse: Architects',
    venue: 'The Obsidian Vault',
    district: 'Downtown Core',
    time: '23:00',
    genre: 'Electronic',
    verified: 92,
    image:
      'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1200&q=80',
    host: 'Alex Chen',
    hostPrompt: 'closing set is supposed to be unreal tonight.',
    friendsGoing: 4,
    vibeTags: ['Live Visuals', 'Hard Groove'],
    ticketPrice: '$45.00',
  },
]

const tabs = [
  { key: 'feed' as const, label: 'Feed', icon: Flame },
  { key: 'explore' as const, label: 'Explore', icon: Compass },
  { key: 'plan' as const, label: 'Plan', icon: Ticket },
  { key: 'profile' as const, label: 'Profile', icon: User },
]

function App() {
  const { tab, theme, activeEventId, setTab, setTheme, openEvent, closeEvent } = useAppState()

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
            <LocateFixed size={18} />
            <span>{tab === 'feed' ? 'Singapore' : 'GigRadar'}</span>
          </div>
          <div className="actions">
            <button
              className="ghost"
              type="button"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? 'Light' : 'Dark'}
            </button>
            <button className="icon-btn" type="button" aria-label="Search">
              <Search size={18} />
            </button>
          </div>
        </header>

        <section className="screen">
          {tab === 'feed' && <FeedScreen onOpenEvent={openEvent} />}
          {tab === 'explore' && <ExploreScreen onOpenEvent={openEvent} />}
          {tab === 'plan' && <PlanScreen onOpenEvent={openEvent} />}
          {tab === 'profile' && <ProfileScreen onOpenEvent={openEvent} />}
        </section>

        <nav className="bottom-nav">
          {tabs.map((item) => {
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

function FeedScreen({ onOpenEvent }: { onOpenEvent: (eventId: string) => void }) {
  return (
    <motion.div
      className="screen-content"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <button className="ask-box" type="button">
        <Sparkles size={16} /> Ask GigRadar for tonight's vibe...
      </button>

      <div className="section-title">Friend Activity</div>

      <div className="card-stack">
        {events.slice(0, 2).map((event) => (
          <article className="event-card" key={event.id}>
            <img src={event.image} alt={event.title} />
            <div className="event-meta">
              <span className="chip">{event.genre}</span>
              <span className="chip verified">{event.verified} Verified</span>
            </div>
            <div className="event-body">
              <p className="quote">
                <strong>{event.host}</strong> "{event.hostPrompt}"
              </p>
              <h3>{event.title}</h3>
              <p>
                {event.district} · {event.time}
              </p>
              <div className="card-row">
                <button className="cta" type="button" onClick={() => onOpenEvent(event.id)}>
                  I'm Going
                </button>
                <span>{event.friendsGoing} friends going</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </motion.div>
  )
}

function ExploreScreen({ onOpenEvent }: { onOpenEvent: (eventId: string) => void }) {
  const event = events[1]

  return (
    <motion.div
      className="screen-content"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="chat-bubble user">any good jazz tonight near Tiong Bahru?</div>
      <div className="chat-bubble bot">
        Tiong Bahru is swinging tonight. I found two spots with high credibility and matching vibe.
      </div>
      <article className="event-card compact">
        <img src={event.image} alt={event.title} />
        <div className="event-meta">
          <span className="chip">Jazz</span>
          <span className="chip verified">94 Verified</span>
        </div>
        <div className="event-body">
          <h3>{event.title}</h3>
          <p>
            {event.venue}, {event.district} · {event.time}
          </p>
          <div className="tags">
            {event.vibeTags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
          <button className="cta-full" type="button" onClick={() => onOpenEvent(event.id)}>
            I'm Going
          </button>
        </div>
      </article>
      <div className="chat-input">
        <input placeholder="Ask GigRadar..." />
        <button type="button">
          <Send size={16} />
        </button>
      </div>
    </motion.div>
  )
}

function PlanScreen({ onOpenEvent }: { onOpenEvent: (eventId: string) => void }) {
  const event = events[2]

  return (
    <motion.div
      className="screen-content"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <article className="event-card compact">
        <img src={event.image} alt={event.title} />
        <div className="event-meta">
          <span className="chip">Neon Pulse</span>
          <span className="chip verified">92 Verified</span>
        </div>
        <div className="event-body">
          <h3>{event.title}</h3>
          <p>
            {event.venue} · Sat, {event.time}
          </p>
          <button className="cta" type="button" onClick={() => onOpenEvent(event.id)}>
            I'm Going
          </button>
        </div>
      </article>

      <section className="squad-box">
        <div className="section-title">The Squad (4)</div>
        <div className="avatars">
          {['Sarah', 'Marcus', 'Jia', 'Daniel'].map((name) => (
            <div key={name} className="avatar-pill">
              <span>{name[0]}</span>
              <small>{name}</small>
            </div>
          ))}
        </div>
      </section>

      <section className="grid-two">
        <div className="planner-card">
          <h4>Arrive by 11:30 PM</h4>
          <p>Avoid queue surge with your group.</p>
        </div>
        <div className="planner-card accent">
          <h4>Pre-book Grab 11:10 PM</h4>
          <p>One tap ride for all friends.</p>
        </div>
      </section>
    </motion.div>
  )
}

function ProfileScreen({ onOpenEvent }: { onOpenEvent: (eventId: string) => void }) {
  return (
    <motion.div
      className="screen-content"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <section className="profile-hero">
        <div className="avatar-xl">AC</div>
        <h2>Alex Chen</h2>
        <p>Hunting for the perfect kick drum in Singapore's underground.</p>
        <div className="stats-row">
          <div>
            <strong>45</strong>
            <span>Gigs</span>
          </div>
          <div>
            <strong>12</strong>
            <span>Cities</span>
          </div>
          <div>
            <strong>1.2k</strong>
            <span>Followers</span>
          </div>
        </div>
      </section>

      <section>
        <div className="section-title">Taste Identity</div>
        <div className="tags">
          {['Techno', 'Melodic House', 'Dark Disco', 'Industrial'].map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      </section>

      <section>
        <div className="section-title">Gig History</div>
        <article className="history-card" onClick={() => onOpenEvent('neonpulse')}>
          <h4>Tale Of Us @ Afterlife</h4>
          <p>The Projector, Singapore · 2d ago</p>
          <span>98 Legendary Night</span>
        </article>
      </section>
    </motion.div>
  )
}

export default App

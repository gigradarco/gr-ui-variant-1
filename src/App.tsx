import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { create } from 'zustand'
import {
  ChevronDown,
  Compass,
  Flame,
  Moon,
  Search,
  Send,
  Settings,
  Sparkles,
  Sun,
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
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
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

const exploreTargetPrompt = 'any good jazz tonight near tiong bahru ?'
const exploreSuggestedPrompts = [
  'any good jazz tonight near Tiong Bahru ?',
  'best techno tonight in Clarke Quay?',
  'who is going to neon pulse tonight?',
]

const feedSuggestedPrompts = [
  'Any good jazz tonight near Tiong Bahru?',
  'Best techno tonight in Clarke Quay?',
  'Rooftop vibes with friends tonight?',
]

const telegramBotLink = 'http://t.me/gigradar123_bot?start=hello'

type ExploreAgentResult = {
  reply: string
  suggestedEventId: string | null
  locationQuery: string | null
}

function normalizePrompt(prompt: string) {
  return prompt
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/\s*\?/g, ' ?')
}

function getHardcodedAgentFallback(prompt: string): ExploreAgentResult {
  const normalizedPrompt = normalizePrompt(prompt)

  if (normalizedPrompt.includes('jazz')) {
    return {
      reply: 'I am running in demo fallback mode. Jazz looks strongest around Tiong Bahru tonight.',
      suggestedEventId: 'bluenote',
      locationQuery: 'Tiong Bahru Singapore',
    }
  }

  if (normalizedPrompt.includes('techno')) {
    return {
      reply: 'I am running in demo fallback mode. Techno momentum is highest around Clarke Quay tonight.',
      suggestedEventId: 'marquee',
      locationQuery: 'Clarke Quay Singapore',
    }
  }

  return {
    reply: 'I am running in demo fallback mode. Neon Pulse is a strong all-round pick for tonight.',
    suggestedEventId: 'neonpulse',
    locationQuery: 'Downtown Core Singapore',
  }
}

async function fetchOpenAIExploreResult(prompt: string): Promise<ExploreAgentResult | null> {
  try {
    const response = await fetch(import.meta.env.VITE_OPENAI_PROXY_URL ?? '/api/openai-recommend', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        events: events.map((event) => ({
          id: event.id,
          title: event.title,
          venue: event.venue,
          district: event.district,
          genre: event.genre,
          time: event.time,
          verified: event.verified,
          vibeTags: event.vibeTags,
        })),
      }),
    })

    if (!response.ok) {
      return null
    }

    const payload = (await response.json()) as Partial<ExploreAgentResult>
    if (typeof payload.reply !== 'string' || !payload.reply.trim()) {
      return null
    }

    return {
      reply: payload.reply.trim(),
      suggestedEventId: typeof payload.suggestedEventId === 'string' ? payload.suggestedEventId : null,
      locationQuery: typeof payload.locationQuery === 'string' ? payload.locationQuery : null,
    }
  } catch {
    return null
  }
}

async function fetchMapboxPlaceName(locationQuery: string): Promise<string | null> {
  try {
    const endpoint = import.meta.env.VITE_MAPBOX_PROXY_URL ?? '/api/mapbox-geocode'
    const separator = endpoint.includes('?') ? '&' : '?'
    const response = await fetch(`${endpoint}${separator}q=${encodeURIComponent(locationQuery)}`)

    if (!response.ok) {
      return null
    }

    const payload = (await response.json()) as { placeName?: unknown }
    return typeof payload.placeName === 'string' && payload.placeName.trim()
      ? payload.placeName.trim()
      : null
  } catch {
    return null
  }
}

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
            <FeedScreen
              onOpenEvent={openEvent}
              onAsk={(prompt) => {
                setExplorePrefill(prompt)
                setTab('explore')
              }}
            />
          )}
          {tab === 'explore' && (
            <ExploreScreen
              onOpenEvent={openEvent}
              prefillPrompt={explorePrefill}
              onConsumePrefill={() => setExplorePrefill('')}
            />
          )}
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

function FeedScreen({
  onOpenEvent,
  onAsk,
}: {
  onOpenEvent: (eventId: string) => void
  onAsk: (prompt: string) => void
}) {
  const [askInput, setAskInput] = useState('')

  const handleAskSearch = () => {
    const prompt = askInput.trim()
    onAsk(prompt)
  }

  const handleFeedSuggestionClick = (prompt: string) => {
    setAskInput(prompt)
    onAsk(prompt)
  }

  return (
    <motion.div
      className="screen-content"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="feed-dropdowns">
        <button className="dropdown-chip" type="button">
          Singapore <ChevronDown size={14} />
        </button>
        <button className="dropdown-chip" type="button">
          Tonight <ChevronDown size={14} />
        </button>
      </div>

      <div className="feed-suggestion-list" aria-label="Suggested prompts">
        {feedSuggestedPrompts.map((prompt) => (
          <button
            key={prompt}
            className="suggestion-chip"
            type="button"
            onClick={() => handleFeedSuggestionClick(prompt)}
          >
            {prompt}
          </button>
        ))}
      </div>

      <div className="ask-box">
        <Sparkles size={16} />
        <input
          placeholder="Ask GigRadar for tonight's vibe..."
          aria-label="Ask GigRadar"
          value={askInput}
          onChange={(event) => setAskInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              handleAskSearch()
            }
          }}
        />
        <button
          className="ask-search-btn"
          type="button"
          aria-label="Search vibe"
          onClick={handleAskSearch}
        >
          <Search size={16} />
        </button>
      </div>

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

function ExploreScreen({
  onOpenEvent,
  prefillPrompt,
  onConsumePrefill,
}: {
  onOpenEvent: (eventId: string) => void
  prefillPrompt: string
  onConsumePrefill: () => void
}) {
  const event = events[1]
  const [inputValue, setInputValue] = useState('')
  const [submittedPrompt, setSubmittedPrompt] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'done'>('idle')
  const [resultMode, setResultMode] = useState<'none' | 'hardcoded' | 'agent'>('none')
  const [agentReply, setAgentReply] = useState('')
  const [agentEventId, setAgentEventId] = useState<string | null>(null)
  const requestCounter = useRef(0)
  const agentEvent = useMemo(
    () => (agentEventId ? events.find((item) => item.id === agentEventId) ?? null : null),
    [agentEventId],
  )

  useEffect(() => {
    if (!prefillPrompt) {
      return
    }

    setInputValue(prefillPrompt)
    setSubmittedPrompt('')
    setStatus('idle')
    setResultMode('none')
    setAgentReply('')
    setAgentEventId(null)
    onConsumePrefill()
  }, [prefillPrompt, onConsumePrefill])

  useEffect(() => {
    if (status !== 'loading' || resultMode !== 'hardcoded') {
      return
    }

    const timer = window.setTimeout(() => {
      setStatus('done')
    }, 2500)

    return () => {
      window.clearTimeout(timer)
    }
  }, [status, resultMode])

  const submitPrompt = async (rawPrompt: string) => {
    const nextPrompt = rawPrompt.trim()

    if (!nextPrompt) {
      return
    }

    const requestId = requestCounter.current + 1
    requestCounter.current = requestId

    setSubmittedPrompt(nextPrompt)
    setAgentReply('')
    setAgentEventId(null)

    if (normalizePrompt(nextPrompt) === exploreTargetPrompt) {
      setResultMode('hardcoded')
      setStatus('loading')
      return
    }

    setResultMode('agent')
    setStatus('loading')

    const resolvedAgentResult =
      (await fetchOpenAIExploreResult(nextPrompt)) ?? getHardcodedAgentFallback(nextPrompt)

    if (requestCounter.current !== requestId) {
      return
    }

    let finalReply = resolvedAgentResult.reply
    if (resolvedAgentResult.locationQuery) {
      const placeName = await fetchMapboxPlaceName(resolvedAgentResult.locationQuery)
      if (requestCounter.current !== requestId) {
        return
      }

      if (placeName) {
        finalReply = `${finalReply} Best match area: ${placeName}.`
      }
    }

    const hasMatchingEvent =
      resolvedAgentResult.suggestedEventId !== null &&
      events.some((item) => item.id === resolvedAgentResult.suggestedEventId)

    setAgentReply(finalReply)
    setAgentEventId(hasMatchingEvent ? resolvedAgentResult.suggestedEventId : null)
    setStatus('done')

    return
  }

  const handleSend = () => {
    void submitPrompt(inputValue)
  }

  return (
    <motion.div
      className="screen-content"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="suggestion-wrap">
        <p>Suggested prompts</p>
        <div className="suggestion-list">
          {exploreSuggestedPrompts.map((prompt) => (
            <button
              key={prompt}
              className="suggestion-chip"
              type="button"
              onClick={() => {
                setInputValue(prompt)
                void submitPrompt(prompt)
              }}
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {submittedPrompt && <div className="chat-bubble user">{submittedPrompt}</div>}

      {status === 'loading' && (
        <div className="chat-bubble bot loading-bubble" aria-label="Agent is typing">
          <div className="typing-loader" role="status" aria-live="polite">
            <span />
            <span />
            <span />
          </div>
        </div>
      )}

      {status === 'done' && resultMode === 'hardcoded' && (
        <>
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
        </>
      )}

      {status === 'done' && resultMode === 'agent' && agentReply && (
        <div className="chat-bubble bot">{agentReply}</div>
      )}

      {status === 'done' && resultMode === 'agent' && agentEvent && (
        <article className="event-card compact">
          <img src={agentEvent.image} alt={agentEvent.title} />
          <div className="event-meta">
            <span className="chip">{agentEvent.genre}</span>
            <span className="chip verified">{agentEvent.verified} Verified</span>
          </div>
          <div className="event-body">
            <h3>{agentEvent.title}</h3>
            <p>
              {agentEvent.venue}, {agentEvent.district} · {agentEvent.time}
            </p>
            <div className="tags">
              {agentEvent.vibeTags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
            <button className="cta-full" type="button" onClick={() => onOpenEvent(agentEvent.id)}>
              I'm Going
            </button>
          </div>
        </article>
      )}

      <div className="explore-actions">
        <div className="chat-input">
          <input
            placeholder="Ask GigRadar..."
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                handleSend()
              }
            }}
          />
          <button type="button" onClick={handleSend}>
            <Send size={16} />
          </button>
        </div>

        <a
          className="telegram-btn"
          href={telegramBotLink}
          target="_blank"
          rel="noreferrer"
          aria-label="Open GigRadar Telegram bot"
        >
          <span className="telegram-btn-copy">
            <strong>Continue in Telegram</strong>
            <small>@gigradar123_bot</small>
          </span>
          <Send size={16} />
        </a>
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

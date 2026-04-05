import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronDown,
  ChevronRight,
  Maximize2,
  Minimize2,
  MoreHorizontal,
  Paperclip,
  Send,
  History,
  Trash2,
  X,
} from 'lucide-react'
import { useAppState } from '../../store/appStore'
import {
  events,
  discoverSuggestedPrompts,
  discoverTargetPrompt,
  telegramBotLink,
} from '../../data/demoData'
import {
  fetchMapboxPlaceName,
  fetchOpenAIDiscoverResult,
  getHardcodedAgentFallback,
  normalizePrompt,
} from './discoverAgent'

const SAMPLE_PLACEHOLDER =
  'Techno in Clarke Quay tonight under $50, credible lineups only'

type DiscoverTabProps = {
  onOpenEvent: (eventId: string) => void
  prefillPrompt: string
  onConsumePrefill: () => void
}

type Conversation = {
  id: string
  prompt: string
  status: 'idle' | 'loading' | 'done'
  resultMode: 'none' | 'hardcoded' | 'agent'
  agentReply: string
  agentEventId: string | null
}

export function DiscoverTab({ onOpenEvent, prefillPrompt, onConsumePrefill }: DiscoverTabProps) {
  const event = events[1]
  const [inputValue, setInputValue] = useState('')
  const [submittedPrompt, setSubmittedPrompt] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'done'>('idle')
  const [resultMode, setResultMode] = useState<'none' | 'hardcoded' | 'agent'>('none')
  const [agentReply, setAgentReply] = useState('')
  const [agentEventId, setAgentEventId] = useState<string | null>(null)
  
  // Chat History State
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [newChatMenuOpen, setNewChatMenuOpen] = useState(false)
  const [discoverMoreOpen, setDiscoverMoreOpen] = useState(false)
  /** Thread-mode composer: user can expand for more visible typing area */
  const [composerExpanded, setComposerExpanded] = useState(false)

  const requestCounter = useRef(0)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const newChatMenuRef = useRef<HTMLDivElement | null>(null)
  const discoverMoreRef = useRef<HTMLDivElement | null>(null)
  const agentEvent = useMemo(
    () => (agentEventId ? events.find((item) => item.id === agentEventId) ?? null : null),
    [agentEventId],
  )

  const { isDiscoverExpanded, toggleDiscoverExpanded } = useAppState()

  // Sync active view back to the current conversation
  useEffect(() => {
    if (!currentConversationId) return
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === currentConversationId
          ? {
              ...conv,
              prompt: submittedPrompt || conv.prompt,
              status,
              resultMode,
              agentReply,
              agentEventId,
            }
          : conv
      )
    )
  }, [submittedPrompt, status, resultMode, agentReply, agentEventId, currentConversationId])

  const handleNewChat = () => {
    setInputValue('')
    setSubmittedPrompt('')
    setStatus('idle')
    setResultMode('none')
    setAgentReply('')
    setAgentEventId(null)
    setCurrentConversationId(null)
    setIsDrawerOpen(false)
    setNewChatMenuOpen(false)
    setDiscoverMoreOpen(false)
    setComposerExpanded(false)
  }

  const handleSelectConversation = (conv: Conversation) => {
    setInputValue('')
    setSubmittedPrompt(conv.prompt)
    setStatus(conv.status)
    setResultMode(conv.resultMode)
    setAgentReply(conv.agentReply)
    setAgentEventId(conv.agentEventId)
    setCurrentConversationId(conv.id)
    setIsDrawerOpen(false)
  }

  const handleDeleteConversation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setConversations((prev) => prev.filter((conv) => conv.id !== id))
    if (currentConversationId === id) {
      handleNewChat()
    }
  }

  useEffect(() => {
    if (!prefillPrompt) {
      return
    }

    handleNewChat()
    setInputValue(prefillPrompt)
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

    let convId = currentConversationId
    if (!convId) {
      convId = Date.now().toString()
      setCurrentConversationId(convId)
      setConversations((prev) => [
        {
          id: convId as string,
          prompt: nextPrompt,
          status: 'loading',
          resultMode: 'none',
          agentReply: '',
          agentEventId: null,
        },
        ...prev,
      ])
    }

    if (normalizePrompt(nextPrompt) === discoverTargetPrompt) {
      setResultMode('hardcoded')
      setStatus('loading')
      return
    }

    setResultMode('agent')
    setStatus('loading')

    const resolvedAgentResult =
      (await fetchOpenAIDiscoverResult(nextPrompt)) ?? getHardcodedAgentFallback(nextPrompt)

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

  const hasThread =
    Boolean(submittedPrompt) ||
    status === 'loading' ||
    (status === 'done' && (resultMode === 'hardcoded' || resultMode === 'agent'))

  const syncTextareaHeight = useCallback(() => {
    const el = textareaRef.current
    if (!el) {
      return
    }

    if (!hasThread && !composerExpanded) {
      el.style.height = ''
      return
    }

    const cs = getComputedStyle(el)
    const lineHeight = parseFloat(cs.lineHeight)
    const padY = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom)

    if (!hasThread && composerExpanded) {
      const minPx = Number.isFinite(lineHeight)
        ? Math.ceil(lineHeight * 4 + padY)
        : 80
      const maxPx = Math.min(window.innerHeight * 0.5, 480)
      el.style.height = 'auto'
      const next = Math.max(minPx, Math.min(el.scrollHeight, maxPx))
      el.style.height = `${next}px`
      return
    }

    if (hasThread) {
      if (composerExpanded) {
        el.style.height = ''
        el.style.minHeight = ''
        return
      }
      const minLines = 2
      const minPx = Number.isFinite(lineHeight)
        ? Math.ceil(lineHeight * minLines + padY)
        : 52
      const maxPx = Math.min(window.innerHeight * 0.34, 140)
      el.style.height = 'auto'
      const next = Math.max(minPx, Math.min(el.scrollHeight, maxPx))
      el.style.height = `${next}px`
    }
  }, [hasThread, inputValue, composerExpanded])

  useLayoutEffect(() => {
    syncTextareaHeight()
  }, [syncTextareaHeight])

  useEffect(() => {
    if (!newChatMenuOpen && !discoverMoreOpen) {
      return
    }

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      const t = e.target
      if (!(t instanceof Node)) {
        return
      }
      if (newChatMenuOpen && newChatMenuRef.current && !newChatMenuRef.current.contains(t)) {
        setNewChatMenuOpen(false)
      }
      if (
        discoverMoreOpen &&
        discoverMoreRef.current &&
        !discoverMoreRef.current.contains(t)
      ) {
        if (t instanceof Element) {
          if (
            t.closest('.discover-drawer-backdrop') ||
            t.closest('.discover-drawer')
          ) {
            return
          }
        }
        setDiscoverMoreOpen(false)
      }
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setNewChatMenuOpen(false)
        setDiscoverMoreOpen(false)
      }
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('touchstart', onPointerDown, { passive: true })
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('touchstart', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [newChatMenuOpen, discoverMoreOpen])

  return (
    <motion.div
      className="discover-tab discover-layla"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="discover-secondary-header">
        <div className="discover-more-row" ref={discoverMoreRef}>
          <button
            className={`icon-btn discover-more-btn${discoverMoreOpen ? ' icon-btn--active' : ''}`}
            type="button"
            aria-expanded={discoverMoreOpen}
            aria-controls="discover-more-panel"
            id="discover-more-trigger"
            aria-label={discoverMoreOpen ? 'Close more options' : 'More options'}
            onClick={() => {
              setNewChatMenuOpen(false)
              setDiscoverMoreOpen((open) => !open)
            }}
          >
            <MoreHorizontal size={20} strokeWidth={2} aria-hidden />
          </button>
          <motion.div
            id="discover-more-panel"
            className="discover-more-panel-clip"
            role="region"
            aria-labelledby="discover-more-trigger"
            aria-hidden={!discoverMoreOpen}
            initial={false}
            animate={{
              maxWidth: discoverMoreOpen ? 120 : 0,
              opacity: discoverMoreOpen ? 1 : 0,
            }}
            transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
            style={{
              overflow: 'hidden',
              pointerEvents: discoverMoreOpen ? 'auto' : 'none',
            }}
          >
            <div className="discover-more-panel-inner">
              <button
                type="button"
                className="icon-btn discover-more-strip-btn"
                onClick={() => {
                  setNewChatMenuOpen(false)
                  toggleDiscoverExpanded()
                }}
                aria-label={isDiscoverExpanded ? 'Show header and footer' : 'Hide header and footer'}
              >
                {isDiscoverExpanded ? <Minimize2 size={18} aria-hidden /> : <Maximize2 size={18} aria-hidden />}
              </button>
              <button
                type="button"
                className="icon-btn discover-more-strip-btn"
                onClick={() => {
                  setNewChatMenuOpen(false)
                  setIsDrawerOpen(true)
                }}
                aria-label="Open chat history"
              >
                <History size={20} aria-hidden />
              </button>
            </div>
          </motion.div>
        </div>
        <div className="discover-secondary-header-actions">
          <div className="discover-new-chat-wrap" ref={newChatMenuRef}>
            <div className="discover-chat-menu-split">
              <button
                className="discover-chat-menu-primary"
                type="button"
                aria-label="Start new chat"
                onClick={() => handleNewChat()}
              >
                <span className="discover-new-chat-label">New chat</span>
              </button>
              <span className="discover-chat-menu-divider" aria-hidden="true" />
              <button
                className="discover-chat-menu-chevron-btn"
                type="button"
                aria-haspopup="menu"
                aria-expanded={newChatMenuOpen}
                aria-controls="discover-chat-menu"
                id="discover-chat-menu-trigger"
                aria-label="More new chat options"
                onClick={() => setNewChatMenuOpen((open) => !open)}
              >
                <ChevronDown size={16} strokeWidth={2.25} className="discover-header-chevron" aria-hidden />
              </button>
            </div>
            {newChatMenuOpen ? (
              <div
                id="discover-chat-menu"
                className="discover-new-chat-menu"
                role="menu"
                aria-labelledby="discover-chat-menu-trigger"
              >
                <a
                  role="menuitem"
                  className="discover-new-chat-menu-item discover-new-chat-menu-item--link"
                  href={telegramBotLink}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setNewChatMenuOpen(false)}
                >
                  <span className="discover-chat-menu-item-row">
                    <span>Start in Telegram</span>
                    <ChevronRight size={16} strokeWidth={2.25} className="discover-header-chevron" aria-hidden />
                  </span>
                </a>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isDrawerOpen && (
          <>
            <motion.div
              className="discover-drawer-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
            />
            <motion.div
              className="discover-drawer"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              <div className="discover-drawer-header">
                <h2>Chat History</h2>
                <button
                  className="icon-btn"
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                >
                  <X size={20} />
                </button>
              </div>
              <div className="discover-drawer-content">
                {conversations.length === 0 ? (
                  <p className="discover-drawer-empty">No past conversations.</p>
                ) : (
                  <ul className="discover-drawer-list">
                    {conversations.map((conv) => (
                      <li
                        key={conv.id}
                        className={`discover-drawer-item ${currentConversationId === conv.id ? 'active' : ''}`}
                        onClick={() => handleSelectConversation(conv)}
                      >
                        <div className="discover-drawer-item-text">
                          {conv.prompt}
                        </div>
                        <button
                          className="discover-drawer-item-delete"
                          type="button"
                          onClick={(e) => handleDeleteConversation(conv.id, e)}
                          aria-label="Delete conversation"
                        >
                          <Trash2 size={16} />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div
        className={
          hasThread ? 'discover-layla-scroll' : 'discover-layla-scroll discover-layla-scroll--empty'
        }
      >
        {hasThread ? (
          <div className="discover-layla-scroll-inner">
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
                  Tiong Bahru is swinging tonight. I found two spots with high credibility and
                  matching vibe.
                </div>
                <article className="event-card compact">
                  <img
                    src={event.image}
                    alt={event.title}
                    loading="lazy"
                    decoding="async"
                  />
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
                <img
                  src={agentEvent.image}
                  alt={agentEvent.title}
                  loading="lazy"
                  decoding="async"
                />
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
                  <button
                    className="cta-full"
                    type="button"
                    onClick={() => onOpenEvent(agentEvent.id)}
                  >
                    I'm Going
                  </button>
                </div>
              </article>
            )}
          </div>
        ) : (
          <div className="discover-layla-empty">
            <h4 className="discover-layla-empty-title">Ask Buzo anything</h4>
            <p className="discover-layla-empty-sub">
              Venues, lineups, areas, or budget — replies show up here.
            </p>
          </div>
        )}
      </div>

      <div className="discover-layla-footer">
        <div className="welcome-layla-prompt-stack discover-layla-prompt-stack">
          <div
            className={[
              'welcome-layla-composer',
              hasThread && 'welcome-layla-composer--compact',
              hasThread && composerExpanded && 'welcome-layla-composer--compact-expanded',
              !hasThread && composerExpanded && 'welcome-layla-composer--expanded',
            ]
              .filter(Boolean)
              .join(' ')}
            role="group"
            aria-label="Describe your night"
          >
            {hasThread && (
              <button
                type="button"
                className="welcome-layla-attach-icon"
                aria-label="Attach"
                onClick={() =>
                  window.alert('Demo: attach a flyer, screenshot, or playlist link here.')
                }
              >
                <Paperclip size={20} strokeWidth={2} aria-hidden />
              </button>
            )}
            <textarea
              ref={textareaRef}
              className="welcome-layla-textarea"
              placeholder={SAMPLE_PLACEHOLDER}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSend()
                }
              }}
              rows={2}
              aria-label="What do you want to do tonight?"
            />
            <div className="welcome-layla-toolbar">
              {!hasThread && (
                <button
                  type="button"
                  className="welcome-layla-attach"
                  onClick={() =>
                    window.alert('Demo: attach a flyer, screenshot, or playlist link here.')
                  }
                >
                  <Paperclip size={17} strokeWidth={2} aria-hidden />
                  <span>Attach</span>
                </button>
              )}
              {!hasThread && <span className="welcome-layla-toolbar-spacer" aria-hidden />}
              <button
                type="button"
                className="welcome-layla-mic welcome-layla-expand-composer"
                aria-label={composerExpanded ? 'Collapse composer' : 'Expand composer'}
                aria-pressed={composerExpanded}
                onClick={() => setComposerExpanded((v) => !v)}
              >
                {composerExpanded ? (
                  <Minimize2 size={18} strokeWidth={2} aria-hidden />
                ) : (
                  <Maximize2 size={18} strokeWidth={2} aria-hidden />
                )}
              </button>
              <button
                type="button"
                className="welcome-layla-send"
                aria-label="Send prompt"
                onClick={handleSend}
              >
                <Send size={18} strokeWidth={2.25} aria-hidden />
              </button>
            </div>
          </div>

          {!hasThread && (
            <div
              className="welcome-chip-scroller welcome-layla-chip-row"
              role="list"
              aria-label="Quick prompts"
            >
              {discoverSuggestedPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  className="welcome-layla-shortcut"
                  role="listitem"
                  onClick={() => {
                    setInputValue(prompt)
                    void submitPrompt(prompt)
                  }}
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

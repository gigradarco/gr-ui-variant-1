import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, Mic, Paperclip, Send, History, Trash2, X, Maximize2, Minimize2 } from 'lucide-react'
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

  const requestCounter = useRef(0)
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

  return (
    <motion.div
      className="discover-tab discover-layla"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="discover-secondary-header">
        <button
          className="icon-btn"
          type="button"
          onClick={() => setIsDrawerOpen(true)}
          aria-label="Open chat history"
        >
          <History size={20} />
        </button>
        <div className="discover-secondary-header-actions">
          <button
            className="discover-new-chat-btn"
            type="button"
            onClick={handleNewChat}
            aria-label="New chat"
          >
            New chat
          </button>
          <button
            className="icon-btn discover-expand-btn"
            type="button"
            onClick={toggleDiscoverExpanded}
            aria-label={isDiscoverExpanded ? "Collapse chat" : "Expand chat"}
          >
            {isDiscoverExpanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
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
            <a
              className="discover-telegram-btn"
              href={telegramBotLink}
              target="_blank"
              rel="noreferrer"
              aria-label="Continue in Telegram — @gigradar123_bot"
            >
              <span className="topbar-telegram-copy">
                <strong>Continue in Telegram</strong>
                <small>@gigradar123_bot</small>
              </span>
              <ChevronRight size={18} strokeWidth={2.25} className="topbar-telegram-chevron" aria-hidden />
            </a>
            <h4 className="discover-layla-empty-title">Ask Buzo anything</h4>
            <p className="discover-layla-empty-sub">
              Venues, lineups, areas, or budget — replies show up here.
            </p>
          </div>
        )}
      </div>

      <div className="discover-layla-footer">
        <div className="welcome-layla-prompt-stack discover-layla-prompt-stack">
          <div className={`welcome-layla-composer ${hasThread ? 'welcome-layla-composer--compact' : ''}`} role="group" aria-label="Describe your night">
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
              rows={hasThread ? 1 : 2}
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
                className="welcome-layla-mic"
                aria-label="Speak your prompt"
                onClick={() => window.alert('Demo: connect speech-to-text here.')}
              >
                <Mic size={20} strokeWidth={2} aria-hidden />
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

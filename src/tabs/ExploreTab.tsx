import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Send } from 'lucide-react'
import {
  events,
  exploreSuggestedPrompts,
  exploreTargetPrompt,
  telegramBotLink,
} from '../demoData'
import {
  fetchMapboxPlaceName,
  fetchOpenAIExploreResult,
  getHardcodedAgentFallback,
  normalizePrompt,
} from '../exploreAgent'

type ExploreTabProps = {
  onOpenEvent: (eventId: string) => void
  prefillPrompt: string
  onConsumePrefill: () => void
}

export function ExploreTab({ onOpenEvent, prefillPrompt, onConsumePrefill }: ExploreTabProps) {
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

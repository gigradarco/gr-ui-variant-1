import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronDown, Search, Sparkles } from 'lucide-react'
import { events, feedSuggestedPrompts } from '../demoData'

type FeedTabProps = {
  onOpenEvent: (eventId: string) => void
  onAsk: (prompt: string) => void
}

export function FeedTab({ onOpenEvent, onAsk }: FeedTabProps) {
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

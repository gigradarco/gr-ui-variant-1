import { useState, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { useAppState } from '../../store/appStore'

export function FeedbackScreen() {
  const { closeFeedback } = useAppState()
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const m = message.trim()
    if (!m) {
      window.alert('Please add a short note so we know what to look at.')
      return
    }
    closeFeedback()
    window.alert('Thanks — your feedback was captured. (Demo: wire to your backend or support tool.)')
    setMessage('')
    setEmail('')
  }

  return (
    <motion.div
      className="feedback-screen"
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', stiffness: 320, damping: 34 }}
    >
      <header className="feedback-screen-header">
        <button
          type="button"
          className="feedback-screen-back"
          onClick={closeFeedback}
          aria-label="Back to settings"
        >
          <ArrowLeft size={18} />
        </button>
        <span className="feedback-screen-title">Send feedback</span>
        <span className="feedback-screen-spacer" aria-hidden />
      </header>

      <div className="feedback-body">
        <p className="feedback-lead">
          Tell us what’s broken, confusing, or missing—screenshots and steps help us fix things faster.
        </p>
        <form className="feedback-form" onSubmit={handleSubmit}>
          <label className="feedback-label" htmlFor="feedback-message">
            Your message
          </label>
          <textarea
            id="feedback-message"
            className="feedback-textarea"
            rows={6}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="What happened? What did you expect?"
            autoComplete="off"
          />
          <label className="feedback-label" htmlFor="feedback-email">
            Contact email <span className="feedback-optional">(optional)</span>
          </label>
          <input
            id="feedback-email"
            className="feedback-input"
            type="email"
            inputMode="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
          />
          <button type="submit" className="feedback-submit">
            Submit feedback
          </button>
        </form>
      </div>
    </motion.div>
  )
}

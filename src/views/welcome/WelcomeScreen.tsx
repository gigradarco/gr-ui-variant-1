import { useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import {
  CalendarCheck,
  ChevronDown,
  Compass,
  Moon,
  Send,
  Sparkles,
  Sun,
  Wallet,
} from 'lucide-react'
import {
  welcomeAllInOneCopy,
  welcomeEveryStepCopy,
  welcomeFinalCtaCopy,
  welcomeIntroShortcuts,
  welcomeLandingFaq,
  welcomeLandingPillars,
  welcomeLandingTestimonials,
  welcomePlaceholderYoutube,
  welcomeSpotlightNights,
  type WelcomeLandingPillar,
} from '../../data/demoData'
import type { Tab } from '../../types'
import { useAppState } from '../../store/appStore'
import { LaylaAttachDropdown } from '../../components/LaylaAttachDropdown'

const SAMPLE_PLACEHOLDER =
  'Techno in Marina Bay tonight under $50, credible lineups only'

function youtubeEmbedSrc(videoId: string) {
  const u = new URL(`https://www.youtube.com/embed/${encodeURIComponent(videoId)}`)
  u.searchParams.set('rel', '0')
  u.searchParams.set('modestbranding', '1')
  // Main youtube.com embed works more reliably than youtube-nocookie in some browsers / previews.
  return u.toString()
}

type WelcomeScreenProps = {
  onEnterApp: (discoverPrefill: string, initialTab?: Tab) => void
}

function WelcomePillarIcon({ icon }: { icon: WelcomeLandingPillar['icon'] }) {
  const props = { size: 20, strokeWidth: 2 as const, 'aria-hidden': true as const }
  switch (icon) {
    case 'sparkles':
      return <Sparkles {...props} />
    case 'wallet':
      return <Wallet {...props} />
    case 'compass':
      return <Compass {...props} />
    case 'calendar':
      return <CalendarCheck {...props} />
  }
}

export function WelcomeScreen({ onEnterApp }: WelcomeScreenProps) {
  const { theme, setTheme, openSignIn } = useAppState()
  const [inputValue, setInputValue] = useState('')
  const discoverMoreRef = useRef<HTMLElement | null>(null)
  const promptStackRef = useRef<HTMLDivElement | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const youtubeEmbedUrl = useMemo(
    () => youtubeEmbedSrc(welcomePlaceholderYoutube.videoId),
    [welcomePlaceholderYoutube.videoId],
  )

  const enterWithPrefill = (prefill: string) => {
    onEnterApp(prefill.trim(), 'discover')
  }

  const submitPrompt = () => {
    enterWithPrefill(inputValue)
  }

  const scrollToDiscoverMore = () => {
    discoverMoreRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const scrollToComposer = () => {
    promptStackRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    window.setTimeout(() => textareaRef.current?.focus(), 380)
  }

  return (
    <div className="welcome-root">
      <header className="welcome-topbar">
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
        <div className="welcome-topbar-actions">
          <button
            type="button"
            className="welcome-text-btn"
            onClick={openSignIn}
          >
            Log in
          </button>
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

      <motion.div
        className="welcome-scroll"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <section className="welcome-layla-stage" aria-label="Plan with Buzo">
          <div className="welcome-hero welcome-hero--layla">
            <p className="welcome-eyebrow welcome-eyebrow--layla">AI nightlife planner</p>
            <h1 className="welcome-headline welcome-headline--layla">
              Your night out.
              <br />
              Planned in minutes.
            </h1>
            <p className="welcome-sub welcome-sub--layla">
              Live lineups, verified venues, and plans you can share when you&apos;re ready.
            </p>
          </div>

          <div ref={promptStackRef} className="welcome-layla-prompt-stack">
            <div className="welcome-layla-composer" role="group" aria-label="Describe your night">
              <textarea
                ref={textareaRef}
                className="welcome-layla-textarea"
                placeholder={SAMPLE_PLACEHOLDER}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    submitPrompt()
                  }
                }}
                rows={3}
                aria-label="What do you want to do tonight?"
              />
              <div className="welcome-layla-toolbar">
                <LaylaAttachDropdown variant="toolbar" />
                <span className="welcome-layla-toolbar-spacer" aria-hidden />
                <button
                  type="button"
                  className="welcome-layla-send"
                  aria-label="Plan with this prompt"
                  onClick={submitPrompt}
                >
                  <Send size={18} strokeWidth={2.25} aria-hidden />
                </button>
              </div>
            </div>

            <div
              className="welcome-chip-scroller welcome-layla-chip-row"
              role="list"
              aria-label="Quick prompts"
            >
              {welcomeIntroShortcuts.map(({ label, prompt }) => (
                <button
                  key={label}
                  type="button"
                  className="welcome-layla-shortcut"
                  role="listitem"
                  onClick={() => enterWithPrefill(prompt)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <button type="button" className="welcome-scroll-hint" onClick={scrollToDiscoverMore}>
            <span>See how I can help you</span>
            <ChevronDown size={18} strokeWidth={2.25} aria-hidden />
          </button>
        </section>

        <div className="welcome-content-column">
          <section className="welcome-video-section" aria-labelledby="welcome-video-heading">
            <h2 id="welcome-video-heading" className="welcome-video-title">
              {welcomePlaceholderYoutube.title}
            </h2>
            <div className="welcome-video-frame">
              <iframe
                title={welcomePlaceholderYoutube.embedTitle}
                src={youtubeEmbedUrl}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>
          </section>

          <section
            ref={discoverMoreRef}
            className="welcome-spotlights welcome-below-fold"
            id="welcome-discover-more"
            aria-labelledby="welcome-spotlights-heading"
          >
            <h2 id="welcome-spotlights-heading" className="welcome-section-title welcome-section-title--large">
              Where to go next
            </h2>
            <div className="welcome-spotlight-list">
              {welcomeSpotlightNights.map((night) => (
                <button
                  key={night.title}
                  type="button"
                  className="welcome-spotlight-card"
                  onClick={() => enterWithPrefill(night.prompt)}
                >
                  <img src={night.image} alt="" className="welcome-spotlight-img" loading="lazy" />
                  <div className="welcome-spotlight-body">
                    <span className="welcome-spotlight-title">{night.title}</span>
                    <span className="welcome-spotlight-sub">{night.subtitle}</span>
                    <span className="welcome-spotlight-cta">Start planning</span>
                  </div>
                </button>
              ))}
            </div>
          </section>

          <section className="welcome-all-in-one" aria-labelledby="welcome-all-in-one-heading">
            <h2 id="welcome-all-in-one-heading" className="welcome-section-headline">
              {welcomeAllInOneCopy.title}
            </h2>
            <p className="welcome-prose">{welcomeAllInOneCopy.body}</p>
            <button type="button" className="welcome-soft-cta" onClick={scrollToComposer}>
              {welcomeAllInOneCopy.ctaLabel}
            </button>
          </section>

          <section className="welcome-every-step" aria-labelledby="welcome-every-step-heading">
            <h2 id="welcome-every-step-heading" className="welcome-section-headline">
              {welcomeEveryStepCopy.title}
            </h2>
            <p className="welcome-every-step-lead">{welcomeEveryStepCopy.lead}</p>
            <div className="welcome-pillars welcome-pillars--layla">
              {welcomeLandingPillars.map((pillar) => (
                <div key={pillar.title} className="welcome-pillar">
                  <span className="welcome-pillar-icon" aria-hidden>
                    <WelcomePillarIcon icon={pillar.icon} />
                  </span>
                  <div>
                    <h3 className="welcome-pillar-title">{pillar.title}</h3>
                    <p className="welcome-pillar-copy welcome-pillar-copy--long">{pillar.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="welcome-testimonials" aria-labelledby="welcome-loves-heading">
            <h2 id="welcome-loves-heading" className="welcome-section-headline">
              What night owls say about Buzo
            </h2>
            <div className="welcome-testimonial-list">
              {welcomeLandingTestimonials.map((t) => (
                <blockquote key={t.name} className="welcome-testimonial-card">
                  <p className="welcome-testimonial-quote">&ldquo;{t.quote}&rdquo;</p>
                  <footer className="welcome-testimonial-meta">
                    <span className="welcome-testimonial-avatar" aria-hidden>
                      {t.initials}
                    </span>
                    <span>
                      <span className="welcome-testimonial-name">{t.name}</span>, {t.age}
                    </span>
                  </footer>
                </blockquote>
              ))}
            </div>
          </section>

          <section className="welcome-faq" aria-labelledby="welcome-faq-heading">
            <h2 id="welcome-faq-heading" className="welcome-section-headline">
              Frequently asked questions
            </h2>
            <div className="welcome-faq-list">
              {welcomeLandingFaq.map((item) => (
                <details key={item.question} className="welcome-faq-item">
                  <summary className="welcome-faq-question">{item.question}</summary>
                  <p className="welcome-faq-answer">{item.answer}</p>
                </details>
              ))}
            </div>
          </section>

          <section className="welcome-final-cta" aria-labelledby="welcome-final-heading">
            <h2 id="welcome-final-heading" className="welcome-section-headline">
              {welcomeFinalCtaCopy.title}
            </h2>
            <p className="welcome-final-lead">{welcomeFinalCtaCopy.body}</p>
            <button type="button" className="welcome-final-cta-btn" onClick={scrollToComposer}>
              {welcomeFinalCtaCopy.ctaLabel}
            </button>
          </section>

          <p className="welcome-footnote">
            Planning is free to try in this demo. Sign in when you want saved taste and plans.
          </p>
        </div>
      </motion.div>
    </div>
  )
}

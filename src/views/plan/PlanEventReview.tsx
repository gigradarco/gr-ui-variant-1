import { useId, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Camera, Gift, Star, Zap } from 'lucide-react'
import { buzzSummary, getBuzzTierState } from '../../data/demoData'
import type { PlanPageEvent } from '../../types'

type PlanEventReviewProps = {
  data: PlanPageEvent
  onBack: () => void
}

const CHECK_IN = 10
const RATED = 15
const REVIEW = 20
const PHOTO = 25

const RATING_SCALE = 10
const RATING_STEPS = Array.from({ length: RATING_SCALE }, (_, i) => i + 1)
const RATING_ICON_SIZE = 16

/** Animated outer border ring for 10/10 vibe or artist (SVG stroke dash, warm glow). */
function PlanReviewRateMaxRing() {
  const hostRef = useRef<HTMLSpanElement>(null)
  const [{ w, h }, setBox] = useState({ w: 0, h: 0 })

  useLayoutEffect(() => {
    const el = hostRef.current
    if (!el) return
    const sync = () => {
      const r = el.getBoundingClientRect()
      setBox({ w: r.width, h: r.height })
    }
    sync()
    const ro = new ResizeObserver(sync)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const strokeW = 2.75
  const pad = strokeW / 2
  const innerW = Math.max(1, w - strokeW)
  const innerH = Math.max(1, h - strokeW)
  const rx = Math.min(19, innerW / 2, innerH / 2)

  return (
    <span ref={hostRef} className="plan-review-rate-max-ring-host" aria-hidden>
      {w >= 10 && h >= 10 ? (
        <svg className="plan-review-rate-max-ring" width={w} height={h}>
          <rect
            className="plan-review-rate-max-ring__dim"
            x={pad}
            y={pad}
            width={innerW}
            height={innerH}
            rx={rx}
            ry={rx}
            pathLength={100}
          />
          <rect
            className="plan-review-rate-max-ring__hot"
            x={pad}
            y={pad}
            width={innerW}
            height={innerH}
            rx={rx}
            ry={rx}
            pathLength={100}
          />
        </svg>
      ) : null}
    </span>
  )
}

/** Forked lightning illustration + spark branches for vibe max (timed to thunder loop). */
function PlanReviewVibeThunderBolts() {
  const gid = useId().replace(/:/g, '')
  const fill = `url(#${gid}-bolt)`
  const sparkStroke = `url(#${gid}-spark)`

  return (
    <div className="plan-review-thunder-bolts" aria-hidden>
      <svg className="plan-review-thunder-bolts-svg" viewBox="0 0 320 56" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id={`${gid}-bolt`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="38%" stopColor="#e0f2fe" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>
          <linearGradient id={`${gid}-spark`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#bae6fd" />
          </linearGradient>
        </defs>
        <g className="plan-review-thunder-bolt plan-review-thunder-bolt--1" transform="translate(4, -4) scale(0.52)">
          <path
            fill={fill}
            d="M16 0L8.5 21.5L13.5 21.5L6 40.5L15.5 29.5L10.5 50L28 22.5L21 22.5L25.5 1.5Z"
          />
        </g>
        <g className="plan-review-thunder-bolt plan-review-thunder-bolt--2" transform="translate(118, 2) scale(0.4)">
          <path
            fill={fill}
            d="M14 0L7 18L12 18L5 33L13 25L9 42L23 19L18 19L20 2Z"
          />
        </g>
        <g className="plan-review-thunder-bolt plan-review-thunder-bolt--3" transform="translate(218, -2) scale(0.48)">
          <path
            fill={fill}
            d="M15 0L9 19L14 19L7.5 36L15 27L11 44L26 21L20 21L23 1Z"
          />
        </g>
        <g className="plan-review-thunder-bolt plan-review-thunder-bolt--4" transform="translate(262, 14) scale(0.34)">
          <path
            fill={fill}
            d="M13 0L7 16L11 16L5 30L12 23L8.5 38L21 18L16 18L19 0Z"
          />
        </g>
        <g className="plan-review-thunder-fork plan-review-thunder-fork--1" transform="translate(72, 8)">
          <path
            fill="none"
            stroke={sparkStroke}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M0 0l-7 14l4 0l-6 18"
          />
        </g>
        <g className="plan-review-thunder-fork plan-review-thunder-fork--2" transform="translate(168, 28)">
          <path
            fill="none"
            stroke={sparkStroke}
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M0 0l8 11l-3 0l5 16"
          />
        </g>
        <g className="plan-review-thunder-fork plan-review-thunder-fork--3" transform="translate(42, 34)">
          <path
            fill="none"
            stroke={sparkStroke}
            strokeWidth="1.65"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M0 0l-5 9l3 0l-4 14"
          />
        </g>
        <g className="plan-review-thunder-fork plan-review-thunder-fork--4" transform="translate(196, 6)">
          <path
            fill="none"
            stroke={sparkStroke}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M0 0l6 8l-2 0l4 13"
          />
        </g>
        <g className="plan-review-thunder-fork plan-review-thunder-fork--5" transform="translate(290, 32)">
          <path
            fill="none"
            stroke={sparkStroke}
            strokeWidth="1.55"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M0 0l-4 10l2 0l-3 12"
          />
        </g>
        <g className="plan-review-thunder-bolt plan-review-thunder-bolt--5" transform="translate(52, 0) scale(0.38)">
          <path
            fill={fill}
            d="M14 0L7.5 17L12 17L5.5 32L13 24L9 40L22 18L17 18L20 1Z"
          />
        </g>
        <g className="plan-review-thunder-bolt plan-review-thunder-bolt--6" transform="translate(132, -2) scale(0.33)">
          <path
            fill={fill}
            d="M13 0L6.5 15L10.5 15L4.5 28L11.5 21L8 35L19 16L15 16L18 0Z"
          />
        </g>
        <g className="plan-review-thunder-fork plan-review-thunder-fork--6" transform="translate(96, 6)">
          <path
            fill="none"
            stroke={sparkStroke}
            strokeWidth="1.85"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M0 0l-6 12l3 0l-5 17"
          />
        </g>
        <g className="plan-review-thunder-fork plan-review-thunder-fork--7" transform="translate(228, 24)">
          <path
            fill="none"
            stroke={sparkStroke}
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M0 0l7 10l-3 0l6 15"
          />
        </g>
        <g className="plan-review-thunder-fork plan-review-thunder-fork--8" transform="translate(24, 22)">
          <path
            fill="none"
            stroke={sparkStroke}
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M0 0l-5 11l3 0l-4 15"
          />
        </g>
      </svg>
    </div>
  )
}

/** `timeRange` on past plan detail is the list when-label (e.g. YESTERDAY, 3 DAYS AGO). */
function formatWhenForRecap(raw: string): string {
  const lower = raw.trim().toLowerCase().replace(/\s+/g, ' ')
  return lower.charAt(0).toUpperCase() + lower.slice(1)
}

function getReviewHeroCopy(timeRange: string): { title: string; eyebrow: string } {
  const key = timeRange.trim().toUpperCase().replace(/\s+/g, ' ')
  const whenPretty = formatWhenForRecap(timeRange)

  if (key === 'YESTERDAY' || key === 'LAST NIGHT') {
    return { title: 'How was last night?',           eyebrow: 'Recap your experience' }
  }
  if (key === 'TODAY' || key === 'TONIGHT') {
    return { title: 'How was tonight?',              eyebrow: 'Recap your experience' }
  }

  const daysMatch = key.match(/^(\d+)\s+DAYS?\s+AGO$/)
  if (daysMatch) {
    const n = Number(daysMatch[1])
    if (n <= 2) {
      return { title: 'How was that night?',        eyebrow: `Recap · ${whenPretty}` }
    }
    if (n <= 7) {
      return { title: 'How was the night out?',     eyebrow: `Recap · ${whenPretty}` }
    }
  }

  if (/\bWEEK\b/.test(key)) {
    return { title: 'How was that night?',          eyebrow: `Recap · ${whenPretty}` }
  }
  if (/\bMONTH\b/.test(key)) {
    return { title: 'Remember this night?',        eyebrow: `Recap · ${whenPretty}` }
  }
  return { title: 'How was the night?',             eyebrow: `Recap · ${whenPretty}` }
}

export function PlanEventReview({ data, onBack }: PlanEventReviewProps) {
  const innerScrollRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const screen = document.querySelector('main.phone-shell section.screen')
    if (screen instanceof HTMLElement) {
      screen.scrollTop = 0
    }
    const inner = innerScrollRef.current
    if (inner) {
      inner.scrollTop = 0
    }
  }, [])

  const [vibe, setVibe] = useState(6)
  const [artistRating, setArtistRating] = useState(10)
  const [recommend, setRecommend] = useState(true)
  const [oneLine, setOneLine] = useState('')
  const [photoAdded, setPhotoAdded] = useState(false)
  const [reviewAcknowledged, setReviewAcknowledged] = useState(false)

  const ratedEarned = vibe > 0 && artistRating > 0
  const reviewEarned = oneLine.trim().length > 0
  const photoEarned = photoAdded

  const { ratedPts, reviewPts, photoPts, totalEarned } = useMemo(() => {
    const r = ratedEarned ? RATED : 0
    const rv = reviewEarned ? REVIEW : 0
    const p = photoEarned ? PHOTO : 0
    return {
      ratedPts: r,
      reviewPts: rv,
      photoPts: p,
      totalEarned: CHECK_IN + r + rv + p,
    }
  }, [ratedEarned, reviewEarned, photoEarned])

  const { current, next, progressToNext, remaining } = getBuzzTierState(buzzSummary.total)

  const heroCopy = useMemo(() => getReviewHeroCopy(data.timeRange), [data.timeRange])

  const eventSubline = `${data.venueLine} · ${data.timeRange}`

  return (
    <div className="screen-content plan-page plan-event-review">
      <header className="plan-toolbar">
        <button
          type="button"
          className="plan-toolbar-btn"
          aria-label="Back to event"
          onClick={onBack}
        >
          <ArrowLeft size={22} strokeWidth={2} />
        </button>
        <p className="plan-toolbar-status plan-toolbar-status--past">Review</p>
        <span className="plan-review-toolbar-spacer" aria-hidden />
      </header>

      <div className="plan-review-scroll" ref={innerScrollRef}>
        <div className="plan-review-hero">
          <h1 className="plan-review-title">{heroCopy.title}</h1>
          <p className="plan-review-eyebrow">{heroCopy.eyebrow}</p>
        </div>

        <div className="plan-review-event-card">
          <img
            src={data.heroImage}
            alt=""
            className="plan-review-event-thumb"
            decoding="async"
          />
          <div className="plan-review-event-text">
            <h2 className="plan-review-event-name">{data.displayTitle}</h2>
            <p className="plan-review-event-meta">{eventSubline}</p>
          </div>
        </div>

        <div
          className={
            'plan-review-rate-card plan-review-rate-card--ten' +
            (vibe === RATING_SCALE ? ' plan-review-rate-card--vibe-max' : '')
          }
        >
          {vibe === RATING_SCALE ? <PlanReviewRateMaxRing /> : null}
          {vibe === RATING_SCALE ? <PlanReviewVibeThunderBolts /> : null}
          <span className="plan-review-rate-label">Vibe?</span>
          <div
            className="plan-review-stars plan-review-stars--zap plan-review-stars--ten"
            role="group"
            aria-label={`Vibe rating, ${RATING_SCALE} point scale`}
          >
            {RATING_STEPS.map((n) => (
              <button
                key={n}
                type="button"
                className={`plan-review-icon-btn plan-review-icon-btn--ten${n <= vibe ? ' plan-review-icon-btn--on' : ''}`}
                onClick={() => setVibe(n)}
                aria-label={`${n} of ${RATING_SCALE} vibe`}
              >
                <Zap
                  size={RATING_ICON_SIZE}
                  strokeWidth={2}
                  fill={n <= vibe ? 'currentColor' : 'none'}
                  aria-hidden
                />
              </button>
            ))}
          </div>
        </div>

        <div
          className={
            'plan-review-rate-card plan-review-rate-card--ten' +
            (artistRating === RATING_SCALE ? ' plan-review-rate-card--artist-max' : '')
          }
        >
          {artistRating === RATING_SCALE ? <PlanReviewRateMaxRing /> : null}
          {artistRating === RATING_SCALE ? (
            <div className="plan-review-starfield" aria-hidden>
              <span className="plan-review-meteor plan-review-meteor--1" />
              <span className="plan-review-meteor plan-review-meteor--2" />
              <span className="plan-review-meteor plan-review-meteor--3" />
              <span className="plan-review-meteor plan-review-meteor--4" />
              <span className="plan-review-meteor plan-review-meteor--5" />
              <span className="plan-review-meteor plan-review-meteor--6" />
              <span className="plan-review-meteor plan-review-meteor--7" />
              <span className="plan-review-meteor plan-review-meteor--8" />
              <span className="plan-review-meteor plan-review-meteor--9" />
              <span className="plan-review-spark plan-review-spark--1" />
              <span className="plan-review-spark plan-review-spark--2" />
              <span className="plan-review-spark plan-review-spark--3" />
              <span className="plan-review-spark plan-review-spark--4" />
              <span className="plan-review-spark plan-review-spark--5" />
            </div>
          ) : null}
          <span className="plan-review-rate-label">Artist?</span>
          <div
            className="plan-review-stars plan-review-stars--ten"
            role="group"
            aria-label={`Artist rating, ${RATING_SCALE} point scale`}
          >
            {RATING_STEPS.map((n) => (
              <button
                key={n}
                type="button"
                className={`plan-review-icon-btn plan-review-icon-btn--ten${n <= artistRating ? ' plan-review-icon-btn--on' : ''}`}
                onClick={() => setArtistRating(n)}
                aria-label={`${n} of ${RATING_SCALE} stars`}
              >
                <Star
                  size={RATING_ICON_SIZE}
                  strokeWidth={2}
                  fill={n <= artistRating ? 'currentColor' : 'none'}
                  aria-hidden
                />
              </button>
            ))}
          </div>
        </div>

        <div className="plan-review-rate-card plan-review-rate-card--seg">
          <span className="plan-review-rate-label">Recommend?</span>
          <div className="plan-review-seg" role="group" aria-label="Recommend to friends">
            <button
              type="button"
              className={recommend ? 'plan-review-seg-btn plan-review-seg-btn--on' : 'plan-review-seg-btn'}
              onClick={() => setRecommend(true)}
              aria-pressed={recommend}
            >
              Yes
            </button>
            <button
              type="button"
              className={!recommend ? 'plan-review-seg-btn plan-review-seg-btn--on' : 'plan-review-seg-btn'}
              onClick={() => setRecommend(false)}
              aria-pressed={!recommend}
            >
              No
            </button>
          </div>
        </div>

        <div className="plan-review-field">
          <label className="plan-review-field-label" htmlFor="plan-review-one-line">
            Describe it in one line.
          </label>
          <input
            id="plan-review-one-line"
            className="plan-review-input"
            type="text"
            maxLength={120}
            placeholder="It was legendary..."
            value={oneLine}
            onChange={(e) => setOneLine(e.target.value)}
            autoComplete="off"
          />
        </div>

        <button
          type="button"
          className={`plan-review-photo-drop${photoEarned ? ' plan-review-photo-drop--on' : ''}`}
          onClick={() => setPhotoAdded((v) => !v)}
          aria-pressed={photoEarned}
        >
          <Camera size={28} strokeWidth={1.75} aria-hidden />
          <span className="plan-review-photo-label">
            {photoEarned ? 'Photo added' : 'Add a moment'}
          </span>
          <span className="plan-review-photo-hint">
            {photoEarned ? 'Tap to remove' : 'Optional · +25 buzz'}
          </span>
        </button>

        <section className="plan-review-buzz" aria-labelledby="plan-review-buzz-heading">
          <Gift className="plan-review-buzz-watermark" size={120} strokeWidth={1} aria-hidden />
          <h2 id="plan-review-buzz-heading" className="plan-review-buzz-title">
            Buzz points earned
          </h2>
          <ul className="plan-review-buzz-lines">
            <li>
              <span>Check-in</span>
              <span className="plan-review-buzz-pts">+{CHECK_IN}</span>
            </li>
            <li>
              <span>Rated</span>
              <span className={ratedEarned ? 'plan-review-buzz-pts' : 'plan-review-buzz-pts plan-review-buzz-pts--muted'}>
                +{ratedPts}
              </span>
            </li>
            <li>
              <span>Review</span>
              <span className={reviewEarned ? 'plan-review-buzz-pts' : 'plan-review-buzz-pts plan-review-buzz-pts--muted'}>
                +{reviewPts}
              </span>
            </li>
            <li>
              <span>Photo</span>
              <span className={photoEarned ? 'plan-review-buzz-pts' : 'plan-review-buzz-pts plan-review-buzz-pts--muted'}>
                +{photoPts}
              </span>
            </li>
          </ul>
          <p className="plan-review-buzz-total">
            Total <strong>{totalEarned}</strong> points from this recap
          </p>
          <div className="plan-review-level">
            <p className="plan-review-level-row">
              <span className="plan-review-level-muted">Current level:</span>{' '}
              <span className="plan-review-level-accent">{current.label}</span>
            </p>
            {next ? (
              <p className="plan-review-level-row">
                <span className="plan-review-level-accent">
                  {remaining.toLocaleString()} points to {next.label}
                </span>
              </p>
            ) : null}
            <div className="plan-review-progress">
              <div
                className="plan-review-progress-fill"
                style={{ width: `${Math.round(progressToNext * 100)}%` }}
              />
            </div>
          </div>
        </section>

        <button
          type="button"
          className={
            'plan-review-submit' + (reviewAcknowledged ? ' plan-review-submit--acknowledged' : '')
          }
          disabled={reviewAcknowledged}
          onClick={() => {
            if (!reviewAcknowledged) setReviewAcknowledged(true)
          }}
        >
          <span aria-live="polite">
            {reviewAcknowledged ? 'Thank you for reviewing' : 'Finish review'}
          </span>
          {!reviewAcknowledged ? (
            <ArrowRight size={20} strokeWidth={2.25} aria-hidden />
          ) : null}
        </button>
      </div>
    </div>
  )
}

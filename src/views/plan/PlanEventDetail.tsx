import { useMemo, useState } from 'react'
import {
  ArrowLeft,
  Clock,
  Heart,
  MapPin,
  Play,
  Share2,
  ShieldCheck,
} from 'lucide-react'
import type { PlanPageEvent } from '../../types'

type PlanEventDetailProps = {
  data: PlanPageEvent
  variant: 'upcoming' | 'past'
  onBack: () => void
  onOpenEvent: (eventId: string) => void
  /** Past events only: opens post-event review flow. */
  onOpenReview?: () => void
}

const waveformHeights = [
  14, 32, 22, 40, 18, 36, 26, 44, 20, 38, 16, 42, 24, 34, 30, 48, 12, 28, 36, 22, 40, 18,
]

export function PlanEventDetail({
  data,
  variant,
  onBack,
  onOpenEvent,
  onOpenReview,
}: PlanEventDetailProps) {
  const [favorited, setFavorited] = useState(false)
  const [playing, setPlaying] = useState(false)

  const elitePreview = useMemo(
    () =>
      [
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
        'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=120&q=80',
        'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&q=80',
      ] as const,
    [],
  )

  return (
    <div className="screen-content plan-page plan-event-detail">
      <header className="plan-toolbar">
        <button
          type="button"
          className="plan-toolbar-btn"
          aria-label="Back to plan list"
          onClick={onBack}
        >
          <ArrowLeft size={22} strokeWidth={2} />
        </button>
        <p
          className={`plan-toolbar-status plan-toolbar-status--${variant}`}
          role="status"
        >
          {variant === 'upcoming' ? 'Upcoming' : 'Past'}
        </p>
        <button
          type="button"
          className="plan-toolbar-btn"
          aria-label={favorited ? 'Remove favorite' : 'Save event'}
          aria-pressed={favorited}
          onClick={() => setFavorited((v) => !v)}
        >
          <Heart
            size={20}
            strokeWidth={2}
            className={favorited ? 'plan-heart--on' : undefined}
            fill={favorited ? 'currentColor' : 'none'}
          />
        </button>
      </header>

      <div className="plan-main">
        <div className="plan-hero">
          <img
            className="plan-hero-img"
            src={data.heroImage}
            alt=""
            decoding="async"
          />
          <div className="plan-hero-scrim" aria-hidden />
          <div className="plan-hero-content">
            <div className="plan-hero-tags">
              <span className="plan-hero-tag">{data.genreTags[0]}</span>
              <span className="plan-hero-tag">{data.genreTags[1]}</span>
            </div>
            <h1 className="plan-hero-title">{data.displayTitle}</h1>
            <p className="plan-hero-artist">{data.artistLine}</p>
            <div className="plan-hero-meta">
              <span className="plan-hero-meta-row">
                <MapPin size={14} strokeWidth={2} aria-hidden />
                {data.venueLine}
              </span>
              <span className="plan-hero-meta-row">
                <Clock size={14} strokeWidth={2} aria-hidden />
                {data.timeRange}
              </span>
            </div>
          </div>
        </div>

        <div className="plan-body">
          <div className="plan-stat-row">
            <div className="plan-stat-card plan-stat-card--vibe">
              <span className="plan-stat-label">AI VIBE SCORE</span>
              <div className="plan-vibe-score">
                <span className="plan-vibe-num">{data.aiVibeScore.toFixed(1)}</span>
                <span className="plan-vibe-denom">/10</span>
              </div>
            </div>
            <div className="plan-stat-card plan-stat-card--elite">
              <div className="plan-elite-faces">
                {elitePreview.map((src, i) => (
                  <span key={i} className="plan-elite-face" style={{ zIndex: 3 - i }}>
                    <img src={src} alt="" decoding="async" />
                  </span>
                ))}
                <span
                  className="plan-elite-face plan-elite-face--more"
                  style={{ zIndex: 0 }}
                  aria-label={`${data.eliteStackExtra} more`}
                >
                  +{data.eliteStackExtra}
                </span>
              </div>
              <p className="plan-elite-quote">
                &ldquo;verified by {data.eliteVerifiedCount} people who were there&rdquo;
              </p>
              <div className="plan-elite-foot">
                <ShieldCheck size={14} strokeWidth={2.5} aria-hidden />
                <span>ELITE REVIEWS</span>
              </div>
            </div>
          </div>

          <section className="plan-section">
            <h2 className="plan-section-kicker">The Experience</h2>
            <p className="plan-copy">
              {data.experienceParts.before}
              <em className="plan-copy-accent">{data.experienceParts.emphasis}</em>
              {data.experienceParts.after}
            </p>
          </section>

          <div className="plan-audio">
            <button
              type="button"
              className="plan-audio-play"
              aria-pressed={playing}
              aria-label={playing ? 'Pause preview' : 'Play preview'}
              onClick={() => setPlaying((p) => !p)}
              disabled={variant === 'past'}
            >
              <Play size={22} fill="currentColor" aria-hidden />
            </button>
            <div className="plan-audio-mid">
              <div className="plan-wave" aria-hidden>
                {waveformHeights.map((h, i) => (
                  <span
                    key={i}
                    className={`plan-wave-bar${playing && i < 9 ? ' plan-wave-bar--hot' : ''}`}
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
              <div className="plan-audio-labels">
                <span className="plan-audio-track">{data.audioPreviewLabel}</span>
                <span className="plan-audio-time">
                  {data.audioCurrent} / {data.audioTotal}
                </span>
              </div>
            </div>
          </div>

          {data.friendsAttendingCount > 0 ? (
            <section className="plan-section plan-whos">
              <div className="plan-whos-head">
                <h2 className="plan-whos-title">WHO&apos;S GOING</h2>
                <span className="plan-whos-count">
                  +{data.friendsAttendingCount} FRIENDS ATTENDING
                </span>
              </div>
              <div className="plan-friends-row">
                {data.friends.map((f) => (
                  <div key={f.id} className="plan-friend">
                    <div
                      className={
                        f.ring
                          ? 'plan-friend-avatar plan-friend-avatar--ring'
                          : 'plan-friend-avatar'
                      }
                    >
                      <img src={f.avatar} alt="" decoding="async" />
                    </div>
                    <span className="plan-friend-name">{f.name}</span>
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </div>

      <div className="plan-cta-rail">
        {variant === 'upcoming' ? (
          <button
            type="button"
            className="plan-cta-primary"
            onClick={() => onOpenEvent(data.eventId)}
          >
            I&apos;M GOING
          </button>
        ) : (
          <button type="button" className="plan-cta-primary plan-cta-primary--disabled" disabled>
            EVENT ENDED
          </button>
        )}
        <button
          type="button"
          className="plan-cta-review"
          disabled={variant === 'upcoming'}
          aria-label={
            variant === 'upcoming'
              ? 'Event review unlocks after the event'
              : 'Write an event review'
          }
          onClick={() => onOpenReview?.()}
        >
          EVENT REVIEW
        </button>
        <button type="button" className="plan-cta-secondary">
          <Share2 size={18} strokeWidth={2} aria-hidden />
          SHARE WITH FRIENDS
        </button>
      </div>
    </div>
  )
}

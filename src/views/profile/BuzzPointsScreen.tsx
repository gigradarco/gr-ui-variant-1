import { motion } from 'framer-motion'
import { ArrowLeft, Check, Crown, Info, Lock } from 'lucide-react'
import { buzzActivities, buzzSummary, buzzTiers, getBuzzTierState } from '../../data/demoData'
import { useAppState } from '../../store/appStore'

function formatBuzz(n: number) {
  return n.toLocaleString('en-US')
}

function formatTierThreshold(n: number) {
  if (n === 0) return '0'
  if (n % 1000 === 0) return `${n / 1000}k`
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k`
  return formatBuzz(n)
}

const TIER_COPY: Record<string, { streak: string }> = {
  first_in: { streak: 'New to the app · save spots and build your night stack' },
  on_the_floor: { streak: 'You’re going out · better drop alerts and check-in buzz' },
  scene_regular: { streak: 'Known in the scene · guestlist nudges and venue boosts' },
  front_row: { streak: 'Always there for the big night · sold-out heads-ups, review bonuses' },
  afters: { streak: 'Midnight Sun energy · crew boosts and late, late picks' },
  sunrise: { streak: 'Closed the venue energy · top perks, full story, crew legend status' },
}

export function BuzzPointsScreen() {
  const { closeBuzzPoints } = useAppState()
  const total = buzzSummary.total
  const {
    currentIndex,
    current,
    next,
    nextGoal,
    progressToNext,
    remaining,
    pctToNext,
  } = getBuzzTierState(total)

  const tierNotes = TIER_COPY[current.id] ?? TIER_COPY.scene_regular

  return (
    <motion.div
      className="buzz-screen buzz-screen--vip"
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', stiffness: 320, damping: 34 }}
    >
      <header className="buzz-screen-header buzz-screen-header--vip">
        <button
          type="button"
          className="buzz-screen-back buzz-screen-back--vip"
          onClick={closeBuzzPoints}
          aria-label="Back to profile"
        >
          <ArrowLeft size={18} />
        </button>
        <span className="buzz-screen-title buzz-screen-title--vip">Scene levels</span>
        <span className="buzz-screen-spacer" aria-hidden />
      </header>

      <div className="buzz-scroll buzz-scroll--vip">
        <section
          className="buzz-vip-hero"
          data-tier={current.metal}
          aria-labelledby="buzz-vip-lv-heading"
        >
          <div className="buzz-vip-hero-shine" aria-hidden />
          <div className="buzz-vip-hero-top">
            <span className="buzz-vip-eyebrow">
              <Crown size={13} strokeWidth={2.5} aria-hidden />
              Your tier
            </span>
            <span className="buzz-vip-chip">Live</span>
          </div>
          <p id="buzz-vip-lv-heading" className="buzz-vip-hero-lv">
            Lv.{current.level}
          </p>
          <p className="buzz-vip-hero-name">{current.label}</p>
          <p className="buzz-vip-hero-tagline">{tierNotes.streak}</p>

          <div className="buzz-vip-balance-block">
            <span className="buzz-vip-balance-label">Buzz balance</span>
            <p className="buzz-vip-balance-value">
              <span className="buzz-vip-balance-num">{formatBuzz(total)}</span>
              <span className="buzz-vip-balance-unit">pts</span>
            </p>
          </div>

          {next != null && (
            <div className="buzz-vip-progress">
              <div className="buzz-vip-progress-head">
                <span>Next · Lv.{next.level} {next.label}</span>
                <span className="buzz-vip-progress-pct">{pctToNext}%</span>
              </div>
              <div
                className="buzz-vip-progress-track"
                role="progressbar"
                aria-valuemin={current.minPoints}
                aria-valuemax={nextGoal}
                aria-valuenow={total}
                aria-label={`Progress toward ${next.label}, ${pctToNext} percent`}
              >
                <div
                  className="buzz-vip-progress-fill"
                  style={{ width: `${Math.round(progressToNext * 100)}%` }}
                />
              </div>
              <p className="buzz-vip-progress-foot">
                <strong>{formatBuzz(remaining)}</strong> pts to unlock · threshold{' '}
                <strong>{formatBuzz(nextGoal)}</strong>
              </p>
            </div>
          )}
          {next == null && (
            <p className="buzz-vip-max">Top scene level — Sunrise unlocked.</p>
          )}
        </section>

        <section className="buzz-level-deck" aria-labelledby="buzz-deck-title">
          <div className="buzz-level-deck-head">
            <h2 id="buzz-deck-title" className="buzz-level-deck-title">
              The ladder
            </h2>
            <p className="buzz-level-deck-sub">Swipe · six levels from first night to closing time</p>
          </div>
          <div className="buzz-level-deck-scroll">
            {buzzTiers.map((tierDef, index) => {
              const isCurrent = index === currentIndex
              const isPast = index < currentIndex
              const isFuture = index > currentIndex

              return (
                <div
                  key={tierDef.id}
                  className={`buzz-level-card buzz-level-card--${tierDef.metal}${
                    isCurrent ? ' buzz-level-card--current' : ''
                  }${isPast ? ' buzz-level-card--past' : ''}${
                    isFuture ? ' buzz-level-card--future' : ''
                  }`}
                  data-tier={tierDef.metal}
                >
                  <div className="buzz-level-card-shine" aria-hidden />
                  <div className="buzz-level-card-top">
                    <span className="buzz-level-card-lv">Lv.{tierDef.level}</span>
                    {isPast && (
                      <Check className="buzz-level-card-icon" size={14} strokeWidth={2.8} aria-hidden />
                    )}
                    {isFuture && (
                      <Lock className="buzz-level-card-icon" size={13} strokeWidth={2.5} aria-hidden />
                    )}
                    {isCurrent && <span className="buzz-level-card-live">Now</span>}
                  </div>
                  <span className="buzz-level-card-name">{tierDef.label}</span>
                  <span className="buzz-level-card-pts">
                    {formatTierThreshold(tierDef.minPoints)} pts
                  </span>
                </div>
              )
            })}
          </div>
        </section>

        <div className="buzz-info-banner buzz-info-banner--vip">
          <Info size={16} aria-hidden className="buzz-info-icon" />
          <p>
            Buzz moves you up the ladder: bigger nights, sharper tips, and more love from the
            scene. Earn from check-ins, reviews, invites, and streaks—totals update after each
            event.
          </p>
        </div>

        <section className="buzz-section" aria-labelledby="buzz-activity-heading">
          <h2 id="buzz-activity-heading" className="buzz-section-title buzz-section-title--vip">
            Point history
          </h2>
          <div className="buzz-activity-card buzz-activity-card--vip">
            {buzzActivities.map((row, i) => (
              <div
                key={row.id}
                className={`buzz-activity-row${i < buzzActivities.length - 1 ? ' buzz-activity-row--border' : ''}`}
              >
                <div className="buzz-activity-main">
                  <span className="buzz-activity-title">{row.title}</span>
                  {row.subtitle != null && row.subtitle !== '' && (
                    <span className="buzz-activity-sub">{row.subtitle}</span>
                  )}
                </div>
                <div className="buzz-activity-meta">
                  <span
                    className={`buzz-activity-delta${row.points < 0 ? ' buzz-activity-delta--neg' : ''}`}
                  >
                    {row.points > 0 ? '+' : ''}
                    {formatBuzz(row.points)}
                  </span>
                  <span className="buzz-activity-when">{row.when}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </motion.div>
  )
}

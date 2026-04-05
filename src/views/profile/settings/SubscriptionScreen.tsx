import type { KeyboardEvent } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Check, ChevronRight, Minus, Sparkles, Ticket } from 'lucide-react'
import { BUZO_PRO_MONTHLY_PRICE_DISPLAY } from '../../../config/pricing'
import { useAppState } from '../../../store/appStore'

const PLAN_COMPARE_ROWS: { label: string; basic: boolean; pro: boolean }[] = [
  { label: 'Discover & join public gigs near you', basic: true, pro: true },
  { label: 'Smarter recommendations based on your taste', basic: false, pro: true },
  { label: 'Early access to hot gigs & drops near you', basic: false, pro: true },
  { label: 'Ad-free home and discover', basic: false, pro: true },
]

export function SubscriptionScreen() {
  const { closeSubscription, subscriptionTier, setSubscriptionTier } = useAppState()
  const isBasicTier = subscriptionTier === 'basic'
  const isProTier = subscriptionTier === 'pro'

  const stub = () => {
    window.alert('Demo: connect RevenueCat, Stripe, or the native store billing flow.')
  }

  const onPlanKeyDown = (tier: 'basic' | 'pro', e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setSubscriptionTier(tier)
    }
  }

  return (
    <motion.div
      className="subscription-screen"
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', stiffness: 320, damping: 34 }}
    >
      <header className="subscription-screen-header">
        <button
          type="button"
          className="subscription-screen-back"
          onClick={closeSubscription}
          aria-label="Back to settings"
        >
          <ArrowLeft size={18} />
        </button>
        <span className="subscription-screen-title">Subscription</span>
        <span className="subscription-screen-spacer" aria-hidden />
      </header>

      <div className="subscription-body">
        <div className="subscription-plan-cards">
          <div
            role="button"
            tabIndex={0}
            className={[
              'subscription-plan-card',
              isBasicTier ? 'subscription-plan-card--current-basic' : 'subscription-plan-card--inactive',
            ].join(' ')}
            aria-current={isBasicTier ? true : undefined}
            aria-label="Buzo Basic. Tap to show this plan."
            onClick={() => setSubscriptionTier('basic')}
            onKeyDown={(e) => onPlanKeyDown('basic', e)}
          >
            <span
              className={[
                'subscription-plan-icon',
                isBasicTier ? 'subscription-plan-icon--current-basic' : 'subscription-plan-icon--muted',
              ].join(' ')}
              aria-hidden
            >
              <Ticket size={22} strokeWidth={2} />
            </span>
            <div className="subscription-plan-row">
              <h2
                className={[
                  'subscription-plan-name',
                  !isBasicTier ? 'subscription-plan-name--basic' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                Buzo Basic
              </h2>
              {isBasicTier ? (
                <span className="subscription-plan-status subscription-plan-status--basic">Active</span>
              ) : null}
            </div>
            <p
              className={[
                'subscription-plan-price',
                !isBasicTier ? 'subscription-plan-price--basic' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              Free
            </p>
            <p className="subscription-plan-renew">Core discovery & public gigs</p>
          </div>
          <div
            role="button"
            tabIndex={0}
            className={[
              'subscription-plan-card',
              isProTier ? 'subscription-plan-card--current' : 'subscription-plan-card--inactive',
            ].join(' ')}
            aria-current={isProTier ? true : undefined}
            aria-label="Buzo Pro. Tap to show this plan."
            onClick={() => setSubscriptionTier('pro')}
            onKeyDown={(e) => onPlanKeyDown('pro', e)}
          >
            <span
              className={[
                'subscription-plan-icon',
                !isProTier ? 'subscription-plan-icon--muted' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              aria-hidden
            >
              <Sparkles size={22} strokeWidth={2} />
            </span>
            <div className="subscription-plan-row">
              <h2
                className={[
                  'subscription-plan-name',
                  !isProTier ? 'subscription-plan-name--basic' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                Buzo Pro
              </h2>
              {isProTier ? <span className="subscription-plan-status">Active</span> : null}
            </div>
            <p
              className={[
                'subscription-plan-price',
                !isProTier ? 'subscription-plan-price--basic' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {BUZO_PRO_MONTHLY_PRICE_DISPLAY}
            </p>
            <p className="subscription-plan-renew">
              {isProTier ? 'Renews April 12, 2026' : 'Upgrade anytime'}
            </p>
          </div>
        </div>

        <section className="subscription-section">
          <h3 className="subscription-section-title">Basic vs Pro</h3>
          <div className="subscription-compare" role="table" aria-label="Plan comparison">
            <div className="subscription-compare-head" role="row">
              <span className="subscription-compare-feature-heading" role="columnheader">
                Benefit
              </span>
              <span
                className={[
                  'subscription-compare-plan-head',
                  'subscription-compare-plan-head--basic',
                  isBasicTier ? 'subscription-compare-plan-head--accent-basic' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                role="columnheader"
              >
                Basic
              </span>
              <span
                className={[
                  'subscription-compare-plan-head',
                  'subscription-compare-plan-head--pro',
                  isProTier ? 'subscription-compare-plan-head--accent-pro' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                role="columnheader"
              >
                Pro
              </span>
            </div>
            {PLAN_COMPARE_ROWS.map((row) => (
              <div key={row.label} className="subscription-compare-row" role="row">
                <span className="subscription-compare-feature" role="cell">
                  {row.label}
                </span>
                <span
                  className={[
                    'subscription-compare-cell',
                    isBasicTier ? 'subscription-compare-cell--accent-basic' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  role="cell"
                  aria-label={row.basic ? 'Included on Basic' : 'Not included on Basic'}
                >
                  {row.basic ? (
                    <Check size={16} strokeWidth={2.5} className="subscription-compare-yes" aria-hidden />
                  ) : (
                    <Minus size={16} strokeWidth={2} className="subscription-compare-no" aria-hidden />
                  )}
                </span>
                <span
                  className={[
                    'subscription-compare-cell',
                    isProTier ? 'subscription-compare-cell--accent-pro' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  role="cell"
                  aria-label={row.pro ? 'Included on Pro' : 'Not included on Pro'}
                >
                  {row.pro ? (
                    <Check size={16} strokeWidth={2.5} className="subscription-compare-yes" aria-hidden />
                  ) : (
                    <Minus size={16} strokeWidth={2} className="subscription-compare-no" aria-hidden />
                  )}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="subscription-section">
          <h3 className="subscription-section-title">Manage</h3>
          <div className="subscription-card">
            <button type="button" className="subscription-row" onClick={stub}>
              <span>Change payment method</span>
              <ChevronRight size={16} className="subscription-row-chevron" aria-hidden />
            </button>
            <button type="button" className="subscription-row" onClick={stub}>
              <span>Billing history</span>
              <ChevronRight size={16} className="subscription-row-chevron" aria-hidden />
            </button>
          </div>
        </section>

        <p className="subscription-footnote">
          {isProTier ? (
            <>
              Cancel anytime from your store subscription settings. You keep Pro features until the end of
              the current period.
            </>
          ) : (
            <>
              You are on Buzo Basic. Upgrade to Pro anytime for ad-free browsing, early access, and smarter
              recommendations.
            </>
          )}
        </p>

        {isProTier ? (
          <div className="subscription-card subscription-card--solo">
            <button
              type="button"
              className="subscription-row subscription-row--danger"
              onClick={stub}
            >
              <span>Cancel subscription</span>
              <ChevronRight size={16} className="subscription-row-chevron" aria-hidden />
            </button>
          </div>
        ) : null}
      </div>
    </motion.div>
  )
}

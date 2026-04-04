import { motion } from 'framer-motion'
import { ArrowLeft, ChevronRight, Sparkles } from 'lucide-react'
import { useAppState } from '../../../store/appStore'

const PERKS = [
  'Early access to hot gigs & drops near you',
  'Ad-free home and explore',
  'Smarter recommendations based on your taste',
]

export function SubscriptionScreen() {
  const { closeSubscription } = useAppState()

  const stub = () => {
    window.alert('Demo: connect RevenueCat, Stripe, or the native store billing flow.')
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
        <div className="subscription-plan-card">
          <span className="subscription-plan-icon" aria-hidden>
            <Sparkles size={22} strokeWidth={2} />
          </span>
          <div className="subscription-plan-row">
            <h2 className="subscription-plan-name">Buzo Pro</h2>
            <span className="subscription-plan-status">Active</span>
          </div>
          <p className="subscription-plan-price">$4.99 / month</p>
          <p className="subscription-plan-renew">Renews April 12, 2026</p>
        </div>

        <section className="subscription-section">
          <h3 className="subscription-section-title">Included with Pro</h3>
          <ul className="subscription-perk-list">
            {PERKS.map((line) => (
              <li key={line} className="subscription-perk">
                {line}
              </li>
            ))}
          </ul>
        </section>

        <section className="subscription-section">
          <h3 className="subscription-section-title">Manage</h3>
          <div className="subscription-card">
            <button type="button" className="subscription-row" onClick={stub}>
              <span>Change plan</span>
              <ChevronRight size={16} className="subscription-row-chevron" aria-hidden />
            </button>
            <button type="button" className="subscription-row" onClick={stub}>
              <span>Payment method</span>
              <ChevronRight size={16} className="subscription-row-chevron" aria-hidden />
            </button>
            <button type="button" className="subscription-row" onClick={stub}>
              <span>Billing history</span>
              <ChevronRight size={16} className="subscription-row-chevron" aria-hidden />
            </button>
            <button type="button" className="subscription-row" onClick={stub}>
              <span>Restore purchases</span>
              <ChevronRight size={16} className="subscription-row-chevron" aria-hidden />
            </button>
          </div>
        </section>

        <p className="subscription-footnote">
          Cancel anytime from your store subscription settings. You keep Pro features until the end of the
          current period.
        </p>

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
      </div>
    </motion.div>
  )
}

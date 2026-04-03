import { useRef } from 'react'
import { motion } from 'framer-motion'
import { useVirtualizer } from '@tanstack/react-virtual'
import { ArrowLeft } from 'lucide-react'
import { gigHistory } from '../demoData'
import { useAppState } from '../store/appStore'
import type { GigEntry } from '../types'

function GigRow({ gig, isLast }: { gig: GigEntry; isLast: boolean }) {
  return (
    <div className="gig-history-entry" data-gig-row>
      <div className="gig-timeline">
        <div className={`gig-dot${gig.attended ? ' gig-dot--attended' : ''}`}>
          <svg width="6" height="5" viewBox="0 0 10 8" fill="none">
            <path
              d="M1 4L3.5 6.5L9 1"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        {!isLast && <div className="gig-line" />}
      </div>
      <div className="gig-history-info">
        <div className="gig-header-row">
          <h4 className="gig-venue">{gig.venue}</h4>
          <span className="gig-when">{gig.when}</span>
        </div>
        <p className="gig-desc">{gig.description}</p>
        {gig.images.length > 0 && (
          <div className="gig-thumbs">
            {gig.images.map((src, i) => (
              <img
                key={i}
                src={src}
                alt=""
                className="gig-thumb"
                referrerPolicy="no-referrer"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export function GigHistoryScreen() {
  const { closeGigHistory } = useAppState()
  const scrollRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: gigHistory.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: (i) => (gigHistory[i].images.length > 0 ? 180 : 100),
    overscan: 5,
  })

  return (
    <motion.div
      className="gig-history-screen"
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', stiffness: 320, damping: 34 }}
    >
      <header className="gig-history-screen-header">
        <button
          type="button"
          className="gig-history-back"
          onClick={closeGigHistory}
          aria-label="Back to profile"
        >
          <ArrowLeft size={18} />
        </button>
        <span className="gig-history-screen-title">Gig History</span>
        <span className="gig-history-count">{gigHistory.length} gigs</span>
      </header>

      <div className="gig-history-scroll" ref={scrollRef}>
        <div
          style={{
            height: virtualizer.getTotalSize(),
            width: '100%',
            position: 'relative',
          }}
        >
          {virtualizer.getVirtualItems().map((vItem) => {
            const gig = gigHistory[vItem.index]
            return (
              <div
                key={vItem.key}
                data-index={vItem.index}
                ref={virtualizer.measureElement}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  transform: `translateY(${vItem.start}px)`,
                }}
              >
                <GigRow gig={gig} isLast={vItem.index === gigHistory.length - 1} />
              </div>
            )
          })}
        </div>
      </div>
    </motion.div>
  )
}

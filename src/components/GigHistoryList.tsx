import type { GigEntry } from '../types'

type Props = {
  items: GigEntry[]
  /** When true the last item still renders a connecting line (used in virtualised list where more rows follow) */
  hasMore?: boolean
}

export function GigHistoryList({ items, hasMore = false }: Props) {
  return (
    <div className="gig-history-list">
      {items.map((gig, idx) => {
        const isLast = idx === items.length - 1
        return (
          <div key={gig.id} className="gig-history-entry">
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
              {(!isLast || hasMore) && <div className="gig-line" />}
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
      })}
    </div>
  )
}

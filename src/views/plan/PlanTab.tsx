import { useState } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Clock } from 'lucide-react'
import {
  events,
  getPlanDetailPast,
  getPlanDetailUpcoming,
  planPastEvents,
} from '../../data/demoData'
import { PlanEventDetail } from './PlanEventDetail'

type PlanTabProps = {
  onOpenEvent: (eventId: string) => void
}

type DetailRoute =
  | { kind: 'upcoming'; id: string }
  | { kind: 'past'; id: string }

export function PlanTab({ onOpenEvent }: PlanTabProps) {
  const [segment, setSegment] = useState<'upcoming' | 'past'>('upcoming')
  const [detail, setDetail] = useState<DetailRoute | null>(null)

  if (detail) {
    const data =
      detail.kind === 'upcoming'
        ? getPlanDetailUpcoming(detail.id)
        : getPlanDetailPast(detail.id)

    if (!data) {
      return (
        <motion.div
          className="screen-content plan-home"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className="plan-home-sub">This event is no longer available.</p>
          <button type="button" className="plan-segment plan-segment--on" onClick={() => setDetail(null)}>
            Back to plan
          </button>
        </motion.div>
      )
    }

    return (
      <PlanEventDetail
        data={data}
        variant={detail.kind}
        onBack={() => setDetail(null)}
        onOpenEvent={onOpenEvent}
      />
    )
  }

  return (
    <motion.div
      className="screen-content plan-home"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <header className="plan-home-header">
        <h1 className="plan-home-title">Plan</h1>
        <p className="plan-home-sub">Upcoming nights and where you&apos;ve been.</p>
      </header>

      <div className="plan-segments" role="tablist" aria-label="Plan lists">
        <button
          type="button"
          role="tab"
          aria-selected={segment === 'upcoming'}
          className={segment === 'upcoming' ? 'plan-segment plan-segment--on' : 'plan-segment'}
          onClick={() => setSegment('upcoming')}
        >
          Upcoming
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={segment === 'past'}
          className={segment === 'past' ? 'plan-segment plan-segment--on' : 'plan-segment'}
          onClick={() => setSegment('past')}
        >
          Past
        </button>
      </div>

      <div className="plan-list" role="tabpanel">
        {segment === 'upcoming'
          ? events.map((ev) => (
              <button
                type="button"
                key={ev.id}
                className="plan-list-card"
                onClick={() => setDetail({ kind: 'upcoming', id: ev.id })}
              >
                <img src={ev.image} alt="" className="plan-list-card-img" decoding="async" />
                <div className="plan-list-card-body">
                  <span className="plan-list-card-label">{ev.genre}</span>
                  <h2 className="plan-list-card-title">{ev.title}</h2>
                  <p className="plan-list-card-meta">
                    <MapPin size={13} aria-hidden />
                    {ev.venue}, {ev.district}
                  </p>
                  <p className="plan-list-card-meta">
                    <Clock size={13} aria-hidden />
                    {ev.time}
                    {ev.ticketPrice ? ` · ${ev.ticketPrice}` : ''}
                  </p>
                </div>
              </button>
            ))
          : planPastEvents.map((p) => (
              <button
                type="button"
                key={p.id}
                className="plan-list-card plan-list-card--past"
                onClick={() => setDetail({ kind: 'past', id: p.id })}
              >
                <img src={p.image} alt="" className="plan-list-card-img" decoding="async" />
                <div className="plan-list-card-body">
                  <span className="plan-list-card-label plan-list-card-label--past">{p.whenLabel}</span>
                  <h2 className="plan-list-card-title">{p.title}</h2>
                  <p className="plan-list-card-meta">
                    <MapPin size={13} aria-hidden />
                    {p.venue}
                  </p>
                </div>
              </button>
            ))}
      </div>
    </motion.div>
  )
}

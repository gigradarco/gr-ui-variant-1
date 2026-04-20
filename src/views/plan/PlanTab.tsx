import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowUpRight, Clock, MapPin } from 'lucide-react'
import {
  events,
  getPlanDetailPast,
  getPlanDetailUpcoming,
  planPastEvents,
} from '../../data/demoData'
import { useAppState, type FavoriteEvent } from '../../store/appStore'
import type { Tab } from '../../types'
import { PlanEventDetail } from './PlanEventDetail'
import { PlanExploreEvents } from './PlanExploreEvents'
import { PlanExploreEventsDetail, type PlanExploreDetailFocus } from './PlanExploreEventsDetail'
import { PlanEventReview } from './PlanEventReview'

type PlanTabProps = {
  onOpenEvent: (eventId: string) => void
}

type DetailRoute =
  | { kind: 'upcoming'; id: string }
  | { kind: 'past'; id: string }

function tabReturnAriaLabel(t: Tab): string {
  switch (t) {
    case 'feed':
      return 'Back to feed'
    case 'discover':
      return 'Back to discover'
    case 'favorites':
      return 'Back to saved events'
    case 'plan':
      return 'Back to plan list'
    case 'profile':
      return 'Back to profile'
  }
}

export function PlanTab({ onOpenEvent }: PlanTabProps) {
  const pendingPlanDetail = useAppState((s) => s.pendingPlanDetail)
  const clearPendingPlanDetail = useAppState((s) => s.clearPendingPlanDetail)
  const setTab = useAppState((s) => s.setTab)
  const toggleFavoriteEvent = useAppState((s) => s.toggleFavoriteEvent)
  const isEventFavorited = useAppState((s) => s.isEventFavorited)

  const [segment, setSegment] = useState<'upcoming' | 'past'>('upcoming')
  const [detail, setDetail] = useState<DetailRoute | null>(null)
  const [detailReturnTab, setDetailReturnTab] = useState<Tab | null>(null)
  const [reviewPastId, setReviewPastId] = useState<string | null>(null)
  const [exploreEventsOpen, setExploreEventsOpen] = useState(false)
  const [exploreDetailFocus, setExploreDetailFocus] = useState<PlanExploreDetailFocus | null>(null)

  const exitEventDetail = () => {
    setReviewPastId(null)
    setDetail(null)
    const go = detailReturnTab
    setDetailReturnTab(null)
    if (go) setTab(go)
  }

  const toFavoriteEvent = (
    id: string,
    kind: 'upcoming' | 'past',
    data: ReturnType<typeof getPlanDetailUpcoming> | ReturnType<typeof getPlanDetailPast>,
  ): FavoriteEvent => ({
    id,
    title: data?.displayTitle ?? 'Event',
    venueLine: data?.venueLine ?? '',
    timeLabel: data?.timeRange ?? '',
    image: data?.heroImage ?? '',
    variant: kind,
  })

  useEffect(() => {
    if (!pendingPlanDetail) return
    // Feed / Explore / Profile: App shows full detail as an overlay; tab stays put.
    if (pendingPlanDetail.returnTab != null && pendingPlanDetail.returnTab !== 'plan') return
    setDetail({ kind: pendingPlanDetail.kind, id: pendingPlanDetail.id })
    setSegment(pendingPlanDetail.kind === 'past' ? 'past' : 'upcoming')
    setDetailReturnTab(pendingPlanDetail.returnTab ?? null)
    clearPendingPlanDetail()
  }, [pendingPlanDetail, clearPendingPlanDetail])

  if (exploreEventsOpen) {
    if (exploreDetailFocus) {
      return (
        <PlanExploreEventsDetail
          focus={exploreDetailFocus}
          onBack={() => setExploreDetailFocus(null)}
          onOpenEvent={onOpenEvent}
        />
      )
    }
    return (
      <PlanExploreEvents
        onBack={() => {
          setExploreEventsOpen(false)
          setExploreDetailFocus(null)
        }}
        onSelectCategory={(id) => setExploreDetailFocus({ type: 'category', id })}
        onSelectCity={(id) => setExploreDetailFocus({ type: 'city', id })}
      />
    )
  }

  if (reviewPastId) {
    const reviewData = getPlanDetailPast(reviewPastId)
    if (!reviewData) {
      return (
        <div className="screen-content plan-home">
          <p className="plan-home-sub">This event is no longer available.</p>
          <button type="button" className="plan-segment plan-segment--on" onClick={() => setReviewPastId(null)}>
            Back to plan
          </button>
        </div>
      )
    }
    return (
      <PlanEventReview
        data={reviewData}
        onBack={() => setReviewPastId(null)}
      />
    )
  }

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
          <button type="button" className="plan-segment plan-segment--on" onClick={exitEventDetail}>
            {detailReturnTab ? tabReturnAriaLabel(detailReturnTab) : 'Back to plan'}
          </button>
        </motion.div>
      )
    }

    return (
      <PlanEventDetail
        data={data}
        variant={detail.kind}
        backAriaLabel={
          detailReturnTab ? tabReturnAriaLabel(detailReturnTab) : 'Back to plan list'
        }
        onBack={exitEventDetail}
        onOpenEvent={onOpenEvent}
        isFavorited={isEventFavorited(data.eventId)}
        onToggleFavorite={() =>
          toggleFavoriteEvent(toFavoriteEvent(data.eventId, detail.kind, data))
        }
        onOpenReview={detail.kind === 'past' ? () => setReviewPastId(detail.id) : undefined}
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
        <div className="plan-home-header-row">
          <h1 className="plan-home-title">Plan</h1>
          <button
            type="button"
            className="plan-home-explore-events"
            onClick={() => {
              setExploreDetailFocus(null)
              setExploreEventsOpen(true)
            }}
          >
            <span>Explore Events</span>
            <ArrowUpRight size={15} strokeWidth={2} className="plan-home-explore-events-icon" aria-hidden />
          </button>
        </div>
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
                onClick={() => {
                  setDetailReturnTab(null)
                  setDetail({ kind: 'upcoming', id: ev.id })
                }}
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
                onClick={() => {
                  setDetailReturnTab(null)
                  setDetail({ kind: 'past', id: p.id })
                }}
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

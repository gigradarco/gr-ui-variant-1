import { motion } from 'framer-motion'
import { events } from '../demoData'

type PlanTabProps = {
  onOpenEvent: (eventId: string) => void
}

export function PlanTab({ onOpenEvent }: PlanTabProps) {
  const event = events[2]

  return (
    <motion.div
      className="screen-content"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <article className="event-card compact">
        <img src={event.image} alt={event.title} />
        <div className="event-meta">
          <span className="chip">Neon Pulse</span>
          <span className="chip verified">92 Verified</span>
        </div>
        <div className="event-body">
          <h3>{event.title}</h3>
          <p>
            {event.venue} · Sat, {event.time}
          </p>
          <button className="cta" type="button" onClick={() => onOpenEvent(event.id)}>
            I'm Going
          </button>
        </div>
      </article>

      <section className="squad-box">
        <div className="section-title">The Squad (4)</div>
        <div className="avatars">
          {['Sarah', 'Marcus', 'Jia', 'Daniel'].map((name) => (
            <div key={name} className="avatar-pill">
              <span>{name[0]}</span>
              <small>{name}</small>
            </div>
          ))}
        </div>
      </section>

      <section className="grid-two">
        <div className="planner-card">
          <h4>Arrive by 11:30 PM</h4>
          <p>Avoid queue surge with your group.</p>
        </div>
        <div className="planner-card accent">
          <h4>Pre-book Grab 11:10 PM</h4>
          <p>One tap ride for all friends.</p>
        </div>
      </section>
    </motion.div>
  )
}

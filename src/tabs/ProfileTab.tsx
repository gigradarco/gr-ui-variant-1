import { motion } from 'framer-motion'

type ProfileTabProps = {
  onOpenEvent: (eventId: string) => void
}

export function ProfileTab({ onOpenEvent }: ProfileTabProps) {
  return (
    <motion.div
      className="screen-content"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <section className="profile-hero">
        <div className="avatar-xl">AC</div>
        <h2>Alex Chen</h2>
        <p>Hunting for the perfect kick drum in Singapore's underground.</p>
        <div className="stats-row">
          <div>
            <strong>45</strong>
            <span>Gigs</span>
          </div>
          <div>
            <strong>12</strong>
            <span>Cities</span>
          </div>
          <div>
            <strong>1.2k</strong>
            <span>Followers</span>
          </div>
        </div>
      </section>

      <section>
        <div className="section-title">Taste Identity</div>
        <div className="tags">
          {['Techno', 'Melodic House', 'Dark Disco', 'Industrial'].map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      </section>

      <section>
        <div className="section-title">Gig History</div>
        <article className="history-card" onClick={() => onOpenEvent('neonpulse')}>
          <h4>Tale Of Us @ Afterlife</h4>
          <p>The Projector, Singapore · 2d ago</p>
          <span>98 Legendary Night</span>
        </article>
      </section>
    </motion.div>
  )
}

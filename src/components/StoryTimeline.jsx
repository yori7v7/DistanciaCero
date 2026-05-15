import SectionTitle from './SectionTitle'
import { CalendarHeart } from 'lucide-react'

function StoryTimeline({ timeline }) {
  return (
    <section className="section" id="historia">
      <SectionTitle
        eyebrow="Nuestra historia"
        title="Pequeños momentos, enorme significado"
        text="Aquí iremos guardando recuerdos importantes de Ale & Yori."
      />

      <div className="timeline">
        {timeline.map((item) => (
          <div className="timeline-item fade-up" key={item.id}>
            <div className="timeline-icon">
              <CalendarHeart size={22} />
            </div>

            <div className="timeline-content">
              <span>{item.date}</span>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default StoryTimeline

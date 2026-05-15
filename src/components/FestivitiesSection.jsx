import SectionTitle from './SectionTitle'
import { PartyPopper, Star } from 'lucide-react'

function FestivitiesSection({ festivities }) {
  return (
    <section className="section" id="festividades">
      <SectionTitle
        eyebrow="Festividades"
        title="Eventos especiales para decorar el universo"
        text="Aquí puedes preparar versiones especiales para Navidad, Año Nuevo, cumpleaños, aniversario, San Valentín y más."
      />

      <div className="festivity-grid">
        {festivities.map((event) => (
          <article className="festivity-card fade-up" key={event.id}>
            <div className="festivity-icon">
              <PartyPopper size={24} />
            </div>

            <h3>{event.title}</h3>
            <p>{event.description}</p>

            <div className="festivity-tag">
              <Star size={15} />
              <span>{event.status}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export default FestivitiesSection
import SectionTitle from './SectionTitle'
import { Play, Sparkles } from 'lucide-react'

function MomentsSection(props) {
  const baseItems = props.items || props.moments || props.memories || props.videos || []

  const items = [
    ...baseItems,
    {
      id: 'soon-moment',
      title: 'Próximamente',
      description: 'Este espacio queda listo para guardar otro momento bonito que luego merezca repetirse.',
      date: 'Pendiente',
      label: 'Nuevo recuerdo',
      isPlaceholder: true
    }
  ]

  return (
    <section className="section" id="momentos">
      <SectionTitle
        eyebrow="Momentos"
        title="Momentos que merecen repetirse"
        text="Pequeños recuerdos, videítos o detalles que valga la pena volver a mirar."
      />

      <div className="universe-grid universe-grid-4">
        {items.map((item) => (
          <article
            className={`universe-card universe-memory-card fade-up ${item.isPlaceholder ? 'coming-soon-card coming-soon-moment' : ''}`}
            key={item.id}
          >
            <div className="memory-thumb">
              {item.isPlaceholder ? <Sparkles size={28} /> : <Play size={28} />}
            </div>

            <div className="memory-meta">
              <span>{item.date || item.label || 'Recuerdo'}</span>
            </div>

            <h3>{item.title || item.name}</h3>
            <p>{item.description || item.text}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

export default MomentsSection
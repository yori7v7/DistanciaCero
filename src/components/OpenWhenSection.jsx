import SectionTitle from './SectionTitle'
import { Lock } from 'lucide-react'

function OpenWhenSection({ cards = [] }) {
  const finalCards = cards.map((card) => {
    if (card.mood === 'Abrir cuando sea un día especial') {
      return {
        ...card,
        title: 'Próximamente',
        preview: 'Este espacio queda reservado para una futura cartita especial.'
      }
    }

    return card
  })

  return (
    <section className="section" id="abrir-cuando">
      <SectionTitle
        eyebrow="Abrir cuando..."
        title="Cartitas para momentos específicos"
        text="Cada cartita tendrá su propia página sencilla cuando esté lista."
      />

      <div className="card-grid">
        {finalCards.map((card) => (
          <article className="mini-card open-card locked fade-up" key={card.id}>
            <div className="card-top">
              <span>{card.mood}</span>
              <Lock size={20} />
            </div>

            <h3>{card.title}</h3>
            <p>{card.preview}</p>

            <button className="ghost-button" type="button" disabled>
              {'Próximamente'}
            </button>
          </article>
        ))}
      </div>
    </section>
  )
}

export default OpenWhenSection
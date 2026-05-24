import { useState } from 'react'
import SectionTitle from './SectionTitle'
import { Lock, ChevronLeft, Check, BookOpen } from 'lucide-react'

function OpenWhenSection({ cards = [] }) {
  const [selectedCardId, setSelectedCardId] = useState(null)

  const finalCards = cards.map((card) => {
    if (card.mood === 'Abrir cuando sea un día especial') {
      return {
        ...card,
        title: 'Próximamente',
        preview: 'Este espacio queda reservado para una futura cartita especial.',
        locked: true
      }
    }
    return card
  })

  const openCard = (card) => {
    if (card.locked) return

    const storageKey = `distancia-cero-open-when-${card.id}`
    localStorage.setItem(storageKey, 'opened')
    setSelectedCardId(card.id)

    // Scroll suave al inicio de la sección
    setTimeout(() => {
      const section = document.getElementById('abrir-cuando')
      if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 50)
  }

  const handleBack = () => {
    setSelectedCardId(null)
    setTimeout(() => {
      const section = document.getElementById('abrir-cuando')
      if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 50)
  }

  const activeCard = finalCards.find((card) => card.id === selectedCardId)

  if (activeCard) {
    return (
      <section className="section" id="abrir-cuando">
        <SectionTitle
          eyebrow="Abrir cuando..."
          title={activeCard.mood}
          text={activeCard.title}
        />

        <div className="letter-reader">
          <div className="letter-reader-panel">
            <div className="letter-reader-meta">
              <span className="reader-badge">{activeCard.mood}</span>
              <h2>{activeCard.title}</h2>
              <p className="letter-reader-preview">{activeCard.preview}</p>
            </div>

            <div className="letter-reader-content">
              {Array.isArray(activeCard.content) && activeCard.content.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>

            <button className="ghost-button letter-reader-back" onClick={handleBack} type="button">
              <ChevronLeft size={16} />
              Volver a las cartas
            </button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="section" id="abrir-cuando">
      <SectionTitle
        eyebrow="Abrir cuando..."
        title="Cartitas para momentos específicos"
        text="Cada cartita se puede leer directamente aquí cuando sea su momento."
      />

      <div className="card-grid">
        {finalCards.map((card) => {
          const isOpened = localStorage.getItem(`distancia-cero-open-when-${card.id}`) === 'opened'

          return (
            <article className={`mini-card open-card ${card.locked ? 'locked' : ''} ${isOpened ? 'opened-card' : ''} fade-up`} key={card.id}>
              <div className="card-top">
                <span>{card.mood}</span>
                {card.locked ? (
                  <Lock size={20} />
                ) : isOpened ? (
                  <Check size={20} className="check-icon" style={{ color: 'var(--color-accent-pink, #ff2e93)' }} />
                ) : (
                  <BookOpen size={20} />
                )}
              </div>

              <h3>{card.title}</h3>
              <p>{card.preview}</p>

              <button
                className="ghost-button"
                onClick={() => openCard(card)}
                disabled={card.locked}
                type="button"
              >
                {card.locked ? 'Próximamente' : isOpened ? 'Releer carta' : 'Abrir carta'}
              </button>
            </article>
          )
        })}
      </div>
    </section>
  )
}

export default OpenWhenSection
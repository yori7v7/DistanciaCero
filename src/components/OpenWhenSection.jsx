import { useEffect, useState } from 'react'
import SectionTitle from './SectionTitle'
import { Lock, ChevronLeft, Check, BookOpen } from 'lucide-react'
import { getHiddenItemIds, getLocalOverrides } from '../utils/localContentStore'

function readLocalOpenWhenLetters() {
  try {
    const rawValue = localStorage.getItem('distancia-cero-local-open-when')
    const parsedValue = rawValue ? JSON.parse(rawValue) : []
    return Array.isArray(parsedValue) ? parsedValue : []
  } catch (error) {
    return []
  }
}

function OpenWhenSection({ cards = [] }) {
  const [selectedCardId, setSelectedCardId] = useState(null)
  const [localOpenWhen, setLocalOpenWhen] = useState(() => readLocalOpenWhenLetters())
  const [openWhenOverrides, setOpenWhenOverrides] = useState(() => getLocalOverrides('openWhenLetters'))
  const [hiddenOpenWhenIds, setHiddenOpenWhenIds] = useState(() => getHiddenItemIds('openWhenLetters'))
  const isSimUnlocked = localStorage.getItem('distancia-cero-sim-unlocked') === '1'

  useEffect(() => {
    const refreshOpenWhen = () => {
      setLocalOpenWhen(readLocalOpenWhenLetters())
      setOpenWhenOverrides(getLocalOverrides('openWhenLetters'))
      setHiddenOpenWhenIds(getHiddenItemIds('openWhenLetters'))
    }

    const handleContentUpdate = (event) => {
      const collection = event.detail?.collection
      if (!['openWhenLetters', 'letters', 'all'].includes(collection)) return
      refreshOpenWhen()
    }

    refreshOpenWhen()
    window.addEventListener('distancia-cero-content-updated', handleContentUpdate)

    return () => {
      window.removeEventListener('distancia-cero-content-updated', handleContentUpdate)
    }
  }, [])

  const baseCards = cards.map((card) => {
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
    .filter((card) => !hiddenOpenWhenIds.includes(String(card.id)))
    .map((card) => {
      const override = openWhenOverrides[String(card.id)]
      return {
        ...card,
        ...(override || {}),
        id: card.id,
        isLocal: false,
        isOverridden: Boolean(override)
      }
    })
  const finalCards = [...baseCards, ...localOpenWhen]

  useEffect(() => {
    if (selectedCardId && !finalCards.some((card) => String(card.id) === String(selectedCardId))) {
      setSelectedCardId(null)
    }
  }, [finalCards, selectedCardId])

  const openCard = (card) => {
    const isLocked = isSimUnlocked ? false : card.locked
    if (isLocked) return

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

  const totalCards = finalCards.length
  const openedCards = finalCards.filter((card) => localStorage.getItem(`distancia-cero-open-when-${card.id}`) === 'opened').length

  const activeCard = finalCards.find((card) => String(card.id) === String(selectedCardId))

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

      <div className="letters-counter">
        <span>Cartas abiertas: <strong>{openedCards} / {totalCards}</strong></span>
      </div>

      <div className="card-grid">
        {finalCards.map((card) => {
          const isOpened = localStorage.getItem(`distancia-cero-open-when-${card.id}`) === 'opened'
          const cardLockedForClick = isSimUnlocked ? false : card.locked

          return (
            <article className={`mini-card open-card ${cardLockedForClick ? 'locked' : ''} ${isOpened ? 'opened-card' : ''} ${isSimUnlocked && card.locked ? 'sim-unlocked-card' : ''} fade-up`} key={card.id}>
              <div className="card-top">
                <span>{card.mood}</span>
                {card.isLocal ? (
                  <span className="card-status-badge local-badge"><BookOpen size={12} /> Local</span>
                ) : card.locked ? (
                  isSimUnlocked ? (
                    <span className="card-status-badge sim-unlocked-badge"><BookOpen size={12} /> Simulado</span>
                  ) : (
                    <span className="card-status-badge locked-badge"><Lock size={12} /> Bloqueada</span>
                  )
                ) : isOpened ? (
                  <span className="card-status-badge opened-badge"><Check size={12} /> Leída</span>
                ) : (
                  <span className="card-status-badge available-badge"><BookOpen size={12} /> Nueva</span>
                )}
              </div>

              <h3>{card.title}</h3>
              <p>{card.preview}</p>

              {card.locked && card.unlockHint && (
                <p className="card-unlock-hint">
                  {card.unlockHint} {isSimUnlocked && <span className="sim-hint-tag">(Modo Prueba)</span>}
                </p>
              )}

              <button
                className="ghost-button"
                onClick={() => openCard(card)}
                disabled={cardLockedForClick}
                type="button"
              >
                {cardLockedForClick ? (card.availableLabel || 'Próximamente') : isOpened ? 'Releer carta' : isSimUnlocked && card.locked ? 'Abrir (Sim)' : 'Abrir carta'}
              </button>
            </article>
          )
        })}
      </div>
    </section>
  )
}

export default OpenWhenSection

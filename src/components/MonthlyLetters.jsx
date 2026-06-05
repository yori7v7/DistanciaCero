import { useState } from 'react'
import SectionTitle from './SectionTitle'
import { Lock, ChevronLeft, Check, BookOpen } from 'lucide-react'

function MonthlyLetters({ letters }) {
  const [selectedLetterId, setSelectedLetterId] = useState(null)
  const isSimUnlocked = localStorage.getItem('distancia-cero-sim-unlocked') === '1'

  const openLetter = (letter) => {
    const isLocked = isSimUnlocked ? false : letter.locked
    if (isLocked) return

    const storageKey = `distancia-cero-monthly-letter-${letter.id}`
    localStorage.setItem(storageKey, 'opened')
    setSelectedLetterId(letter.id)

    // Scroll suave al inicio de la sección
    setTimeout(() => {
      const section = document.getElementById('cartas')
      if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 50)
  }

  const handleBack = () => {
    setSelectedLetterId(null)
    setTimeout(() => {
      const section = document.getElementById('cartas')
      if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 50)
  }

  const totalLetters = letters.length
  const openedLetters = letters.filter((letter) => localStorage.getItem(`distancia-cero-monthly-letter-${letter.id}`) === 'opened').length

  const activeLetter = letters.find((letter) => letter.id === selectedLetterId)

  if (activeLetter) {
    return (
      <section className="section" id="cartas">
        <SectionTitle
          eyebrow="Cartas mensuales"
          title={activeLetter.month}
          text={activeLetter.title}
        />

        <div className="letter-reader">
          <div className="letter-reader-panel">
            <div className="letter-reader-meta">
              <span className="reader-badge">{activeLetter.month}</span>
              <h2>{activeLetter.title}</h2>
              <p className="letter-reader-preview">{activeLetter.preview}</p>
            </div>

            <div className="letter-reader-content">
              {Array.isArray(activeLetter.content) && activeLetter.content.map((paragraph, index) => (
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
    <section className="section" id="cartas">
      <SectionTitle
        eyebrow="Cartas mensuales"
        title="Un mes, una carta, un pedacito más de nosotros"
        text="Cada carta se puede leer directamente aquí cuando llegue su momento."
      />

      <div className="letters-counter">
        <span>Cartas abiertas: <strong>{openedLetters} / {totalLetters}</strong></span>
      </div>

      <div className="card-grid">
        {letters.map((letter) => {
          const isOpened = localStorage.getItem(`distancia-cero-monthly-letter-${letter.id}`) === 'opened'
          const cardLockedForClick = isSimUnlocked ? false : letter.locked

          return (
            <article className={`mini-card ${cardLockedForClick ? 'locked' : ''} ${isOpened ? 'opened-card' : ''} ${isSimUnlocked && letter.locked ? 'sim-unlocked-card' : ''}`} key={letter.id}>
              <div className="card-top">
                <span>{letter.month}</span>
                {letter.locked ? (
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

              <h3>{letter.title}</h3>
              <p>{letter.preview}</p>

              {letter.locked && letter.unlockHint && (
                <p className="card-unlock-hint">
                  {letter.unlockHint} {isSimUnlocked && <span className="sim-hint-tag">(Modo Prueba)</span>}
                </p>
              )}

              <button
                className="ghost-button"
                onClick={() => openLetter(letter)}
                disabled={cardLockedForClick}
                type="button"
              >
                {cardLockedForClick ? (letter.availableLabel || 'Próximamente') : isOpened ? 'Releer carta' : isSimUnlocked && letter.locked ? 'Abrir (Sim)' : 'Abrir carta'}
              </button>
            </article>
          )
        })}
      </div>
    </section>
  )
}

export default MonthlyLetters
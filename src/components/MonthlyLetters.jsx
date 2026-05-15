import SectionTitle from './SectionTitle'
import { Lock, ExternalLink } from 'lucide-react'

function MonthlyLetters({ letters }) {
  const openLetter = (letter) => {
    if (letter.locked) return

    const storageKey = `distancia-cero-letter-${letter.id}`
    localStorage.setItem(storageKey, 'opened')
    window.open(letter.url, '_blank', 'noopener,noreferrer')
  }

  return (
    <section className="section" id="cartas">
      <SectionTitle
        eyebrow="Cartas mensuales"
        title="Un mes, una carta, un pedacito más de nosotros"
        text="Cada carta podrá abrir una página propia cuando llegue su momento."
      />

      <div className="card-grid">
        {letters.map((letter) => (
          <article className={`mini-card ${letter.locked ? 'locked' : ''}`} key={letter.id}>
            <div className="card-top">
              <span>{letter.month}</span>
              {letter.locked ? <Lock size={20} /> : <ExternalLink size={20} />}
            </div>

            <h3>{letter.title}</h3>
            <p>{letter.preview}</p>

            <button className="ghost-button" onClick={() => openLetter(letter)} disabled={letter.locked}>
              {letter.locked ? 'Próximamente' : 'Abrir carta'}
            </button>
          </article>
        ))}
      </div>
    </section>
  )
}

export default MonthlyLetters
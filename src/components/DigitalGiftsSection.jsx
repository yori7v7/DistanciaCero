import SectionTitle from './SectionTitle'
import { Gift, Sparkles } from 'lucide-react'

function DigitalGiftsSection({ gifts }) {
  return (
    <section className="section" id="regalos">
      <SectionTitle
        eyebrow="Regalos digitales"
        title="Detalles que no necesitan envoltura"
        text="Aquí puedes dejar fondos de pantalla, cartas descargables, playlists, edits, dibujos, códigos secretos o sorpresas."
      />

      <div className="card-grid">
        {gifts.map((gift) => (
          <article className="gift-card fade-up" key={gift.id}>
            <div className="gift-icon">
              <Gift size={28} />
            </div>

            <span>{gift.category}</span>
            <h3>{gift.title}</h3>
            <p>{gift.description}</p>

            <button className="ghost-button">
              <Sparkles size={16} />
              Ver regalo
            </button>
          </article>
        ))}
      </div>
    </section>
  )
}

export default DigitalGiftsSection
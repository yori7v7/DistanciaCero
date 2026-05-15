import SectionTitle from './SectionTitle'
import { Clock, Lock } from 'lucide-react'

function TimeCapsuleSection({ capsules }) {
  return (
    <section className="section" id="capsula">
      <SectionTitle
        eyebrow="Cápsula del tiempo"
        title="Mensajes para abrir en el futuro"
        text="Cartas o recuerdos que puedes dejar listos para una fecha especial."
      />

      <div className="capsule-list">
        {capsules.map((capsule) => (
          <article className="capsule-card fade-up" key={capsule.id}>
            <div className="capsule-icon">
              {capsule.locked ? <Lock size={24} /> : <Clock size={24} />}
            </div>

            <div>
              <span>{capsule.openDate}</span>
              <h3>{capsule.title}</h3>
              <p>{capsule.preview}</p>
            </div>

            <button className="ghost-button">
              {capsule.locked ? 'Abrir después' : 'Abrir ahora'}
            </button>
          </article>
        ))}
      </div>
    </section>
  )
}

export default TimeCapsuleSection
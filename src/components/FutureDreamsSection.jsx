import SectionTitle from './SectionTitle'
import { Sparkles } from 'lucide-react'

function FutureDreamsSection() {
  const dreams = [
    {
      id: 1,
      title: 'Vernos sin pantalla de por medio',
      text: 'Un plan futuro para transformar la distancia en abrazo.',
      tag: 'Por vivir'
    },
    {
      id: 2,
      title: 'Tomarnos fotos bonitas',
      text: 'Fotos reales para llenar esta página con momentos de verdad.',
      tag: 'Por vivir'
    },
    {
      id: 3,
      title: 'Construir más historias',
      text: 'Cosas pequeñas, días normales y momentos que luego se vuelven importantes.',
      tag: 'Por vivir'
    },
    {
      id: 'soon-plan',
      title: 'Próximamente',
      text: 'Este cuadrito queda listo para alguna otra idea, salida, plan o cosita que quieras vivir con Ale.',
      tag: 'Pendiente',
      isPlaceholder: true
    }
  ]

  return (
    <section className="section" id="wishlist">
      <SectionTitle
        eyebrow="Wishlist"
        title="Cosas que quiero vivir contigo"
        text="Pequeñas experiencias, planes y momentos que todavía no pasan, pero ya tienen un lugar guardado aquí."
      />

      <div className="universe-grid universe-grid-4">
        {dreams.map((item) => (
          <article
            className={`universe-card universe-plan-card fade-up ${item.isPlaceholder ? 'coming-soon-card coming-soon-plan' : ''}`}
            key={item.id}
          >
            <div className="plan-icon-wrap">
              <Sparkles size={24} />
            </div>

            <h3>{item.title}</h3>
            <p>{item.text}</p>
            <span className="soft-tag">{item.tag}</span>
          </article>
        ))}
      </div>
    </section>
  )
}

export default FutureDreamsSection
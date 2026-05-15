import SectionTitle from './SectionTitle'
import { Shield, Sparkles } from 'lucide-react'

function PromisesSection() {
  const finalPromises = [
    {
      id: 1,
      title: 'Prometo cuidar este espacio',
      text: 'Ir agregando recuerdos, detalles y señales de amor para que nunca se sienta abandonado.',
      tag: 'Promesa'
    },
    {
      id: 2,
      title: 'Prometo no dejar que la distancia sea todo',
      text: 'Porque aunque pese, también podemos construir formas bonitas de estar cerca.',
      tag: 'Promesa'
    },
    {
      id: 3,
      title: 'Prometo hacerte sentir querida',
      text: 'Con palabras, detalles, tiempo, paciencia y mensadas nuestras.',
      tag: 'Promesa'
    },
    {
      id: 'soon-promise',
      title: 'Próximamente',
      text: 'Aquí después podrá vivir otra promesa pequeña, honesta y real, con la misma vibra del resto de la sección.',
      tag: 'Espacio reservado',
      isPlaceholder: true
    }
  ]

  return (
    <section className="section" id="promesas">
      <SectionTitle
        eyebrow="Promesas"
        title="Promesas pequeñas, pero reales"
        text="No se trata de prometer el universo entero, sino de guardar aquí las cosas simples que sí queremos cumplir."
      />

      <div className="universe-grid universe-grid-4">
        {finalPromises.map((item) => (
          <article
            className={`universe-card universe-promise-card fade-up ${item.isPlaceholder ? 'coming-soon-card coming-soon-promise' : ''}`}
            key={item.id}
          >
            <div className="plan-icon-wrap">
              {item.isPlaceholder ? <Sparkles size={24} /> : <Shield size={24} />}
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

export default PromisesSection
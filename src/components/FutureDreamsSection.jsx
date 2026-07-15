import { useEffect, useState } from 'react'
import SectionTitle from './SectionTitle'
import { Sparkles } from 'lucide-react'
import { mergeCollectionWithLocal } from '../services/contentService'

const placeholderDream = {
  id: 'soon-plan',
  title: 'Próximamente',
  description: 'Este cuadrito queda listo para alguna otra idea, salida, plan o cosita que quieras vivir juntos.',
  category: 'Pendiente',
  isPlaceholder: true
}

function normalizeDream(item) {
  return {
    ...item,
    description: item.description || item.text || '',
    category: item.category || item.tag || 'Por vivir'
  }
}

function FutureDreamsSection({ dreams = [] }) {
  const [editableDreams, setEditableDreams] = useState(() => {
    return mergeCollectionWithLocal(dreams, 'futureDreams').map(normalizeDream)
  })

  useEffect(() => {
    setEditableDreams(mergeCollectionWithLocal(dreams, 'futureDreams').map(normalizeDream))
  }, [dreams])

  useEffect(() => {
    const handleContentUpdate = (event) => {
      const collection = event.detail?.collection
      if (!['futureDreams', 'all'].includes(collection)) return
      setEditableDreams(mergeCollectionWithLocal(dreams, 'futureDreams').map(normalizeDream))
    }

    window.addEventListener('distancia-cero-content-updated', handleContentUpdate)

    return () => {
      window.removeEventListener('distancia-cero-content-updated', handleContentUpdate)
    }
  }, [dreams])

  const items = [...editableDreams, placeholderDream]

  return (
    <section className="section" id="wishlist">
      <SectionTitle
        eyebrow="Wishlist"
        title="Cosas que quiero vivir contigo"
        text="Pequeñas experiencias, planes y momentos que todavía no pasan, pero ya tienen un lugar guardado aquí."
      />

      <div className="universe-grid universe-grid-4">
        {items.map((item) => (
          <article
            className={`universe-card universe-plan-card fade-up ${item.isPlaceholder ? 'coming-soon-card coming-soon-plan' : ''}`}
            key={item.id}
          >
            <div className="plan-icon-wrap">
              <Sparkles size={24} />
            </div>

            <h3>{item.title}</h3>
            <p>{item.description}</p>
            <span className="soft-tag">{item.category}</span>
          </article>
        ))}
      </div>
    </section>
  )
}

export default FutureDreamsSection

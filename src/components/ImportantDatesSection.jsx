import { useEffect, useState } from 'react'
import SectionTitle from './SectionTitle'
import { CalendarDays, Heart } from 'lucide-react'
import { mergeCollectionWithLocal } from '../services/contentService'

const placeholderDate = {
  id: 'soon-date',
  date: '----',
  title: 'Próximamente',
  description: 'Aquí podremos agregar otra festividad, una fecha especial o algún día bonito que queramos guardar después.',
  tag: 'Espacio reservado',
  isPlaceholder: true
}

function ImportantDatesSection({ dates = [] }) {
  const [editableDates, setEditableDates] = useState(() => mergeCollectionWithLocal(dates, 'importantDates'))

  useEffect(() => {
    setEditableDates(mergeCollectionWithLocal(dates, 'importantDates'))
  }, [dates])

  useEffect(() => {
    const handleContentUpdate = (event) => {
      const collection = event.detail?.collection
      if (!['importantDates', 'all'].includes(collection)) return
      setEditableDates(mergeCollectionWithLocal(dates, 'importantDates'))
    }

    window.addEventListener('distancia-cero-content-updated', handleContentUpdate)

    return () => {
      window.removeEventListener('distancia-cero-content-updated', handleContentUpdate)
    }
  }, [dates])

  const items = [...editableDates, placeholderDate]

  return (
    <section className="section" id="fechas">
      <SectionTitle
        eyebrow="Calendario"
        title="Fechas importantes"
        text="Aquí se irán quedando las festividades y días especiales que merecen su lugar dentro del universo."
      />

      <div className="universe-grid universe-grid-3">
        {items.map((item) => (
          <article
            className={`universe-card universe-date-card fade-up ${item.isPlaceholder ? 'coming-soon-card coming-soon-date' : ''}`}
            key={item.id}
          >
            <div className="universe-card-top">
              <span className="date-pill">
                <CalendarDays size={16} />
                {item.date}
              </span>
            </div>

            <h3>{item.title}</h3>
            <p>{item.description}</p>

            <span className="tag-line">
              <Heart size={14} />
              {item.tag}
            </span>
          </article>
        ))}
      </div>
    </section>
  )
}

export default ImportantDatesSection

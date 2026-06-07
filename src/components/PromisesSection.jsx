import { useEffect, useState } from 'react'
import SectionTitle from './SectionTitle'
import { Shield, Sparkles } from 'lucide-react'
import { mergeWithLocalItems } from '../utils/localContentStore'

function normalizePromise(item) {
  return {
    ...item,
    text: item.text || item.description || '',
    tag: item.tag || item.footer || 'Promesa'
  }
}

function PromisesSection({ promises = [] }) {
  const [finalPromises, setFinalPromises] = useState(() => {
    return mergeWithLocalItems(promises, 'promises').map(normalizePromise)
  })

  useEffect(() => {
    setFinalPromises(mergeWithLocalItems(promises, 'promises').map(normalizePromise))
  }, [promises])

  useEffect(() => {
    const handleContentUpdate = (event) => {
      const collection = event.detail?.collection
      if (!['promises', 'all'].includes(collection)) return
      setFinalPromises(mergeWithLocalItems(promises, 'promises').map(normalizePromise))
    }

    window.addEventListener('distancia-cero-content-updated', handleContentUpdate)

    return () => {
      window.removeEventListener('distancia-cero-content-updated', handleContentUpdate)
    }
  }, [promises])

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

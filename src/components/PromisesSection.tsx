import { useEffect, useState } from 'react'
import SectionTitle from './SectionTitle'
import { Shield, Sparkles } from 'lucide-react'
import type { ContentItem } from '../types/content'
import { mergeCollectionWithLocal } from '../services/contentService'

interface PromiseItem extends ContentItem {
  title?: string
  text?: string
  description?: string
  tag?: string
  footer?: string
  isPlaceholder?: boolean
}

function normalizePromise(item: ContentItem): PromiseItem {
  return {
    ...item,
    text: item.text || item.description || '',
    tag: item.tag || item.footer || 'Promesa'
  }
}

function PromisesSection({ promises = [] }: { promises?: ContentItem[] }) {
  const [finalPromises, setFinalPromises] = useState<PromiseItem[]>(() =>
    mergeCollectionWithLocal(promises, 'promises').map(normalizePromise))

  useEffect(() => {
    setFinalPromises(mergeCollectionWithLocal(promises, 'promises').map(normalizePromise))
  }, [promises])

  useEffect(() => {
    const handleContentUpdate = (event: Event) => {
      const collection = (event as CustomEvent).detail?.collection
      if (!['promises', 'all'].includes(collection)) return
      setFinalPromises(mergeCollectionWithLocal(promises, 'promises').map(normalizePromise))
    }
    window.addEventListener('distancia-cero-content-updated', handleContentUpdate)
    return () => window.removeEventListener('distancia-cero-content-updated', handleContentUpdate)
  }, [promises])

  return (
    <section className="section" id="promesas">
      <SectionTitle
        eyebrow="Promesas"
        title="Promesas pequeñas, pero reales"
        text="No se trata de prometer el universo entero, sino de guardar aquí las cosas simples que sí queremos cumplir."
      />
      <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
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

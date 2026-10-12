import { useEffect, useRef, useState } from 'react'
import SectionTitle from './SectionTitle'
import { Lock, ChevronLeft, Check, BookOpen } from 'lucide-react'
import type { LetterContent } from '../types/content'
import {
  getCollectionHiddenIds,
  getCollectionOverrides,
  getSimulationUnlocked,
  notifyContentUpdated,
} from '../services/contentService'

// ─── Types ───

export interface LetterCollectionConfig {
  /** Collection name in localStorage / contentService (e.g. 'monthlyLetters') */
  collectionName: 'monthlyLetters' | 'openWhenLetters'
  /** Name of the display field shown in card top & reader badge (e.g. 'month', 'mood') */
  displayField: 'month' | 'mood'
  /** HTML id for the section element */
  sectionId: string
  /** Section eyebrow text */
  eyebrow: string
  /** Section title text */
  title: string
  /** Section subtitle text */
  subtitle: string
  /** Counter label (e.g. 'Cartas abiertas:') */
  counterLabel: string
  /** Extra CSS classes for the mini-card article */
  cardClass?: string
  /** Called to check if a letter is opened */
  isOpened: (id: string | number) => boolean
  /** Called to mark a letter as opened */
  setOpened: (id: string | number, value?: boolean) => void
  /** Called to get legacy letters from localStorage */
  getLegacyLetters: () => LetterContent[]
}

interface LetterCollectionProps {
  config: LetterCollectionConfig
  /** Base data from JSON (default items) */
  data: LetterContent[]
}

// ─── Component ───

/**
 * Generic letter-collection section used by both MonthlyLetters and
 * OpenWhenSection. Parameterized via `config` so the two near-identical
 * components (previously ~380 lines combined) share one implementation.
 */
export default function LetterCollectionSection({ config, data }: LetterCollectionProps) {
  const {
    collectionName, displayField, sectionId, eyebrow, title, subtitle,
    counterLabel, cardClass = '', isOpened, setOpened, getLegacyLetters,
  } = config

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [localItems, setLocalItems] = useState<LetterContent[]>(() => getLegacyLetters())
  const [overrides, setOverrides] = useState(() => getCollectionOverrides(collectionName))
  const [hiddenIds, setHiddenIds] = useState<string[]>(() => getCollectionHiddenIds(collectionName))
  const [isSimUnlocked, setIsSimUnlocked] = useState(getSimulationUnlocked)
  const hasNavigated = useRef(false)
  const sectionRef = useRef<HTMLElement>(null)
  const readerTitleRef = useRef<HTMLHeadingElement>(null)
  const letterButtonRefs = useRef(new Map<string, HTMLButtonElement>())
  const lastOpenedIdRef = useRef<string | null>(null)
  const focusRequestedRef = useRef(false)

  // ── Refresh on content-updated event ──
  useEffect(() => {
    const refresh = () => {
      setLocalItems(getLegacyLetters())
      setOverrides(getCollectionOverrides(collectionName))
      setHiddenIds(getCollectionHiddenIds(collectionName))
      setIsSimUnlocked(getSimulationUnlocked())
      // Resetting progress also closes the reader, as the previous reload did.
      setSelectedId(id => id !== null && !isOpened(id) ? null : id)
    }

    const handleContentUpdate = (event: Event) => {
      const detail = (event as CustomEvent).detail
      const col = detail?.collection
      if (![collectionName, 'letters', 'all'].includes(col)) return
      refresh()
    }

    refresh()
    window.addEventListener('distancia-cero-content-updated', handleContentUpdate)
    return () => window.removeEventListener('distancia-cero-content-updated', handleContentUpdate)
  }, [collectionName, getLegacyLetters, isOpened])

  // ── Merge base + overrides + local into final list ──

  const safeData = Array.isArray(data) ? data : []

  const baseItems: LetterContent[] = safeData
    .filter((item) => !hiddenIds.includes(String(item.id)))
    .map((item) => {
      const override = overrides[String(item.id)]
      return {
        ...item,
        ...(override || {}),
        id: item.id,
        isLocal: false,
        isOverridden: Boolean(override),
      }
    })

  const allItems = [...baseItems, ...localItems]

  const activeItem = allItems.find(item =>
    String(item.id) === selectedId && (isSimUnlocked || !item.locked)
  )

  // Close deleted/hidden letters and letters locked again after simulation.
  useEffect(() => {
    if (selectedId !== null && !activeItem) {
      setSelectedId(null)
    }
  }, [activeItem, selectedId])

  useEffect(() => {
    if (!focusRequestedRef.current) return
    focusRequestedRef.current = false
    if (activeItem) {
      readerTitleRef.current?.focus({ preventScroll: true })
    } else {
      const trigger = letterButtonRefs.current.get(lastOpenedIdRef.current || '')
      const target = trigger && !trigger.disabled ? trigger : sectionRef.current
      target?.focus({ preventScroll: true })
    }
  }, [selectedId, activeItem?.id])

  useEffect(() => {
    if (!hasNavigated.current) return
    const timer = window.setTimeout(() => {
      const section = document.getElementById(sectionId)
      if (section && section.contains(document.activeElement) &&
          !section.closest('[inert], [aria-hidden="true"]')) {
        section.scrollIntoView({ behavior: 'instant', block: 'start' })
      }
    }, 50)
    return () => window.clearTimeout(timer)
  }, [sectionId, selectedId])

  // ── Handlers ──

  const openItem = (item: LetterContent) => {
    const locked = isSimUnlocked ? false : item.locked
    if (locked) return

    setOpened(item.id, true)
    notifyContentUpdated(collectionName)
    hasNavigated.current = true
    lastOpenedIdRef.current = String(item.id)
    focusRequestedRef.current = true
    setSelectedId(String(item.id))
  }

  const handleBack = () => {
    focusRequestedRef.current = true
    setSelectedId(null)
  }

  // ── Derived stats ──
  const totalItems = allItems.length
  const openedCount = allItems.filter((item) => isOpened(item.id)).length

  // ── Reader view ──
  if (activeItem) {
    return (
      <section className="section" id={sectionId} ref={sectionRef} tabIndex={-1}>
        <SectionTitle
          eyebrow={eyebrow}
          title={activeItem[displayField]}
          text={activeItem.title}
        />

        <div className="letter-reader">
          <div className="letter-reader-panel">
            <div className="letter-reader-meta">
              <span className="reader-badge">{activeItem[displayField]}</span>
              <h2 ref={readerTitleRef} tabIndex={-1}>{activeItem.title}</h2>
              <p className="letter-reader-preview">{activeItem.preview}</p>
            </div>

            <div className="letter-reader-content">
              {Array.isArray(activeItem.content) && activeItem.content.map((paragraph: string, idx: number) => (
                <p key={idx}>{paragraph}</p>
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

  // ── Grid view ──
  return (
    <section className="section" id={sectionId} ref={sectionRef} tabIndex={-1}>
      <SectionTitle
        eyebrow={eyebrow}
        title={title}
        text={subtitle}
      />

      <div className="letters-counter">
        <span>{counterLabel} <strong>{openedCount} / {totalItems}</strong></span>
      </div>

      <div className="card-grid">
        {allItems.map((item) => {
          const opened = isOpened(item.id)
          const lockedForClick = isSimUnlocked ? false : item.locked

          return (
            <article
              className={`mini-card ${cardClass} ${lockedForClick ? 'locked' : ''} ${opened ? 'opened-card' : ''} ${isSimUnlocked && item.locked ? 'sim-unlocked-card' : ''} ${item.isLocal ? 'local-letter-card' : ''}`}
              key={item.id}
            >
              <div className="card-top">
                <span>{item[displayField]}</span>
                {item.isLocal ? (
                  <span className="card-status-badge local-badge"><BookOpen size={12} /> Local</span>
                ) : item.locked ? (
                  isSimUnlocked ? (
                    <span className="card-status-badge sim-unlocked-badge"><BookOpen size={12} /> Simulado</span>
                  ) : (
                    <span className="card-status-badge locked-badge"><Lock size={12} /> Bloqueada</span>
                  )
                ) : opened ? (
                  <span className="card-status-badge opened-badge"><Check size={12} /> Leída</span>
                ) : (
                  <span className="card-status-badge available-badge"><BookOpen size={12} /> Nueva</span>
                )}
              </div>

              <h3>{item.title}</h3>
              <p>{item.preview}</p>

              {item.locked && item.unlockHint && (
                <p className="card-unlock-hint">
                  {item.unlockHint} {isSimUnlocked && <span className="sim-hint-tag">(Modo Prueba)</span>}
                </p>
              )}

              <button
                ref={(element) => {
                  const id = String(item.id)
                  if (element) letterButtonRefs.current.set(id, element)
                  else letterButtonRefs.current.delete(id)
                }}
                className="ghost-button"
                onClick={() => openItem(item)}
                disabled={lockedForClick}
                type="button"
              >
                {lockedForClick
                  ? (item.availableLabel || 'Próximamente')
                  : opened
                    ? 'Releer carta'
                    : isSimUnlocked && item.locked
                      ? 'Abrir (Sim)'
                      : 'Abrir carta'}
              </button>
            </article>
          )
        })}
      </div>
    </section>
  )
}

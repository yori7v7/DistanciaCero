import { useEffect, useMemo, useState } from 'react'
import SectionTitle from './SectionTitle'
import { BookOpen, ChevronLeft, ChevronRight, Feather, Heart, MoonStar, Sparkles } from 'lucide-react'
import { mergeCollectionWithLocal } from '../services/contentService'

const fallbackPages = [
  {
    id: 'inicio',
    chapter: 'Capítulo I',
    date: 'Nuestro inicio',
    title: 'Aquí empieza nuestro diario',
    subtitle: 'Un lugar para guardar lo que somos.',
    description: 'Este diario nació para que nuestra historia no se sintiera como una lista fría de fechas, sino como algo vivo, bonito y totalmente nuestro.',
    quote: 'Todo lo que somos merece una página.',
    details: ['Nosotros', 'Distancia Cero', 'Nuestro universo'],
    mood: 'Inicio'
  }
]

const spanishMonths = {
  enero: 0,
  febrero: 1,
  marzo: 2,
  abril: 3,
  mayo: 4,
  junio: 5,
  julio: 6,
  agosto: 7,
  septiembre: 8,
  setiembre: 8,
  octubre: 9,
  noviembre: 10,
  diciembre: 11
}

const spanishMonthNames = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre'
]

function formatTimelineDateForDisplay(dateValue) {
  const rawDate = String(dateValue || '').trim()
  const isoMatch = rawDate.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!isoMatch) return rawDate

  const day = Number(isoMatch[3])
  const monthName = spanishMonthNames[Number(isoMatch[2]) - 1]
  return monthName ? `${day} de ${monthName} de ${isoMatch[1]}` : rawDate
}

function isFuturePage(page) {
  const combinedText = `${page.id || ''} ${page.date || ''} ${page.title || ''}`.toLowerCase()
  return page.id === 'futuro' || combinedText.includes('próximamente') || combinedText.includes('proximamente')
}

function getTimelineSortDate(page) {
  const rawDate = String(page.date || '').trim().toLowerCase()
  const isoMatch = rawDate.match(/^(\d{4})-(\d{2})-(\d{2})$/)

  if (isoMatch) {
    return new Date(Number(isoMatch[1]), Number(isoMatch[2]) - 1, Number(isoMatch[3])).getTime()
  }

  const spanishMatch = rawDate.match(/(\d{1,2})\s+de\s+([a-záéíóúñ]+)(?:\s+de\s+(\d{4}))?/)
  if (!spanishMatch) return null

  const month = spanishMonths[spanishMatch[2].normalize('NFD').replace(/[\u0300-\u036f]/g, '')]
  if (month === undefined) return null

  if (!spanishMatch[3]) return null

  return new Date(Number(spanishMatch[3]), month, Number(spanishMatch[1])).getTime()
}

function sortTimelinePages(pages) {
  return [...pages].sort((leftPage, rightPage) => {
    const leftIsFuture = isFuturePage(leftPage)
    const rightIsFuture = isFuturePage(rightPage)

    if (leftIsFuture && !rightIsFuture) return 1
    if (!leftIsFuture && rightIsFuture) return -1
    if (leftIsFuture && rightIsFuture) return 0

    const leftDate = getTimelineSortDate(leftPage)
    const rightDate = getTimelineSortDate(rightPage)

    if (leftDate !== null && rightDate !== null) return leftDate - rightDate

    return 0
  })
}

function normalizePage(page, index) {
  const normalizedDetails = Array.isArray(page.details)
    ? page.details
    : Array.isArray(page.features)
      ? page.features
      : []

  return {
    id: page.id || `page-${index + 1}`,
    chapter: page.chapter || `Capítulo ${index + 1}`,
    date: formatTimelineDateForDisplay(page.date || page.year || 'Fecha importante'),
    title: page.title || 'Un recuerdo nuestro',
    subtitle: page.subtitle || page.description || 'Una página de nuestra historia.',
    description: page.description || page.text || page.caption || 'Esta página existe para guardar algo bonito de ustedes.',
    quote: page.quote || 'Hay recuerdos que se quedan brillando.',
    details: normalizedDetails,
    mood: page.mood || page.type || 'Recuerdo'
  }
}

function StoryTimeline({ timeline = [] }) {
  const [localVersion, setLocalVersion] = useState(0)
  const [currentPage, setCurrentPage] = useState(0)
  const [turnDirection, setTurnDirection] = useState('next')
  const [isTurning, setIsTurning] = useState(false)

  const pages = useMemo(() => {
    const mergedPages = mergeCollectionWithLocal(Array.isArray(timeline) ? timeline : [], 'timeline')
    const source = mergedPages.length > 0 ? sortTimelinePages(mergedPages) : fallbackPages
    return source.map(normalizePage)
  }, [timeline, localVersion])

  useEffect(() => {
    const handleContentUpdate = (event) => {
      const collection = event.detail?.collection
      if (collection === 'timeline' || collection === 'all') {
        setLocalVersion((version) => version + 1)
      }
    }

    window.addEventListener('distancia-cero-content-updated', handleContentUpdate)
    return () => window.removeEventListener('distancia-cero-content-updated', handleContentUpdate)
  }, [])

  useEffect(() => {
    if (currentPage >= pages.length) {
      setCurrentPage(Math.max(0, pages.length - 1))
      setIsTurning(false)
    }
  }, [currentPage, pages.length])

  const page = pages[currentPage]
  const total = pages.length
  const isFirst = currentPage === 0
  const isLast = currentPage === total - 1

  const changePage = (nextIndex, direction) => {
    if (nextIndex < 0 || nextIndex >= total || nextIndex === currentPage || isTurning) return

    setTurnDirection(direction)
    setIsTurning(true)

    setTimeout(() => {
      setCurrentPage(nextIndex)
    }, 230)

    setTimeout(() => {
      setIsTurning(false)
    }, 620)
  }

  const nextPage = () => changePage(currentPage + 1, 'next')
  const previousPage = () => changePage(currentPage - 1, 'prev')

  return (
    <section className="section diary-story-section" id="historia">
      <SectionTitle
        eyebrow="Nuestra historia"
        title="Convertí nuestra historia en un diario"
        text="Porque lo nuestro no se siente como una simple línea del tiempo. Se siente como un libro oscuro, bonito, rosita y lleno de páginas que todavía quiero escribir contigo."
      />

      <div className="diary-shell fade-up">
        <div className="diary-constellation diary-constellation-one"></div>
        <div className="diary-constellation diary-constellation-two"></div>

        <div className="diary-topbar">
          <span>
            <BookOpen size={17} />
            Diario de un universo llamado Distancia Cero
          </span>

          <strong>
            Página {currentPage + 1} de {total}
          </strong>
        </div>

        <div className={`diary-book ${isTurning ? 'is-turning' : ''} turn-${turnDirection}`}>
          <div className="diary-book-spine"></div>

          <article className="diary-page diary-page-left">
            <div className="diary-page-glow"></div>

            <span className="diary-chapter">{page.chapter}</span>

            <div className="diary-date-medallion">
              <MoonStar size={22} />
              <strong>{page.date}</strong>
            </div>

            <h3>{page.title}</h3>
            <p>{page.subtitle}</p>

            <div className="diary-quote">
              <Feather size={18} />
              <span>{page.quote}</span>
            </div>
          </article>

          <article className="diary-page diary-page-right">
            <div className="diary-page-glow"></div>

            <span className="diary-mood">
              <Heart size={15} />
              {page.mood}
            </span>

            <p className="diary-description">{page.description}</p>

            <div className="diary-details">
              {(page.details || []).map((detail, index) => (
                <div className="diary-detail" key={`${page.id}-${index}`}>
                  <Sparkles size={15} />
                  <span>{detail}</span>
                </div>
              ))}
            </div>

            <div className="diary-actions">
              <button className="ghost-button diary-button" type="button" onClick={previousPage} disabled={isFirst}>
                <ChevronLeft size={18} />
                Página anterior
              </button>

              <button className="main-button diary-button" type="button" onClick={nextPage} disabled={isLast}>
                Siguiente página
                <ChevronRight size={18} />
              </button>
            </div>
          </article>

          {isTurning && <div className="diary-turning-page"></div>}
        </div>

        <div className="diary-index">
          {pages.map((item, index) => (
            <button
              key={item.id}
              className={`diary-index-dot ${index === currentPage ? 'active' : ''}`}
              type="button"
              onClick={() => changePage(index, index > currentPage ? 'next' : 'prev')}
              aria-label={`Ir a ${item.title}`}
            >
              <span>{item.date}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

export default StoryTimeline

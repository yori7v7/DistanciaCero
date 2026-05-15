import { useEffect, useState } from 'react'
import { Heart, Sparkles } from 'lucide-react'
import siteConfig from '../data/siteConfig.json'

const loadingLines = [
  'Inicializando universo Ale & Yori...',
  'Acomodando planetas...',
  'Cargando cartas bonitas...',
  'Preparando milanesas espirituales...',
  'Activando distancia cero...'
]

function LoadingIntro() {
  const [visible, setVisible] = useState(() => {
    return sessionStorage.getItem('distancia-cero-intro-seen') !== 'true'
  })

  const [lineIndex, setLineIndex] = useState(0)

  useEffect(() => {
    if (!visible) return

    const lineTimer = setInterval(() => {
      setLineIndex((current) => {
        if (current >= loadingLines.length - 1) return current
        return current + 1
      })
    }, 520)

    const hideTimer = setTimeout(() => {
      sessionStorage.setItem('distancia-cero-intro-seen', 'true')
      setVisible(false)
    }, 3300)

    return () => {
      clearInterval(lineTimer)
      clearTimeout(hideTimer)
    }
  }, [visible])

  if (!visible) return null

  return (
    <div className="loading-intro">
      <div className="intro-card">
        <div className="intro-orbit">
          <span></span>
          <Heart size={34} />
        </div>

        <span className="intro-eyebrow">{siteConfig.project.name}</span>
        <h2>{siteConfig.couple.mainPairName}</h2>
        <p>{loadingLines[lineIndex]}</p>

        <div className="intro-progress">
          <span></span>
        </div>

        <div className="intro-footer">
          <Sparkles size={16} />
          <small>Este universo apenas está despertando</small>
        </div>
      </div>
    </div>
  )
}

export default LoadingIntro
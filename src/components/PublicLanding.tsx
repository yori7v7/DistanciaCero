import { Heart, Sparkles, Stars, ArrowRight, Music, Pause, Play } from 'lucide-react'
import { useEffect, useState } from 'react'
import useSiteConfig from '../hooks/useSiteConfig'
import { useReducedMotion } from '../hooks/useSceneActivity'

interface PublicLandingProps {
  onEnter: () => void
}

const phrases = [
  'Un universo donde la distancia no existe',
  'Cartas que viajan entre estrellas',
  'Canciones que cruzan océanos',
  'Recuerdos atrapados en gravedad cero',
  'Donde cada latido es una galaxia',
]

function PublicLanding({ onEnter }: PublicLandingProps) {
  const siteConfig = useSiteConfig()
  const [phraseIndex, setPhraseIndex] = useState(0)
  const [motionPaused, setMotionPaused] = useState(false)
  const reducedMotion = useReducedMotion()
  const animationsPaused = reducedMotion || motionPaused
  const { yourName, herName, mainPairName } = siteConfig.couple

  useEffect(() => {
    if (animationsPaused) return
    const timer = setInterval(() => {
      setPhraseIndex(i => (i + 1) % phrases.length)
    }, 3000)
    return () => clearInterval(timer)
  }, [animationsPaused])

  return (
    <div className="public-landing fixed inset-0 z-50 overflow-y-auto" data-motion-paused={animationsPaused}>
      <div aria-hidden="true">
        <div className="background-orbs">
          <span className="orb orb-pink" />
          <span className="orb orb-red" />
          <span className="orb orb-soft" />
        </div>
        <div className="energy-lines" />
        <div className="stars-layer" />
      </div>

      <div className="landing-layout">
        <main className="landing-content" aria-labelledby="landing-title">
          <div className="small-pill landing-eyebrow">
            <Sparkles size={14} aria-hidden="true" />
            <span>{siteConfig.hero.eyebrow}</span>
          </div>

          <h1 id="landing-title" className="landing-title">
            <span>{siteConfig.hero.titlePrefix}</span>
            <span className="landing-title-name">{siteConfig.hero.titleName || 'nuestro universo'}</span>
          </h1>
          <p className="landing-description">{siteConfig.hero.description}</p>

          <div className="hero-names landing-names">
            {yourName && <span>{yourName}</span>}
            {yourName && herName && <Heart size={20} aria-hidden="true" />}
            {herName && <span>{herName}</span>}
            {!yourName && !herName && <span>{mainPairName}</span>}
          </div>

          <div className="landing-phrase">
            <Music size={16} aria-hidden="true" />
            <span key={phraseIndex} className={animationsPaused ? undefined : 'animate-[fade-up_0.4s_ease_both]'}>
              {phrases[phraseIndex]}
            </span>
          </div>

          <button type="button" className="main-button landing-enter" onClick={onEnter}>
            <span>{siteConfig.hero.primaryButton}</span>
            <ArrowRight size={20} aria-hidden="true" />
          </button>
          <p className="landing-note">Un espacio para compartir su historia, a su ritmo.</p>
        </main>

        <footer className="landing-footer">
          <p className="landing-signature">
            <Stars size={14} aria-hidden="true" />
            <span>{siteConfig.project.name} · Desde {siteConfig.dates.metDate?.split('-')[0] || '2026'}</span>
          </p>
          {!reducedMotion && (
            <button
              type="button"
              className="landing-motion-toggle"
              onFocus={event => event.currentTarget.scrollIntoView({ block: 'nearest', behavior: 'instant' })}
              onClick={() => setMotionPaused(paused => !paused)}
            >
              {motionPaused ? <Play size={14} aria-hidden="true" /> : <Pause size={14} aria-hidden="true" />}
              <span>{motionPaused ? 'Reanudar animaciones' : 'Pausar animaciones'}</span>
            </button>
          )}
        </footer>
      </div>
    </div>
  )
}

export default PublicLanding

import { useMemo, type FocusEvent } from 'react'
import { Heart, Sparkles, Music } from 'lucide-react'
import { useAudio } from '../context/AudioContext'
import randomPhrases from '../data/randomPhrases.json'
import useSiteConfig from '../hooks/useSiteConfig'

interface RandomPhrase {
  text: string
  author?: string
}

function revealKeyboardFocus(event: FocusEvent<HTMLElement>) {
  const control = event.currentTarget
  if (control.matches(':focus-visible')) {
    control.scrollIntoView({ block: 'nearest', behavior: 'instant' })
  }
}

function Hero() {
  const siteConfig = useSiteConfig()
  const { backgroundPlaying, backgroundTrackPath, toggleBackground, infoMessage } = useAudio()
  const { yourName, herName, mainPairName } = siteConfig.couple

  const dailyPhrase: RandomPhrase | null = useMemo(() => {
    if (!randomPhrases.length) return null
    const index = new Date().getDate() % randomPhrases.length
    return randomPhrases[index] as RandomPhrase
  }, [])

  return (
    <section className="section hero hero-section" id="inicio" aria-labelledby="hero-title">
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="glow-orb w-[500px] h-[500px] bg-pink top-1/4 -left-32" />
        <div className="glow-orb w-[400px] h-[400px] bg-red top-1/3 -right-24" />
        <div className="glow-orb w-[300px] h-[300px] bg-pink-soft bottom-1/4 left-1/3 opacity-10" />
      </div>

      <div className="hero-content">
        <div className="pill hero-brand">
          <Heart size={16} aria-hidden="true" />
          <span>{siteConfig.project.name}</span>
        </div>

        <h1 id="hero-title" className="hero-heading">
          <span>{siteConfig.hero.titlePrefix}</span>
          <span className="hero-heading-name">{siteConfig.hero.titleName || 'nuestro universo'}</span>
        </h1>
        <p className="hero-description">{siteConfig.hero.description}</p>

        <div className="hero-couple-names">
          {yourName && <span>{yourName}</span>}
          {yourName && herName && <Heart size={22} aria-hidden="true" />}
          {herName && <span>{herName}</span>}
          {!yourName && !herName && <span>{mainPairName}</span>}
        </div>

        {dailyPhrase && (
          <div className="hero-daily-phrase">
            <Sparkles size={16} aria-hidden="true" />
            <span><strong>Mensaje del día:</strong> {dailyPhrase.text}</span>
          </div>
        )}

        <div className="hero-actions">
          <a href="#/universo" className="main-button"
            onFocus={revealKeyboardFocus}>
            <span>{siteConfig.hero.primaryButton}</span>
            <Heart size={18} aria-hidden="true" />
          </a>
          <button
            type="button"
            onFocus={revealKeyboardFocus}
            onClick={toggleBackground}
            disabled={!backgroundTrackPath}
            className="ghost-button"
            title={!backgroundTrackPath ? 'Añade una canción de fondo' : backgroundPlaying ? 'Pausar música' : 'Activar música'}
            aria-label={!backgroundTrackPath ? 'Añade una canción de fondo' : backgroundPlaying ? 'Pausar música de fondo' : 'Activar música de fondo'}
          >
            <Music size={16} aria-hidden="true" />
            <span>{!backgroundTrackPath ? 'Añade una canción de fondo' : backgroundPlaying ? 'Pausar canción' : 'Activar canción'}</span>
          </button>
        </div>
        {infoMessage && <p role="status" className="hero-info">{infoMessage}</p>}
      </div>
    </section>
  )
}

export default Hero

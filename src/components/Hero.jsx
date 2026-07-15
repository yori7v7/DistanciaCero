import { useMemo } from 'react'
import { Heart, Sparkles, Music } from 'lucide-react'
import { useAudio } from '../context/AudioContext'
import randomPhrases from '../data/randomPhrases.json'
import siteConfig from '../data/siteConfig.json'

function Hero() {
  const { backgroundPlaying, toggleBackground } = useAudio()

  const dailyPhrase = useMemo(() => {
    if (!randomPhrases.length) return null
    const index = new Date().getDate() % randomPhrases.length
    return randomPhrases[index]
  }, [])

  return (
    <section className="hero section" id="inicio">
      <div className="hero-content fade-up">
        <div className="small-pill">
          <Sparkles size={16} />
          <span>{siteConfig.hero.eyebrow}</span>
        </div>

        <h1>
          {siteConfig.hero.titlePrefix} <span>{siteConfig.hero.titleName}</span>
        </h1>

        <p className="hero-subtitle">
          {siteConfig.hero.description}
        </p>

        <div className="hero-names">
          <span>{siteConfig.couple.yourName}</span>
          <Heart size={22} />
          <span>{siteConfig.couple.herName}</span>
        </div>

        {dailyPhrase && (
          <div className="daily-phrase">
            <strong>Mensaje del día:</strong> {dailyPhrase.text}
          </div>
        )}

        <div className="hero-actions">
          <a href="#carta" className="main-button">
            {siteConfig.hero.primaryButton}
          </a>
        </div>

        <button
          className="hero-music-toggle"
          onClick={toggleBackground}
          title={backgroundPlaying ? 'Pausar música' : 'Activar música'}
          aria-label={backgroundPlaying ? 'Pausar música de fondo' : 'Activar música de fondo'}
        >
          <Music size={16} />
          <span>{backgroundPlaying ? 'Pausar canción' : 'Activar canción'}</span>
        </button>
      </div>
    </section>
  )
}

export default Hero
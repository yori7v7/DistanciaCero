import { Heart, Sparkles, Stars, ArrowRight, Music } from 'lucide-react'
import { useEffect, useState } from 'react'
import siteConfig from '../data/siteConfig.json'

function PublicLanding({ onEnter }) {
  const [phraseIndex, setPhraseIndex] = useState(0)

  const phrases = [
    'Un universo donde la distancia no existe',
    'Cartas que viajan entre estrellas',
    'Canciones que cruzan océanos',
    'Recuerdos atrapados en gravedad cero',
    'Donde cada latido es una galaxia'
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setPhraseIndex((i) => (i + 1) % phrases.length)
    }, 3000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="public-landing">
      {/* Same background as main app */}
      <div className="background-orbs">
        <span className="orb orb-pink"></span>
        <span className="orb orb-red"></span>
        <span className="orb orb-soft"></span>
      </div>
      <div className="energy-lines"></div>
      <div className="stars-layer"></div>

      {/* Floating particles */}
      <div className="public-landing__particles">
        {[...Array(12)].map((_, i) => (
          <span
            key={i}
            className="public-landing__particle"
            style={{
              left: `${10 + (i * 7)}%`,
              animationDelay: `${i * 0.4}s`,
              animationDuration: `${4 + (i % 3) * 2}s`
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="public-landing__content">
        <div className="small-pill public-landing__badge">
          <Sparkles size={14} />
          <span>{siteConfig.hero.eyebrow}</span>
        </div>

        <h1 className="public-landing__title">
          <span className="public-landing__title-line">{siteConfig.hero.titlePrefix}</span>
          <span className="public-landing__title-line public-landing__title-line--accent">
            {siteConfig.hero.titleName}
          </span>
        </h1>

        <div className="hero-names public-landing__names">
          <span>{siteConfig.couple.yourName}</span>
          <Heart size={22} className="public-landing__heart" />
          <span>{siteConfig.couple.herName}</span>
        </div>

        {/* Animated phrase */}
        <div className="public-landing__phrase">
          <Music size={14} className="public-landing__phrase-icon" />
          <span key={phraseIndex} className="public-landing__phrase-text">
            {phrases[phraseIndex]}
          </span>
        </div>

        {/* CTA */}
        <div className="public-landing__actions">
          <button className="main-button public-landing__cta" onClick={onEnter}>
            <span>{siteConfig.hero.primaryButton}</span>
            <ArrowRight size={20} />
          </button>
        </div>

        <p className="public-landing__hint">
          Solo {siteConfig.couple.herName} y {siteConfig.couple.yourName} pueden entrar.
        </p>
      </div>

      {/* Footer */}
      <div className="public-landing__footer">
        <Stars size={12} />
        <span>{siteConfig.project.name} • Desde {siteConfig.dates.metDate?.split('-')[0] || '2026'}</span>
        <Heart size={10} />
      </div>
    </div>
  )
}

export default PublicLanding

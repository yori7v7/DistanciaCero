import { Heart, Sparkles, Stars, ArrowRight, Music } from 'lucide-react'
import { useEffect, useState } from 'react'
import siteConfig from '../data/siteConfig.json'

interface PublicLandingProps {
  onEnter: () => void
}

function PublicLanding({ onEnter }: PublicLandingProps) {
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
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center">
      {/* Same background as main app */}
      <div className="background-orbs">
        <span className="orb orb-pink"></span>
        <span className="orb orb-red"></span>
        <span className="orb orb-soft"></span>
      </div>
      <div className="energy-lines"></div>
      <div className="stars-layer"></div>

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <span
            key={i}
            className="absolute bottom-0 w-1 h-1 rounded-full bg-pink opacity-30
              animate-[particleRise_5s_ease-in_infinite]"
            style={{
              left: `${10 + (i * 7)}%`,
              animationDelay: `${i * 0.4}s`,
              animationDuration: `${4 + (i % 3) * 2}s`
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-xl w-full py-12">
        <div className="small-pill mb-8">
          <Sparkles size={14} />
          <span>{siteConfig.hero.eyebrow}</span>
        </div>

        <h1 className="text-[clamp(2.5rem,8vw,4.5rem)] font-display font-black leading-tight mb-8">
          <span className="block text-white-soft">{siteConfig.hero.titlePrefix}</span>
          <span className="block text-pink">
            {siteConfig.hero.titleName}
          </span>
        </h1>

        <div className="hero-names mb-10">
          <span>{siteConfig.couple.yourName}</span>
          <Heart size={22} className="mx-3 inline-block text-pink animate-[pulse-heart_2s_ease-in-out_infinite]" />
          <span>{siteConfig.couple.herName}</span>
        </div>

        {/* Animated phrase */}
        <div className="flex items-center gap-2 text-muted text-sm min-h-[24px] mb-12">
          <Music size={14} className="text-pink-soft shrink-0" />
          <span key={phraseIndex} className="animate-[fade-up_0.4s_ease_both]">
            {phrases[phraseIndex]}
          </span>
        </div>

        {/* CTA */}
        <div className="flex flex-col items-center gap-4">
          <button className="main-button flex items-center gap-3 text-lg px-10 py-4" onClick={onEnter}>
            <span>{siteConfig.hero.primaryButton}</span>
            <ArrowRight size={20} />
          </button>
        </div>

        <p className="mt-10 text-xs text-muted/60">
          Solo {siteConfig.couple.herName} y {siteConfig.couple.yourName} pueden entrar.
        </p>
      </div>

      {/* Footer */}
      <div className="absolute bottom-6 flex items-center gap-2 text-muted text-xs">
        <Stars size={12} />
        <span>{siteConfig.project.name} • Desde {siteConfig.dates.metDate?.split('-')[0] || '2026'}</span>
        <Heart size={10} />
      </div>
    </div>
  )
}

export default PublicLanding

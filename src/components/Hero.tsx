import { useMemo } from 'react'
import { Heart, Sparkles, Music } from 'lucide-react'
import { useAudio } from '../context/AudioContext'
import randomPhrases from '../data/randomPhrases.json'
import siteConfig from '../data/siteConfig.json'

interface RandomPhrase {
  text: string
  author?: string
}

function Hero() {
  const { backgroundPlaying, toggleBackground } = useAudio()

  const dailyPhrase: RandomPhrase | null = useMemo(() => {
    if (!randomPhrases.length) return null
    const index = new Date().getDate() % randomPhrases.length
    return randomPhrases[index] as RandomPhrase
  }, [])

  return (
    <section className="section hero relative min-h-screen flex items-center justify-center overflow-hidden" id="inicio">
      {/* Background ambient orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="glow-orb w-[500px] h-[500px] bg-pink top-1/4 -left-32" />
        <div className="glow-orb w-[400px] h-[400px] bg-red top-1/3 -right-24" />
        <div className="glow-orb w-[300px] h-[300px] bg-pink-soft bottom-1/4 left-1/3 opacity-10" />
      </div>

      <div className="relative z-10 text-center px-6 max-w-3xl mx-auto py-36">
        {/* Eyebrow pill */}
        <div className="pill mb-16 mx-auto">
          <Sparkles size={16} />
          <span>{siteConfig.hero.eyebrow}</span>
        </div>

        {/* Main title */}
        <h1 className="font-display text-[clamp(2.8rem,8vw,5rem)] font-black leading-[1.2] mb-36">
          <span className="block text-white-soft mb-4">{siteConfig.hero.titlePrefix}</span>
          <span className="block text-gradient">{siteConfig.hero.titleName}</span>
        </h1>

        {/* Subtitle */}
        <p className="text-muted text-lg max-w-lg mx-auto mb-16 leading-relaxed mt-8">
          {siteConfig.hero.description}
        </p>

        {/* Couple names with heart */}
        <div className="flex items-center justify-center gap-4 mb-16 text-xl font-semibold text-white-soft">
          <span className="text-pink-soft">{siteConfig.couple.yourName}</span>
          <Heart size={24} className="text-pink animate-[pulse-heart_2s_ease-in-out_infinite]" />
          <span className="text-pink-soft">{siteConfig.couple.herName}</span>
        </div>

        {/* Daily phrase */}
        {dailyPhrase && (
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full
            bg-[rgba(255,138,212,0.06)] border border-[rgba(255,138,212,0.15)]
            text-pink-soft text-sm mb-16">
            <Sparkles size={14} />
            <span><strong>Mensaje del día:</strong> {dailyPhrase.text}</span>
          </div>
        )}

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-12">
          <a href="#carta" className="main-button">
            {siteConfig.hero.primaryButton}
            <Heart size={18} />
          </a>
          <button
            onClick={toggleBackground}
            className="ghost-button"
            title={backgroundPlaying ? 'Pausar música' : 'Activar música'}
            aria-label={backgroundPlaying ? 'Pausar música de fondo' : 'Activar música de fondo'}
          >
            <Music size={16} />
            <span>{backgroundPlaying ? 'Pausar canción' : 'Activar canción'}</span>
          </button>
        </div>
      </div>
    </section>
  )
}

export default Hero

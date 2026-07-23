import { useEffect, useMemo, useState } from 'react'
import { Heart, MessageCircleHeart, Sparkles, RotateCcw } from 'lucide-react'
import proposal from '../data/proposal.json'

const STORAGE_KEY = 'distancia-cero-proposal-answer'

interface TimeLeft {
  expired: boolean
  days: number
  hours: number
  minutes: number
  seconds: number
}

interface ParsedAnswer {
  value: 'yes' | 'talk'
  answeredAt: string
}

function getTimeLeft(targetDate: string): TimeLeft {
  const now = new Date()
  const target = new Date(targetDate)
  const diff = target.getTime() - now.getTime()

  if (diff <= 0) {
    return { expired: true, days: 0, hours: 0, minutes: 0, seconds: 0 }
  }

  const secondsTotal = Math.floor(diff / 1000)
  return {
    expired: false,
    days: Math.floor(secondsTotal / (60 * 60 * 24)),
    hours: Math.floor((secondsTotal / (60 * 60)) % 24),
    minutes: Math.floor((secondsTotal / 60) % 60),
    seconds: secondsTotal % 60,
  }
}

function safeParseAnswer(answer: string): ParsedAnswer | null {
  try {
    return answer ? JSON.parse(answer) : null
  } catch {
    return null
  }
}

function safeGetItem(key: string): string | null {
  try { return localStorage.getItem(key) } catch { return null }
}
function safeSetItem(key: string, value: string): void {
  try { localStorage.setItem(key, value) } catch { /* degraded */ }
}
function safeRemoveItem(key: string): void {
  try { localStorage.removeItem(key) } catch { /* degraded */ }
}

function ProposalSection() {
  const [answer, setAnswer] = useState<string>(() => safeGetItem(STORAGE_KEY) || '')
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => getTimeLeft(proposal.proposalDate))

  const parsedAnswer = safeParseAnswer(answer)
  const accepted = parsedAnswer?.value === 'yes'
  const wantsToTalk = parsedAnswer?.value === 'talk'

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeLeft(proposal.proposalDate))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const countdownText = useMemo(() => {
    if (timeLeft.expired) return 'Hoy este universo tiene una pregunta importante.'
    return `Faltan ${timeLeft.days} días, ${timeLeft.hours} horas, ${timeLeft.minutes} minutos y ${timeLeft.seconds} segundos para el gran día.`
  }, [timeLeft])

  const handleYes = () => {
    const savedAnswer = JSON.stringify({ value: 'yes', answeredAt: new Date().toISOString() })
    safeSetItem(STORAGE_KEY, savedAnswer)
    setAnswer(savedAnswer)
  }

  const handleTalk = () => {
    const savedAnswer = JSON.stringify({ value: 'talk', answeredAt: new Date().toISOString() })
    safeSetItem(STORAGE_KEY, savedAnswer)
    setAnswer(savedAnswer)
  }

  const resetQuestion = () => {
    safeRemoveItem(STORAGE_KEY)
    setAnswer('')
  }

  return (
    <section className="section relative py-20" id="pregunta-oficial">
      {/* Glow background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,122,200,0.12),transparent_60%)] pointer-events-none" />

      <article className={`relative max-w-xl mx-auto rounded-[36px] p-10 text-center
        border border-[var(--color-border)] bg-[rgba(12,0,18,0.82)] backdrop-blur-md
        shadow-[0_0_60px_rgba(255,122,200,0.12),0_12px_34px_rgba(0,0,0,0.28)]
        ${accepted ? 'border-[rgba(255,122,200,0.35)]' : ''}`}>

        <div className="w-20 h-20 mx-auto mb-6 rounded-full grid place-items-center
          bg-gradient-to-br from-pink to-red shadow-[0_0_45px_rgba(255,122,200,0.45)] text-white">
          {accepted ? <Sparkles size={34} /> : <Heart size={34} />}
        </div>

        {!parsedAnswer && (
          <>
            <span className="inline-block text-pink uppercase tracking-[2px] font-black text-xs mb-3">
              {proposal.eyebrow}
            </span>
            <h2 className="font-display text-[clamp(2rem,5vw,2.8rem)] mb-4 text-white-soft">{proposal.title}</h2>
            <p className="text-muted mb-3 leading-relaxed">{proposal.intro}</p>
            <p className="text-muted mb-6 leading-relaxed">{proposal.beforeQuestion}</p>

            <div className="text-[clamp(1.3rem,3vw,1.8rem)] font-display italic font-bold text-white-soft
              py-6 px-4 my-6 mx-auto max-w-md rounded-2xl
              border border-[rgba(255,122,200,0.25)] bg-[rgba(255,122,200,0.06)]">
              {proposal.question}
            </div>

            <div className="inline-block px-6 py-3 rounded-full bg-[rgba(255,122,200,0.08)]
              border border-[rgba(255,122,200,0.2)] text-pink-soft font-semibold text-sm mb-8">
              {countdownText}
            </div>

            <div className="flex flex-wrap justify-center gap-4">
              <button className="main-button flex items-center gap-2" onClick={handleYes}>
                <Heart size={18} />{proposal.yesButton}
              </button>
              <button className="ghost-button flex items-center gap-2" onClick={handleTalk}>
                <MessageCircleHeart size={18} />{proposal.talkButton}
              </button>
            </div>

            <p className="mt-6 text-xs text-muted/60">El resto de este universo se desbloquea cuando respondas que sí.</p>
          </>
        )}

        {accepted && (
          <div className="py-4">
            <span className="inline-block text-pink uppercase tracking-[2px] font-black text-xs mb-3">Respuesta guardada</span>
            <h2 className="font-display text-[clamp(2rem,5vw,2.8rem)] mb-4">{proposal.yesTitle}</h2>
            <p className="text-muted mb-6 leading-relaxed">{proposal.yesMessage}</p>
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full
              bg-gradient-to-r from-pink to-red text-white font-black text-sm shadow-[0_0_20px_rgba(255,122,200,0.3)]">
              <Heart size={18} /><span>Oficialmente</span>
            </div>
            <p className="mt-6 text-xs text-muted/50">{proposal.savedFooter}</p>
          </div>
        )}

        {wantsToTalk && (
          <div className="py-4">
            <span className="inline-block text-pink uppercase tracking-[2px] font-black text-xs mb-3">Respuesta pendiente</span>
            <h2 className="font-display text-[clamp(2rem,5vw,2.8rem)] mb-4">Entonces lo hablamos bonito</h2>
            <p className="text-muted mb-6 leading-relaxed">{proposal.talkMessage}</p>

            <div className="inline-block px-6 py-3 rounded-full bg-[rgba(255,122,200,0.08)]
              border border-[rgba(255,122,200,0.2)] text-pink-soft font-semibold text-sm mb-8">
              El universo seguirá esperando aquí, sin desbloquearse todavía.
            </div>

            <div className="flex flex-wrap justify-center gap-4">
              <button className="main-button flex items-center gap-2" onClick={handleYes}>
                <Heart size={18} />Sí, quiero
              </button>
              <button className="ghost-button flex items-center gap-2" onClick={resetQuestion}>
                <RotateCcw size={18} />Volver a la pregunta
              </button>
            </div>
          </div>
        )}
      </article>
    </section>
  )
}

export default ProposalSection

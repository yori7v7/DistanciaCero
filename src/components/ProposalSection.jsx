import { useEffect, useMemo, useState } from 'react'
import { Heart, MessageCircleHeart, Sparkles, RotateCcw } from 'lucide-react'
import proposal from '../data/proposal.json'

const STORAGE_KEY = 'distancia-cero-proposal-answer'

function getTimeLeft(targetDate) {
  const now = new Date()
  const target = new Date(targetDate)
  const diff = target.getTime() - now.getTime()

  if (diff <= 0) {
    return {
      expired: true,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    }
  }

  const secondsTotal = Math.floor(diff / 1000)
  const days = Math.floor(secondsTotal / (60 * 60 * 24))
  const hours = Math.floor((secondsTotal / (60 * 60)) % 24)
  const minutes = Math.floor((secondsTotal / 60) % 60)
  const seconds = secondsTotal % 60

  return {
    expired: false,
    days,
    hours,
    minutes,
    seconds,
  }
}

function safeParseAnswer(answer) {
  try {
    return answer ? JSON.parse(answer) : null
  } catch {
    return null
  }
}

function ProposalSection() {
  const [answer, setAnswer] = useState(() => {
    return localStorage.getItem(STORAGE_KEY) || ''
  })

  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(proposal.proposalDate))

  const parsedAnswer = safeParseAnswer(answer)
  const accepted = parsedAnswer?.value === 'yes'
  const wantsToTalk = parsedAnswer?.value === 'talk'
  const gateLocked = !accepted

  useEffect(() => {
    document.body.classList.toggle('proposal-gate-active', gateLocked)

    return () => {
      document.body.classList.remove('proposal-gate-active')
    }
  }, [gateLocked])

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeLeft(proposal.proposalDate))
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const countdownText = useMemo(() => {
    if (timeLeft.expired) return 'Hoy este universo tiene una pregunta importante.'

    return `Faltan ${timeLeft.days} días, ${timeLeft.hours} horas, ${timeLeft.minutes} minutos y ${timeLeft.seconds} segundos para el 17 de mayo.`
  }, [timeLeft])

  const handleYes = () => {
    const savedAnswer = JSON.stringify({
      value: 'yes',
      answeredAt: new Date().toISOString(),
    })

    localStorage.setItem(STORAGE_KEY, savedAnswer)
    setAnswer(savedAnswer)
  }

  const handleTalk = () => {
    const savedAnswer = JSON.stringify({
      value: 'talk',
      answeredAt: new Date().toISOString(),
    })

    localStorage.setItem(STORAGE_KEY, savedAnswer)
    setAnswer(savedAnswer)
  }

  const resetQuestion = () => {
    localStorage.removeItem(STORAGE_KEY)
    setAnswer('')
  }

  return (
    <section className={`section proposal-section ${gateLocked ? 'proposal-locked' : 'proposal-unlocked'}`} id="pregunta-oficial">
      <article className={`proposal-card fade-up ${accepted ? 'accepted' : ''}`}>
        <div className="proposal-glow"></div>

        <div className="proposal-icon">
          {accepted ? <Sparkles size={34} /> : <Heart size={34} />}
        </div>

        {!parsedAnswer && (
          <>
            <span className="proposal-eyebrow">{proposal.eyebrow}</span>

            <h2>{proposal.title}</h2>

            <p>{proposal.intro}</p>
            <p>{proposal.beforeQuestion}</p>

            <div className="proposal-question">
              {proposal.question}
            </div>

            <div className="proposal-countdown">
              {countdownText}
            </div>

            <div className="proposal-actions">
              <button className="main-button proposal-yes" onClick={handleYes}>
                <Heart size={18} />
                {proposal.yesButton}
              </button>

              <button className="ghost-button proposal-talk" onClick={handleTalk}>
                <MessageCircleHeart size={18} />
                {proposal.talkButton}
              </button>
            </div>

            <p className="proposal-note">
              El resto de este universo se desbloquea cuando respondas que sí.
            </p>
          </>
        )}

        {accepted && (
          <div className="proposal-result">
            <span className="proposal-eyebrow">Respuesta guardada</span>
            <h2>{proposal.yesTitle}</h2>
            <p>{proposal.yesMessage}</p>
            <div className="proposal-official-badge">
              <Heart size={18} />
              <span>Ale & Yori oficialmente</span>
            </div>
            <small>{proposal.savedFooter}</small>
          </div>
        )}

        {wantsToTalk && (
          <div className="proposal-result">
            <span className="proposal-eyebrow">Respuesta pendiente</span>
            <h2>Entonces lo hablamos bonito</h2>
            <p>{proposal.talkMessage}</p>

            <div className="proposal-countdown">
              El universo seguirá esperando aquí, sin desbloquearse todavía.
            </div>

            <div className="proposal-actions">
              <button className="main-button proposal-yes" onClick={handleYes}>
                <Heart size={18} />
                Sí, mi Yori
              </button>

              <button className="ghost-button proposal-talk" onClick={resetQuestion}>
                <RotateCcw size={18} />
                Volver a la pregunta
              </button>
            </div>
          </div>
        )}
      </article>
    </section>
  )
}

export default ProposalSection
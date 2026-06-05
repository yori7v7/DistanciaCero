import { useState, useEffect } from 'react'
import SectionTitle from './SectionTitle'
import { ShieldAlert, Trash2, Power, Lock, Check, BookOpen } from 'lucide-react'
import monthlyLetters from '../data/monthlyLetters.json'
import openWhen from '../data/openWhen.json'

function CentroUniversoSection() {
  const [isSimUnlocked, setIsSimUnlocked] = useState(false)
  
  useEffect(() => {
    setIsSimUnlocked(localStorage.getItem('distancia-cero-sim-unlocked') === '1')
  }, [])

  // Map open when cards to lock 'special day' card just like the section does
  const mappedOpenWhen = openWhen.map((card) => {
    if (card.mood === 'Abrir cuando sea un día especial') {
      return { ...card, locked: true }
    }
    return card
  })

  // Calculation for Monthly Letters stats
  const totalMonthly = monthlyLetters.length
  const openedMonthly = monthlyLetters.filter(
    (l) => localStorage.getItem(`distancia-cero-monthly-letter-${l.id}`) === 'opened'
  ).length
  const unlockedMonthly = monthlyLetters.filter((l) => !l.locked).length
  const lockedMonthly = totalMonthly - unlockedMonthly

  // Calculation for Open When Letters stats
  const totalOpenWhen = mappedOpenWhen.length
  const openedOpenWhen = mappedOpenWhen.filter(
    (c) => localStorage.getItem(`distancia-cero-open-when-${c.id}`) === 'opened'
  ).length
  const unlockedOpenWhen = mappedOpenWhen.filter((c) => !c.locked).length
  const lockedOpenWhen = totalOpenWhen - unlockedOpenWhen

  const toggleSimulation = () => {
    if (isSimUnlocked) {
      localStorage.removeItem('distancia-cero-sim-unlocked')
    } else {
      localStorage.setItem('distancia-cero-sim-unlocked', '1')
    }
    window.location.reload()
  }

  const handleReset = () => {
    if (
      window.confirm(
        '¿Seguro que quieres borrar el progreso de lectura de las cartas? Esto no afectará la música ni otras configuraciones locales.'
      )
    ) {
      monthlyLetters.forEach((l) => {
        localStorage.removeItem(`distancia-cero-monthly-letter-${l.id}`)
      })
      openWhen.forEach((c) => {
        localStorage.removeItem(`distancia-cero-open-when-${c.id}`)
      })
      localStorage.removeItem('distancia-cero-sim-unlocked')
      window.location.reload()
    }
  }

  return (
    <section id="centro-universo" className="section centro-universo-section">
      <SectionTitle
        eyebrow="Panel de Control"
        title="Centro del Universo"
        text="Rinconcito de administración local y depuración para Diego & Ale."
      />

      {isSimUnlocked && (
        <div className="simulation-active-banner">
          <ShieldAlert size={18} />
          <span>
            <strong>Modo de pruebas activo</strong>: Se simula que todas las cartas están desbloqueadas.
          </span>
        </div>
      )}

      <div className="control-grid">
        {/* Monthly Letters Stats Panel */}
        <div className="control-card">
          <h3>Cartas Mensuales</h3>
          <div className="control-stats">
            <div className="stat-item">
              <span className="stat-label">Total en base</span>
              <span className="stat-value">{totalMonthly}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label flex-label">
                <BookOpen size={14} className="icon-available" /> Desbloqueadas
              </span>
              <span className="stat-value">{unlockedMonthly}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label flex-label">
                <Lock size={14} className="icon-locked" /> Bloqueadas
              </span>
              <span className="stat-value">{lockedMonthly}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label flex-label">
                <Check size={14} className="icon-opened" /> Abiertas / Leídas
              </span>
              <span className="stat-value text-pink">{openedMonthly}</span>
            </div>
          </div>
        </div>

        {/* Open When Stats Panel */}
        <div className="control-card">
          <h3>Cartas Abrir Cuando</h3>
          <div className="control-stats">
            <div className="stat-item">
              <span className="stat-label">Total en base</span>
              <span className="stat-value">{totalOpenWhen}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label flex-label">
                <BookOpen size={14} className="icon-available" /> Desbloqueadas
              </span>
              <span className="stat-value">{unlockedOpenWhen}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label flex-label">
                <Lock size={14} className="icon-locked" /> Bloqueadas
              </span>
              <span className="stat-value">{lockedOpenWhen}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label flex-label">
                <Check size={14} className="icon-opened" /> Abiertas / Leídas
              </span>
              <span className="stat-value text-pink">{openedOpenWhen}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="control-actions">
        <button
          className={`control-btn ${isSimUnlocked ? 'active-sim' : 'inactive-sim'}`}
          onClick={toggleSimulation}
          type="button"
        >
          <Power size={18} />
          {isSimUnlocked ? 'Desactivar Modo Prueba' : 'Activar Modo Prueba'}
        </button>

        <button className="control-btn reset-btn" onClick={handleReset} type="button">
          <Trash2 size={18} />
          Resetear Progreso
        </button>
      </div>
    </section>
  )
}

export default CentroUniversoSection

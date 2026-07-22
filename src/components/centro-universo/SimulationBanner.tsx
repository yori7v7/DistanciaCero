import { ShieldAlert, Power } from 'lucide-react'

interface SimulationBannerProps {
  isSimUnlocked: boolean
  onToggle: () => void
}

export default function SimulationBanner({ isSimUnlocked, onToggle }: SimulationBannerProps) {
  if (!isSimUnlocked) return null

  return (
    <div className="simulation-banner">
      <div className="sim-banner-content">
        <ShieldAlert size={20} />
        <div>
          <strong>Modo simulación activado</strong>
          <p>Todas las cartas están desbloqueadas temporalmente. Al desactivarlo, volverán a su estado original.</p>
        </div>
        <button type="button" className="control-btn sim-off-btn" onClick={onToggle}>
          <Power size={16} /> Desactivar
        </button>
      </div>
    </div>
  )
}

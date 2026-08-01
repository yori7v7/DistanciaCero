import { Mail, MailOpen, Lock, Check, BookOpen } from 'lucide-react'

interface LetterStats {
  total: number
  opened: number
  unlocked: number
  locked: number
}

interface LetterStatsPanelProps {
  monthlyStats: LetterStats
  openWhenStats: LetterStats
  onNavigate?: (moduleId: string) => void
}

function StatCard({ icon: Icon, value, label, accent = false, onClick }: {
  icon: React.ComponentType<{ size: number }>
  value: number
  label: string
  accent?: boolean
  onClick?: () => void
}) {
  return (
    <div
      className={`stat-card ${accent ? 'stat-card-accent' : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick() } } : undefined}
    >
      <Icon size={18} />
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  )
}

export default function LetterStatsPanel({ monthlyStats, openWhenStats, onNavigate }: LetterStatsPanelProps) {
  return (
    <div className="letter-stats-panel">
      {/* Monthly Letters Stats */}
      <div className="stats-group">
        <div className="stats-group-header">
          <Mail size={16} />
          <h4>Cartas Mensuales</h4>
        </div>
        <div className="stats-row">
          <StatCard icon={Mail} value={monthlyStats.total} label="Total" onClick={() => onNavigate?.('monthlyLetters')} />
          <StatCard icon={MailOpen} value={monthlyStats.opened} label="Abiertas" accent onClick={() => onNavigate?.('monthlyLetters')} />
          <StatCard icon={Check} value={monthlyStats.unlocked} label="Desbloq." onClick={() => onNavigate?.('monthlyLetters')} />
          <StatCard icon={Lock} value={monthlyStats.locked} label="Bloqueadas" onClick={() => onNavigate?.('monthlyLetters')} />
        </div>
      </div>

      {/* Open When Letters Stats */}
      <div className="stats-group">
        <div className="stats-group-header">
          <BookOpen size={16} />
          <h4>Abrir Cuando...</h4>
        </div>
        <div className="stats-row">
          <StatCard icon={BookOpen} value={openWhenStats.total} label="Total" onClick={() => onNavigate?.('openWhenLetters')} />
          <StatCard icon={MailOpen} value={openWhenStats.opened} label="Abiertas" accent onClick={() => onNavigate?.('openWhenLetters')} />
          <StatCard icon={Check} value={openWhenStats.unlocked} label="Desbloq." onClick={() => onNavigate?.('openWhenLetters')} />
          <StatCard icon={Lock} value={openWhenStats.locked} label="Bloqueadas" onClick={() => onNavigate?.('openWhenLetters')} />
        </div>
      </div>
    </div>
  )
}

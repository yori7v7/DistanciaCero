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
}

function StatCard({ icon: Icon, value, label, accent = false }: {
  icon: React.ComponentType<{ size: number }>
  value: number
  label: string
  accent?: boolean
}) {
  return (
    <div className={`stat-card ${accent ? 'stat-card-accent' : ''}`}>
      <Icon size={18} />
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  )
}

export default function LetterStatsPanel({ monthlyStats, openWhenStats }: LetterStatsPanelProps) {
  return (
    <div className="letter-stats-panel">
      {/* Monthly Letters Stats */}
      <div className="stats-group">
        <div className="stats-group-header">
          <Mail size={16} />
          <h4>Cartas Mensuales</h4>
        </div>
        <div className="stats-row">
          <StatCard icon={Mail} value={monthlyStats.total} label="Total" />
          <StatCard icon={MailOpen} value={monthlyStats.opened} label="Abiertas" accent />
          <StatCard icon={Check} value={monthlyStats.unlocked} label="Desbloq." />
          <StatCard icon={Lock} value={monthlyStats.locked} label="Bloqueadas" />
        </div>
      </div>

      {/* Open When Letters Stats */}
      <div className="stats-group">
        <div className="stats-group-header">
          <BookOpen size={16} />
          <h4>Abrir Cuando...</h4>
        </div>
        <div className="stats-row">
          <StatCard icon={BookOpen} value={openWhenStats.total} label="Total" />
          <StatCard icon={MailOpen} value={openWhenStats.opened} label="Abiertas" accent />
          <StatCard icon={Check} value={openWhenStats.unlocked} label="Desbloq." />
          <StatCard icon={Lock} value={openWhenStats.locked} label="Bloqueadas" />
        </div>
      </div>
    </div>
  )
}

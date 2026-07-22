interface CrudStatButtonProps {
  filter: string
  value: number
  label: string
  activeFilter: string
  onClick: (filter: string) => void
}

export default function CrudStatButton({ filter, value, label, activeFilter, onClick }: CrudStatButtonProps) {
  return (
    <button
      type="button"
      className={`crud-stat-button ${activeFilter === filter ? 'is-active' : ''}`}
      onClick={() => onClick(filter)}
    >
      <strong>{value}</strong>
      <span>{label}</span>
    </button>
  )
}

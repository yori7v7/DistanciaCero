export default function CrudStatButton({ filter, value, label, activeFilter, onClick }) {
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

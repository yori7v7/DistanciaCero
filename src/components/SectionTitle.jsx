function SectionTitle({ eyebrow, title, text }) {
  return (
    <div className="section-title fade-up">
      <span>{eyebrow}</span>
      <h2>{title}</h2>
      {text && <p>{text}</p>}
    </div>
  )
}

export default SectionTitle

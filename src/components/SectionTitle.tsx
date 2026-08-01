interface SectionTitleProps {
  eyebrow: string
  title: string
  text?: string
}

function SectionTitle({ eyebrow, title, text }: SectionTitleProps) {
  return (
    <div className="text-center mb-16 animate-[fade-up_0.6s_ease_both]">
      <span className="pill mb-5">
        {eyebrow}
      </span>
      <h2 className="font-display text-[clamp(2rem,5vw,3.2rem)] font-black text-white-soft mb-5 leading-tight">
        {title}
      </h2>
      {text && (
        <p className="max-w-[640px] mx-auto text-muted text-base leading-relaxed">
          {text}
        </p>
      )}
    </div>
  )
}

export default SectionTitle

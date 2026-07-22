interface SectionTitleProps {
  eyebrow: string
  title: string
  text?: string
}

function SectionTitle({ eyebrow, title, text }: SectionTitleProps) {
  return (
    <div className="text-center mb-12 animate-[fade-up_0.6s_ease_both]">
      <span className="inline-block text-pink uppercase tracking-[2px] font-black text-xs mb-2">
        {eyebrow}
      </span>
      <h2 className="font-display text-[clamp(2rem,6vw,3rem)] text-white-soft mb-4">
        {title}
      </h2>
      {text && (
        <p className="max-w-[600px] mx-auto text-muted text-base leading-relaxed">
          {text}
        </p>
      )}
    </div>
  )
}

export default SectionTitle

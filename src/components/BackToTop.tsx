import { useEffect, useState } from 'react'
import { ArrowUp } from 'lucide-react'

function BackToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 700)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll)

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const goTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  return (
    <button
      className={`fixed right-4 bottom-20 z-42 w-12 h-12 rounded-full
        border border-[var(--color-border)] grid place-items-center
        bg-[rgba(10,0,16,0.88)] text-pink-soft cursor-pointer
        shadow-[0_0_20px_rgba(255,122,200,0.12)]
        transition-all duration-250 ease
        hover:bg-gradient-to-br hover:from-[var(--color-pink)] hover:to-[var(--color-red)] hover:text-white
        ${visible ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-3 pointer-events-none'}`}
      onClick={goTop}
      aria-label="Volver arriba"
    >
      <ArrowUp size={18} />
    </button>
  )
}

export default BackToTop

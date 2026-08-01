import { useEffect, useState } from 'react'
import { ArrowUp } from 'lucide-react'

function BackToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 700)
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <button
      className={`fixed right-5 bottom-24 z-40 w-11 h-11 rounded-full grid place-items-center
        bg-[rgba(10,0,16,0.9)] border border-[rgba(255,255,255,0.1)]
        text-pink-soft cursor-pointer backdrop-blur-sm
        shadow-[0_0_20px_rgba(255,122,200,0.12)]
        transition-all duration-300 ease-out
        hover:bg-gradient-to-br hover:from-pink hover:to-red hover:text-white hover:shadow-[0_0_35px_rgba(255,122,200,0.3)]
        ${visible ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'}`}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Volver arriba"
    >
      <ArrowUp size={18} />
    </button>
  )
}

export default BackToTop

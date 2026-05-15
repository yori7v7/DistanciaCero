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
      className={`back-to-top ${visible ? 'show' : ''}`}
      onClick={goTop}
      aria-label="Volver arriba"
    >
      <ArrowUp size={18} />
    </button>
  )
}

export default BackToTop
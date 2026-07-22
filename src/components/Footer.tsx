import { Heart } from 'lucide-react'

function Footer() {
  return (
    <footer className="text-center py-16 border-t border-[rgba(255,255,255,0.06)]">
      <p className="text-white-soft font-display text-2xl font-black mb-3">
        Hecho con distancia cero
        <Heart size={18} className="inline-block ml-2 text-pink animate-[pulse-heart_2s_ease-in-out_infinite]" />
      </p>
      <p className="text-muted text-sm">Este universo apenas está empezando.</p>
    </footer>
  )
}

export default Footer

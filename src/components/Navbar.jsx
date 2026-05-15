import { Heart } from 'lucide-react'

function Navbar() {
  return (
    <header className="navbar">
      <a href="#inicio" className="logo">
        <Heart size={20} />
        <span>Distancia Cero</span>
      </a>

      <nav className="nav-links">
        <a href="#universo">Universo</a>
        <a href="#cartas">Cartas</a>
        <a href="#playlist">Música</a>
        <a href="#razones">100 razones</a>
        <a href="#distancia">Distancia</a>
      </nav>
    </header>
  )
}

export default Navbar
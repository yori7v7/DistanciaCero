import { useState } from 'react'
import { Heart, LogOut, User } from 'lucide-react'
import { signOut as supabaseSignOut, isSupabaseAuthenticated } from '../services/supabaseAuthService'
import { isRemoteContentEnabled } from '../integrations/supabase/client'

function Navbar() {
  const [loggingOut, setLoggingOut] = useState(false)
  const remoteEnabled = isRemoteContentEnabled()
  const isLoggedIn = remoteEnabled && isSupabaseAuthenticated()

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await supabaseSignOut()
      window.location.reload()
    } catch (_) {
      setLoggingOut(false)
    }
  }

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

      {isLoggedIn && (
        <button
          className="navbar__logout"
          onClick={handleLogout}
          disabled={loggingOut}
          title="Cerrar sesión"
          aria-label="Cerrar sesión"
        >
          {loggingOut ? (
            <span className="navbar__logout-spinner" />
          ) : (
            <LogOut size={16} />
          )}
        </button>
      )}
    </header>
  )
}

export default Navbar
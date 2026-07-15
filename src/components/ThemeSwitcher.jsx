import { useEffect, useState } from 'react'
import { Heart, Moon, Sparkles, Palette, X } from 'lucide-react'

const themes = [
  {
    id: 'theme-default',
    label: 'Normal',
    icon: <Sparkles size={15} />
  },
  {
    id: 'theme-light',
    label: 'Modo Claro',
    icon: <Heart size={15} />
  },
  {
    id: 'theme-dark',
    label: 'Modo Oscuro',
    icon: <Moon size={15} />
  },
  {
    id: 'theme-hug',
    label: 'Modo abrazo',
    icon: <Heart size={15} />
  }
]

function ThemeSwitcher() {
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem('distancia-cero-theme')
    // Migrate old theme names to new defaults
    if (stored === 'theme-ale') return 'theme-light'
    if (stored === 'theme-yori') return 'theme-dark'
    return stored || 'theme-default'
  })

  const [open, setOpen] = useState(false)

  useEffect(() => {
    document.body.classList.remove('theme-default', 'theme-light', 'theme-dark', 'theme-hug', 'theme-ale', 'theme-yori')
    document.body.classList.add(theme)
    localStorage.setItem('distancia-cero-theme', theme)
  }, [theme])

  return (
    <div className="theme-switcher-wrap">
      <button
        className={`theme-fab ${open ? 'active' : ''}`}
        onClick={() => setOpen(!open)}
        aria-label="Abrir selector de tema"
      >
        {open ? <X size={18} /> : <Palette size={18} />}
      </button>

      <aside className={`theme-switcher-panel ${open ? 'open' : ''}`}>
        <div className="theme-switcher-header">
          <span>Modo visual</span>
          <small>Elige el vibe del universo</small>
        </div>

        <div className="theme-switcher-options">
          {themes.map((option) => (
            <button
              key={option.id}
              className={theme === option.id ? 'active' : ''}
              onClick={() => {
                setTheme(option.id)
                setOpen(false)
              }}
            >
              {option.icon}
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      </aside>
    </div>
  )
}

export default ThemeSwitcher
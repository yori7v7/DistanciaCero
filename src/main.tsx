import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom'
import App from './App'
import PublicLanding from './components/PublicLanding'
import { AudioProvider } from './context/AudioContext'

import './styles/tailwind.css'

const resetParams = new URLSearchParams(window.location.search)

if (resetParams.get('reset') === '1') {
  if (window.confirm('¿Seguro que quieres restablecer todos los datos locales? Se borrará todo el contenido guardado (cartas, razones, playlist, etc.). Esta acción no se puede deshacer.')) {
    localStorage.clear()
    sessionStorage.clear()
    window.history.replaceState({}, document.title, window.location.pathname)
    window.location.reload()
  } else {
    window.history.replaceState({}, document.title, window.location.pathname)
    window.location.reload()
  }
}

function AppRoutes() {
  const navigate = useNavigate()

  return (
    <Routes>
      <Route
        path="/"
        element={
          <PublicLanding onEnter={() => navigate('/app')} />
        }
      />
      <Route
        path="/app"
        element={
          <AudioProvider>
            <App />
          </AudioProvider>
        }
      />
    </Routes>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter basename={import.meta.env.VITE_BASE || '/'}>
      <AppRoutes />
    </BrowserRouter>
  </React.StrictMode>,
)

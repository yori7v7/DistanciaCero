import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom'
import App from './App.jsx'
import PublicLanding from './components/PublicLanding'
import { AudioProvider } from './context/AudioContext.jsx'

import './styles/global.css'
import './styles/animations.css'
import './styles/responsive.css'
import './styles/extra-sections.css'
import './styles/universe-interactive.css'
import './styles/ui-expansions.css'
import './styles/final-polish.css'
import './styles/proposal.css'
import './styles/proposal-gate.css'
import './styles/relationship-refactor.css'
import './styles/final-user-polish.css'
import './styles/final-adjustments.css'
import './styles/chaotic-reasons.css'
import './styles/coming-soon-universe.css'
import './styles/audio-sync.css'
import './styles/scene-music-controller.css'
import './styles/scene-mode.css'
import './styles/diary-story.css'
import './styles/true-3d.css'
import './styles/blackhole-gallery.css'
import './styles/auth-gate.css'
import './styles/file-uploader.css'
import './styles/public-landing.css'
import './styles/clay-3d.css'

const resetParams = new URLSearchParams(window.location.search)

if (resetParams.get('reset') === '1') {
  localStorage.clear()
  sessionStorage.clear()
  window.history.replaceState({}, document.title, window.location.pathname)
  window.location.reload()
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

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter basename={import.meta.env.VITE_BASE || '/'}>
      <AppRoutes />
    </BrowserRouter>
  </React.StrictMode>,
)

import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  ChevronLeft, ChevronRight, Clock, Heart, Home, Images, Infinity, MapPin, MessageCircle,
  Music2, Settings, ShieldAlert, Sparkles, Star, LogOut, X
} from 'lucide-react'
import scenesData from '../data/scenes.json'
import { signOut as supabaseSignOut, isSupabaseAuthenticated } from '../services/supabaseAuthService'
import { isRemoteContentEnabled } from '../integrations/supabase/client'

const SCENE_STORAGE_KEY = 'distancia-cero-active-scene'
const CENTRO_VISIBLE_KEY = 'distancia-cero-centro-visible'

const iconMap: Record<string, any> = {
  inicio: Home,
  universo: Sparkles,
  entrelazados: Infinity,
  historia: Clock,
  galeria: Images,
  razones: Heart,
  cartas: MessageCircle,
  musica: Music2,
  promesas: Star,
  distancia: MapPin,
  'centro-universo': ShieldAlert
}

function getInitialSceneId(scenes: any[], hash: string) {
  const cleanHash = hash.replace('#/', '').replace('#', '').trim()
  const stored = _sG(SCENE_STORAGE_KEY)
  if (cleanHash && scenes.some((s: any) => s.id === cleanHash && s.id !== 'centro-universo')) return cleanHash
  if (stored && scenes.some((s: any) => s.id === stored && s.id !== 'centro-universo')) return stored
  return scenes.find((s: any) => s.id !== 'centro-universo')?.id || 'inicio'
}

function getSectionElements() {
  return Array.from(document.querySelectorAll('section.section, section.hero'))
}

const _sG = (k: string) => { try { return localStorage.getItem(k) } catch { return null } }
const _sS = (k: string, v: string) => { try { localStorage.setItem(k, v) } catch { /* degraded */ } }

function SceneModeController() {
  const location = useLocation()
  const navigate = useNavigate()

  const scenes = useMemo(() => Array.isArray(scenesData) ? scenesData : [], [])
  // Filter out centro-universo from main navigation
  const navScenes = useMemo(() => scenes.filter((s: any) => s.id !== 'centro-universo'), [scenes])
  const [activeSceneId, setActiveSceneId] = useState(() => getInitialSceneId(scenes, location.hash))
  const [navPulse, setNavPulse] = useState(false)
  const [navDirection, setNavDirection] = useState('next')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [centroVisible, setCentroVisible] = useState(() =>
    _sG(CENTRO_VISIBLE_KEY) === 'true'
  )
  const [loggingOut, setLoggingOut] = useState(false)

  const firstRunRef = useRef(true)
  const linkRefs = useRef({})
  const settingsRef = useRef(null)

  const remoteEnabled = isRemoteContentEnabled()
  const isLoggedIn = remoteEnabled && isSupabaseAuthenticated()
  const centroScene = scenes.find((s) => s.id === 'centro-universo')

  const activeIndex = Math.max(0, navScenes.findIndex((s) => s.id === activeSceneId))
  const activeScene = navScenes[activeIndex] || navScenes[0]
  const ActiveIcon = iconMap[activeScene?.id] || Sparkles

  // Stable refs for MutationObserver (avoids stale closures)
  const activeSceneRef = useRef(activeScene)
  activeSceneRef.current = activeScene
  const centroVisibleRef = useRef(centroVisible)
  centroVisibleRef.current = centroVisible
  const centroSceneRef = useRef(centroScene)
  centroSceneRef.current = centroScene

  // Close settings on outside click
  useEffect(() => {
    if (!settingsOpen) return
    const handler = (e) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target)) {
        setSettingsOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [settingsOpen])

  // Scene mode init
  useEffect(() => {
    document.body.classList.add('scene-mode-enabled')
    return () => {
      document.body.classList.remove('scene-mode-enabled')
      getSectionElements().forEach((el) => {
        el.classList.remove('scene-hidden', 'scene-visible')
        el.removeAttribute('aria-hidden')
      })
    }
  }, [])

  // Hash change via react-router location
  useEffect(() => {
    const hash = location.hash.replace('#/', '').replace('#', '').trim()
    if (hash && navScenes.some((s: any) => s.id === hash)) setActiveSceneId(hash)
  }, [location.hash, navScenes])

  // Scene change effect
  useEffect(() => {
    if (!activeScene) return
    // Include centro sections if visible
    const activeIds = new Set(activeScene.sectionIds || [])
    if (centroVisible && centroScene) {
      centroScene.sectionIds?.forEach((id) => activeIds.add(id))
    }
    const allSections = getSectionElements()
    _sS(SCENE_STORAGE_KEY, activeScene.id)

    if (location.hash !== `#/${activeScene.id}`) {
      navigate(`#/${activeScene.id}`, { replace: true })
    }

    allSections.forEach((el) => {
      const shouldShow = activeIds.has(el.id)
      el.classList.toggle('scene-visible', shouldShow)
      el.classList.toggle('scene-hidden', !shouldShow)
      el.setAttribute('aria-hidden', shouldShow ? 'false' : 'true')
    })

    window.dispatchEvent(new CustomEvent('distancia-cero-scene-change', {
      detail: { sceneId: activeScene.musicSectionId || activeScene.id, appSceneId: activeScene.id }
    }))

    const firstVisible = allSections.find((el) => activeIds.has(el.id))
    setTimeout(() => {
      centerActiveLink(!firstRunRef.current)
      if (firstVisible) {
        firstVisible.scrollIntoView({ behavior: firstRunRef.current ? 'auto' : 'smooth', block: 'start' })
      } else {
        window.scrollTo({ top: 0, behavior: firstRunRef.current ? 'auto' : 'smooth' })
      }
      firstRunRef.current = false
    }, 90)

    setNavPulse(true)
    const timer = setTimeout(() => setNavPulse(false), 520)
    return () => clearTimeout(timer)
  }, [activeScene, centroVisible])

  // Re-apply visibility when lazy sections mount (e.g., direct URL access to /app#/universo)
  // The initial scene-change effect only finds eagerly-loaded sections; lazy sections
  // mount later via React.Suspense and need their visibility class applied then.
  useEffect(() => {
    const main = document.querySelector('main')
    if (!main) return

    const applyVisibility = () => {
      const scene = activeSceneRef.current
      if (!scene) return
      const activeIds = new Set(scene.sectionIds || [])
      if (centroVisibleRef.current && centroSceneRef.current) {
        centroSceneRef.current.sectionIds?.forEach((id: string) => activeIds.add(id))
      }
      getSectionElements().forEach((el) => {
        const shouldShow = activeIds.has(el.id)
        el.classList.toggle('scene-visible', shouldShow)
        el.classList.toggle('scene-hidden', !shouldShow)
        el.setAttribute('aria-hidden', shouldShow ? 'false' : 'true')
      })
    }

    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        for (const node of m.addedNodes) {
          if (node instanceof HTMLElement) {
            if (node.matches?.('section.section, section.hero') ||
                node.querySelector?.('section.section, section.hero')) {
              applyVisibility()
              return
            }
          }
        }
      }
    })

    observer.observe(main, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [])

  // Persist centro visibility preference
  useEffect(() => {
    _sS(CENTRO_VISIBLE_KEY, centroVisible ? 'true' : 'false')
  }, [centroVisible])

  const centerActiveLink = (smooth = true) => {
    const btn = linkRefs.current[activeScene?.id]
    if (!btn) return
    btn.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', inline: 'center', block: 'nearest' })
  }

  const goToScene = (sceneId, direction = 'next') => {
    if (!navScenes.some((s) => s.id === sceneId)) return
    setNavDirection(direction)
    setActiveSceneId(sceneId)
  }

  const goPrev = () => {
    const idx = activeIndex <= 0 ? navScenes.length - 1 : activeIndex - 1
    goToScene(navScenes[idx].id, 'prev')
  }

  const goNext = () => {
    const idx = activeIndex >= navScenes.length - 1 ? 0 : activeIndex + 1
    goToScene(navScenes[idx].id, 'next')
  }

  const toggleCentro = () => {
    setCentroVisible((v) => !v)
    setSettingsOpen(false)
  }

  // Scroll when Centro is toggled on/off
  const prevCentroRef = useRef(centroVisible)
  useEffect(() => {
    if (prevCentroRef.current === centroVisible) return
    prevCentroRef.current = centroVisible
    setTimeout(() => {
      if (centroVisible) {
        const el = document.getElementById('centro-universo')
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      } else {
        const firstSectionId = activeScene?.sectionIds?.[0]
        if (firstSectionId) {
          const el = document.getElementById(firstSectionId)
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }
    }, 150)
  }, [centroVisible])

  const handleLogout = async () => {
    setLoggingOut(true)
    setSettingsOpen(false)
    try {
      await supabaseSignOut()
      window.location.reload()
    } catch (_) {
      setLoggingOut(false)
    }
  }

  if (!activeScene) return null

  return (
    <nav className={`scene-portal scene-nav-${navDirection} ${navPulse ? 'scene-portal-pulse' : ''}`} aria-label="Navegación principal">
      {/* Scene links */}
      <div className="scene-portal-links">
        {navScenes.map((scene, index) => {
          const Icon = iconMap[scene.id] || Sparkles
          const direction = index >= activeIndex ? 'next' : 'prev'
          return (
            <button
              key={scene.id}
              ref={(el) => { linkRefs.current[scene.id] = el }}
              className={`scene-link ${scene.id === activeSceneId ? 'active' : ''}`}
              type="button"
              onClick={() => goToScene(scene.id, direction)}
            >
              <Icon size={15} />
              {scene.label}
            </button>
          )
        })}
      </div>

      {/* Right side: settings + prev/next */}
      <div className="scene-portal-actions">
        <button type="button" onClick={goPrev} aria-label="Escena anterior" className="scene-nav-arrow">
          <ChevronLeft size={18} />
        </button>

        <button type="button" onClick={goNext} aria-label="Escena siguiente" className="scene-nav-arrow">
          <ChevronRight size={18} />
        </button>

        {/* Settings gear */}
        <div className="scene-settings-wrapper" ref={settingsRef}>
          <button
            type="button"
            className={`scene-settings-gear ${settingsOpen ? 'active' : ''} ${centroVisible ? 'centro-active' : ''}`}
            onClick={() => setSettingsOpen((o) => !o)}
            aria-label="Ajustes"
            aria-expanded={settingsOpen}
            aria-haspopup="menu"
            title="Ajustes"
          >
            <Settings size={18} />
          </button>

          {settingsOpen && (
            <div className="scene-settings-dropdown">
              <div className="scene-settings-dropdown__header">
                <span>Ajustes</span>
                <button onClick={() => setSettingsOpen(false)} aria-label="Cerrar">
                  <X size={14} />
                </button>
              </div>

              <button
                className={`scene-settings-item ${centroVisible ? 'scene-settings-item--active' : ''}`}
                onClick={toggleCentro}
              >
                <ShieldAlert size={16} />
                <div className="scene-settings-item__text">
                  <strong>Centro del Universo</strong>
                  <small>Agregar, editar, ocultar o mover contenido de cada sección</small>
                </div>
                <span className={`scene-settings-toggle ${centroVisible ? 'on' : ''}`}>
                  {centroVisible ? 'ON' : 'OFF'}
                </span>
              </button>

              {isLoggedIn && (
                <button
                  className="scene-settings-item scene-settings-item--logout"
                  onClick={handleLogout}
                  disabled={loggingOut}
                >
                  <LogOut size={16} />
                  <span>{loggingOut ? 'Cerrando...' : 'Cerrar sesión'}</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}

export default SceneModeController

import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  ChevronLeft, ChevronRight, Clock, Heart, Home, Images, Infinity, MapPin, MessageCircle,
  Music2, Settings, ShieldAlert, Sparkles, Star, LogOut, X
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import scenesData from '../data/scenes.json'
import { signOut as supabaseSignOut, isSupabaseAuthenticated } from '../services/supabaseAuthService'
import { isRemoteContentEnabled } from '../integrations/supabase/client'
import { getScrollBehavior } from '../utils/motion'
import { CENTRO_VISIBLE_KEY, SCENE_STORAGE_KEY, resolveSceneId } from '../utils/sceneSelection'

const iconMap: Record<string, LucideIcon> = {
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
  const navScenes = useMemo(() => scenes.filter(s => s.id !== 'centro-universo'), [scenes])
  const activeSceneId = useMemo(() => resolveSceneId(location.hash), [location.hash])
  const [navPulse, setNavPulse] = useState(false)
  const [navDirection, setNavDirection] = useState('next')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [centroVisible, setCentroVisible] = useState(() =>
    _sG(CENTRO_VISIBLE_KEY) === 'true'
  )
  const [loggingOut, setLoggingOut] = useState(false)

  const firstRunRef = useRef(true)
  const linkRefs = useRef({})
  const settingsRef = useRef<HTMLDivElement>(null)
  const settingsButtonRef = useRef<HTMLButtonElement>(null)
  const portalRef = useRef<HTMLElement>(null)

  const remoteEnabled = isRemoteContentEnabled()
  const isLoggedIn = remoteEnabled && isSupabaseAuthenticated()
  const centroScene = scenes.find((s) => s.id === 'centro-universo')

  const activeIndex = Math.max(0, navScenes.findIndex((s) => s.id === activeSceneId))
  const activeScene = navScenes[activeIndex] || navScenes[0]

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
    const onEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      event.preventDefault()
      setSettingsOpen(false)
      settingsButtonRef.current?.focus({ preventScroll: true })
    }
    settingsRef.current?.querySelector<HTMLButtonElement>('.scene-settings-dropdown button')?.focus({ preventScroll: true })
    document.addEventListener('mousedown', handler)
    document.addEventListener('keydown', onEscape)
    return () => {
      document.removeEventListener('mousedown', handler)
      document.removeEventListener('keydown', onEscape)
    }
  }, [settingsOpen])

  useEffect(() => {
    const portal = portalRef.current
    if (!portal) return
    const previousHeight = document.body.style.getPropertyValue('--scene-navigation-height')
    const measure = () => document.body.style.setProperty('--scene-navigation-height', `${portal.getBoundingClientRect().height}px`)
    measure()
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure)
    observer?.observe(portal)
    window.addEventListener('resize', measure)
    return () => {
      observer?.disconnect()
      window.removeEventListener('resize', measure)
      if (previousHeight) document.body.style.setProperty('--scene-navigation-height', previousHeight)
      else document.body.style.removeProperty('--scene-navigation-height')
    }
  }, [])

  // Reveal focus without moving a control between pointer press and click.
  useEffect(() => {
    const pressedPointers = new Set<number>()
    let mousePressed = false
    const beginPointer = (event: PointerEvent) => { pressedPointers.add(event.pointerId) }
    const endPointer = (event: PointerEvent) => { pressedPointers.delete(event.pointerId) }
    const beginMouse = () => { mousePressed = true }
    const endMouse = () => { mousePressed = false }
    const resetPointer = () => { pressedPointers.clear(); mousePressed = false }
    const revealFocus = (event: FocusEvent) => {
      if (pressedPointers.size || mousePressed) return
      const target = event.target
      const portal = portalRef.current
      if (!(target instanceof HTMLElement) || !portal || !target.closest('.app') ||
        target.closest('.scene-portal, .scene-hidden, [inert]')) return
      const rect = target.getBoundingClientRect()
      const safeTop = portal.getBoundingClientRect().bottom + 12
      if (rect.height > 0 && rect.top < safeTop) {
        window.scrollBy({ top: rect.top - safeTop, behavior: 'instant' })
      }
    }
    document.addEventListener('pointerdown', beginPointer, true)
    document.addEventListener('pointerup', endPointer, true)
    document.addEventListener('pointercancel', resetPointer, true)
    // Touch can emit compatibility mouse events after pointerup.
    document.addEventListener('mousedown', beginMouse, true)
    document.addEventListener('mouseup', endMouse, true)
    document.addEventListener('keydown', resetPointer, true)
    document.addEventListener('focusin', revealFocus)
    window.addEventListener('blur', resetPointer)
    return () => {
      document.removeEventListener('pointerdown', beginPointer, true)
      document.removeEventListener('pointerup', endPointer, true)
      document.removeEventListener('pointercancel', resetPointer, true)
      document.removeEventListener('mousedown', beginMouse, true)
      document.removeEventListener('mouseup', endMouse, true)
      document.removeEventListener('keydown', resetPointer, true)
      document.removeEventListener('focusin', revealFocus)
      window.removeEventListener('blur', resetPointer)
    }
  }, [])

  // Scene mode init
  useEffect(() => {
    document.body.classList.add('scene-mode-enabled')
    return () => {
      document.body.classList.remove('scene-mode-enabled')
      getSectionElements().forEach((el) => {
        el.classList.remove('scene-hidden', 'scene-visible')
        el.removeAttribute('aria-hidden')
        el.removeAttribute('inert')
      })
    }
  }, [])

  // The URL selects the scene directly; normalize aliases and invalid hashes.
  useEffect(() => {
    if (activeScene && location.hash !== `#/${activeScene.id}`) {
      navigate(`#/${activeScene.id}`, { replace: true })
    }
  }, [activeScene, location.hash, navigate])

  // Scene change effect
  useEffect(() => {
    if (!activeScene) return
    // Include centro sections if visible
    const activeIds = new Set(activeScene.sectionIds || [])
    if (centroVisible && centroScene) {
      centroScene.sectionIds?.forEach((id) => activeIds.add(id))
    }
    const allSections = getSectionElements()
    const focusWasHidden = allSections.some(el => !activeIds.has(el.id) && el.contains(document.activeElement))
    const focusedDialog = document.activeElement?.closest('[role="dialog"]')
    _sS(SCENE_STORAGE_KEY, activeScene.id)

    allSections.forEach((el) => {
      const shouldShow = activeIds.has(el.id)
      el.classList.toggle('scene-visible', shouldShow)
      el.classList.toggle('scene-hidden', !shouldShow)
      el.setAttribute('aria-hidden', shouldShow ? 'false' : 'true')
      el.toggleAttribute('inert', !shouldShow)
    })
    if (focusWasHidden) linkRefs.current[activeScene.id]?.focus({ preventScroll: true })

    window.dispatchEvent(new CustomEvent('distancia-cero-scene-change', {
      detail: { sceneId: activeScene.musicSectionId || activeScene.id, appSceneId: activeScene.id, centroVisible }
    }))

    const scrollTimer = setTimeout(() => {
      centerActiveLink(!firstRunRef.current)
      if (focusedDialog && !focusedDialog.isConnected && document.activeElement === document.body) {
        linkRefs.current[activeScene.id]?.focus({ preventScroll: true })
      }
      // A lazy section can replace its placeholder before this timer fires.
      const firstVisible = getSectionElements().find(el => activeIds.has(el.id))
      if (firstVisible) {
        firstVisible.scrollIntoView({ behavior: getScrollBehavior(!firstRunRef.current), block: 'start' })
      } else {
        window.scrollTo({ top: 0, behavior: getScrollBehavior(!firstRunRef.current) })
      }
      firstRunRef.current = false
    }, 90)

    setNavPulse(true)
    const timer = setTimeout(() => setNavPulse(false), 520)
    return () => {
      clearTimeout(timer)
      clearTimeout(scrollTimer)
    }
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
        el.toggleAttribute('inert', !shouldShow)
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
    btn.scrollIntoView({ behavior: getScrollBehavior(smooth), inline: 'center', block: 'nearest' })
  }

  const goToScene = (sceneId, direction = 'next') => {
    if (sceneId === activeSceneId || !navScenes.some((s) => s.id === sceneId)) return
    setNavDirection(direction)
    // User navigation adds history; initialization only normalizes the hash.
    navigate(`#/${sceneId}`)
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
    settingsButtonRef.current?.focus({ preventScroll: true })
  }

  // Scroll when Centro is toggled on/off
  const prevCentroRef = useRef(centroVisible)
  useEffect(() => {
    if (prevCentroRef.current === centroVisible) return
    prevCentroRef.current = centroVisible
    const timer = setTimeout(() => {
      if (centroVisible) {
        const el = document.getElementById('centro-universo')
        if (el) el.scrollIntoView({ behavior: getScrollBehavior(), block: 'start' })
      } else {
        const firstSectionId = activeScene?.sectionIds?.[0]
        if (firstSectionId) {
          const el = document.getElementById(firstSectionId)
          if (el) el.scrollIntoView({ behavior: getScrollBehavior(), block: 'start' })
        }
      }
    }, 150)
    return () => clearTimeout(timer)
  }, [centroVisible])

  const handleLogout = async () => {
    setLoggingOut(true)
    setSettingsOpen(false)
    try {
      await supabaseSignOut()
      // Leaving /app unmounts its AuthGate and AudioProvider.
      navigate('/', { replace: true })
    } catch (_) {
      setLoggingOut(false)
    }
  }

  if (!activeScene) return null

  return (
    <nav ref={portalRef} className={`scene-portal scene-nav-${navDirection} ${navPulse ? 'scene-portal-pulse' : ''}`} aria-label="Navegación principal">
      <span className="sr-only" role="status">{activeScene.title}</span>
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
              aria-current={scene.id === activeSceneId ? 'page' : undefined}
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
        <button type="button" className="scene-nav-arrow" aria-label="Ir a la banda sonora" onClick={() => {
          const player = document.getElementById('scene-music')
          window.scrollTo({ top: window.scrollY, behavior: 'instant' })
          player?.focus({ preventScroll: true })
          // Finish the focus correction and replace any in-flight reader scroll.
          if (player) window.scrollTo({ top: 0, behavior: 'instant' })
        }}>
          <Music2 size={18} />
        </button>
        <button type="button" onClick={goPrev} aria-label="Escena anterior" className="scene-nav-arrow">
          <ChevronLeft size={18} />
        </button>

        <button type="button" onClick={goNext} aria-label="Escena siguiente" className="scene-nav-arrow">
          <ChevronRight size={18} />
        </button>

        {/* Settings gear */}
        <div className="scene-settings-wrapper" ref={settingsRef}>
          <button
            ref={settingsButtonRef}
            type="button"
            className={`scene-settings-gear ${settingsOpen ? 'active' : ''} ${centroVisible ? 'centro-active' : ''}`}
            onClick={() => setSettingsOpen((o) => !o)}
            aria-label="Ajustes"
            aria-expanded={settingsOpen}
            aria-controls="scene-settings"
            title="Ajustes"
          >
            <Settings size={18} />
          </button>

          {settingsOpen && (
            <div id="scene-settings" className="scene-settings-dropdown">
              <div className="scene-settings-dropdown__header">
                <span>Ajustes</span>
                <button type="button" onClick={() => { setSettingsOpen(false); settingsButtonRef.current?.focus({ preventScroll: true }) }} aria-label="Cerrar">
                  <X size={14} />
                </button>
              </div>

              <button
                type="button"
                aria-pressed={centroVisible}
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

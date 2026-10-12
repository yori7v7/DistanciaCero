import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Music2, Pause, Play, Sparkles, Volume2, VolumeX } from 'lucide-react'
import sceneMusic from '../data/sceneMusic.json'
import scenesData from '../data/scenes.json'
import type { SceneMusicConfig } from '../types/audio'
import { resolveAudioSource } from '../utils/audioSource'
import { claimAudio, isCurrentAudio, registerAudio, releaseAudio } from '../utils/audioCoordinator'

const UNLOCK_KEY = 'distancia-cero-scene-music-unlocked'
const VOLUME_KEY = 'distancia-cero-scene-music-volume'
const DEFAULT_VOLUME = 0.7
const SWITCH_DELAY_MS = 1300

const SECTION_ALIASES = {
  inicio: ['inicio', 'hero', 'home'],
  propuesta: ['propuesta', 'declaracion', 'pregunta-oficial', 'pregunta'],
  contadores: ['contadores', 'contador', 'tiempo'],
  carta: ['carta', 'carta-principal', 'letter'],
  historia: ['historia', 'nuestra-historia', 'diario'],
  universo: ['universo', 'sistema-solar'],
  cartas: ['cartas', 'cartas-mensuales'],
  'abrir-cuando': ['abrir-cuando', 'open-when', 'cartitas'],
  playlist: ['playlist', 'banda-sonora', 'musica', 'soundtrack'],
  razones: ['razones', '100-razones'],
  'galeria-agujero-negro': [
    'galeria-agujero-negro',
    'agujero-negro',
    'blackhole',
    'galeria',
    'momentos',
    'recuerdos'
  ],
  promesas: ['promesas', 'promises'],
  distancia: ['distancia', 'distancia-cero']
}

function getSceneVolume(scene, masterVolume) {
  const sceneVolume = Number.isFinite(scene?.volume) ? scene.volume : 0.68
  return Math.max(0, Math.min(1, sceneVolume * masterVolume))
}

function fadeAudio(audio: HTMLAudioElement, targetVolume: number, duration = 760): () => void {
  const startVolume = audio.volume
  const startTime = performance.now()
  let cancelled = false
  let frame = 0
  const step = (now: number) => {
    if (cancelled) return
    const progress = Math.max(0, Math.min((now - startTime) / duration, 1))
    const eased = progress < 0.5
      ? 2 * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 2) / 2
    audio.volume = startVolume + (targetVolume - startVolume) * eased
    if (progress < 1) frame = requestAnimationFrame(step)
  }
  frame = requestAnimationFrame(step)
  return () => {
    cancelled = true
    cancelAnimationFrame(frame)
  }
}

function getElementForScene(scene) {
  if (!scene?.sectionId) return null

  const aliases = SECTION_ALIASES[scene.sectionId] || [scene.sectionId]
  const ids = [scene.sectionId, ...aliases]

  for (const id of ids) {
    const element = document.getElementById(id)

    if (element) {
      return element
    }
  }

  return null
}

function findActiveSceneByViewport(scenes) {
  const candidates = scenes
    .map((scene) => {
      const element = getElementForScene(scene)

      if (!element) return null

      const rect = element.getBoundingClientRect()
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight
      const viewportCenter = viewportHeight * 0.52
      const sectionCenter = rect.top + rect.height / 2

      const isVisible = rect.bottom > viewportHeight * 0.12 && rect.top < viewportHeight * 0.88
      const centerInside = rect.top <= viewportCenter && rect.bottom >= viewportCenter

      if (!isVisible && !centerInside) return null

      let score = Math.abs(sectionCenter - viewportCenter)

      if (centerInside) {
        score -= 100000
      }

      const visibleHeight = Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0)
      const visibilityRatio = Math.max(0, visibleHeight) / Math.max(1, rect.height)

      score -= visibilityRatio * 1000

      return {
        scene,
        score
      }
    })
    .filter(Boolean)
    .sort((a, b) => a.score - b.score)

  return candidates[0]?.scene || scenes[0]
}

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00'

  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60).toString().padStart(2, '0')

  return `${minutes}:${remainingSeconds}`
}

const _safeGet = (k: string) => { try { return localStorage.getItem(k) } catch { return null } }
const _safeSet = (k: string, v: string) => { try { localStorage.setItem(k, v) } catch { /* degraded */ } }

function getInitialMusicSection(scenes: SceneMusicConfig[]): string {
  const hash = window.location.hash.replace(/^#\/?/, '').trim()
  const storedScene = _safeGet('distancia-cero-active-scene')
  const appScene = scenesData.find((scene) => scene.id !== 'centro-universo' && scene.id === hash)
    || scenesData.find((scene) => scene.id !== 'centro-universo' && scene.id === storedScene)
  const sectionId = appScene?.musicSectionId || appScene?.id || hash
  return scenes.find((scene) => scene.sectionId === sectionId)?.sectionId || scenes[0]?.sectionId || ''
}

function SceneMusicController({ scenes: sceneConfig = sceneMusic }: { scenes?: SceneMusicConfig[] } = {}) {
  const scenes = useMemo(() => Array.isArray(sceneConfig) ? sceneConfig : [], [sceneConfig])
  const [activeSectionId, setActiveSectionId] = useState(() => getInitialMusicSection(scenes))
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isStarting, setIsStarting] = useState(false)
  const [audioError, setAudioError] = useState('')
  const [masterVolume, setMasterVolume] = useState(DEFAULT_VOLUME)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const playbackRequestedRef = useRef(false)
  const requestRef = useRef(0)
  const mountedRef = useRef(false)
  const activeSceneRef = useRef<SceneMusicConfig | undefined>(undefined)
  const masterVolumeRef = useRef(DEFAULT_VOLUME)
  const cancelFadeRef = useRef<(() => void) | null>(null)
  const switchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendingSectionRef = useRef('')
  const rafRef = useRef<number | null>(null)

  const activeScene = scenes.find((scene) => scene.sectionId === activeSectionId) || scenes[0]
  activeSceneRef.current = activeScene
  masterVolumeRef.current = masterVolume

  const clearPendingSwitch = useCallback(() => {
    if (switchTimerRef.current !== null) clearTimeout(switchTimerRef.current)
    switchTimerRef.current = null
    pendingSectionRef.current = ''
  }, [])

  const pauseMusic = useCallback(() => {
    requestRef.current += 1
    playbackRequestedRef.current = false
    cancelFadeRef.current?.()
    cancelFadeRef.current = null
    clearPendingSwitch()
    const audio = audioRef.current
    if (audio) {
      releaseAudio(audio)
      audio.pause()
    }
    setIsPlaying(false)
    setIsStarting(false)
  }, [clearPendingSwitch])

  const playScene = useCallback(async (scene: SceneMusicConfig | undefined, restart = false) => {
    const audio = audioRef.current
    if (!audio) return
    const nextSrc = resolveAudioSource(scene?.src)
    if (!nextSrc) {
      pauseMusic()
      setAudioError(scene?.src?.trim()
        ? 'Esta escena tiene una ruta de audio no válida.'
        : 'Esta escena aún no tiene audio. Añade su ruta en sceneMusic.json.')
      return
    }

    const request = ++requestRef.current
    playbackRequestedRef.current = true
    setIsStarting(true)
    cancelFadeRef.current?.()
    cancelFadeRef.current = null
    setAudioError('')
    if (audio.getAttribute('data-scene-src') !== nextSrc || restart) {
      // Switch immediately so play() stays within the user's gesture. A fade
      // from an old scene must never queue a later playback after a pause.
      releaseAudio(audio)
      audio.pause()
      audio.src = nextSrc
      audio.loop = true
      audio.volume = 0
      audio.currentTime = 0
      audio.setAttribute('data-scene-src', nextSrc)
      setCurrentTime(0)
      setDuration(0)
      setIsPlaying(false)
    }
    claimAudio(audio)

    try {
      await audio.play()
      if (!mountedRef.current || request !== requestRef.current || !isCurrentAudio(audio)) return
      setIsPlaying(true)
      setIsStarting(false)
      cancelFadeRef.current = fadeAudio(audio, getSceneVolume(scene, masterVolumeRef.current))
    } catch (error) {
      if (!mountedRef.current || request !== requestRef.current) return
      pauseMusic()
      const blocked = error instanceof DOMException && error.name === 'NotAllowedError'
      setAudioError(blocked
        ? 'El navegador bloqueó la música. Toca reproducir para intentarlo de nuevo.'
        : 'No se pudo reproducir esta escena. Comprueba que su archivo de audio exista.')
    }
  }, [pauseMusic])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    mountedRef.current = true
    const unregister = registerAudio(audio, pauseMusic)
    const updateTime = () => setCurrentTime(audio.currentTime || 0)
    const updateDuration = () => setDuration(Number.isFinite(audio.duration) ? audio.duration : 0)
    const resetProgress = () => {
      setCurrentTime(0)
      setDuration(0)
    }
    const handlePause = () => {
      if (audio.paused && isCurrentAudio(audio)) pauseMusic()
    }
    const handleEnded = () => {
      pauseMusic()
      setAudioError('La canción de esta escena terminó.')
    }
    const handleError = () => {
      pauseMusic()
      setAudioError('No se pudo cargar esta escena. Comprueba que su archivo de audio exista.')
    }
    audio.addEventListener('timeupdate', updateTime)
    audio.addEventListener('loadedmetadata', updateDuration)
    audio.addEventListener('durationchange', updateDuration)
    audio.addEventListener('emptied', resetProgress)
    audio.addEventListener('pause', handlePause)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('error', handleError)
    return () => {
      mountedRef.current = false
      requestRef.current += 1
      playbackRequestedRef.current = false
      cancelFadeRef.current?.()
      cancelFadeRef.current = null
      clearPendingSwitch()
      unregister()
      audio.removeEventListener('timeupdate', updateTime)
      audio.removeEventListener('loadedmetadata', updateDuration)
      audio.removeEventListener('durationchange', updateDuration)
      audio.removeEventListener('emptied', resetProgress)
      audio.removeEventListener('pause', handlePause)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('error', handleError)
      audio.pause()
    }
  }, [pauseMusic, clearPendingSwitch])

  useEffect(() => {
    const handleSceneChange = (event: CustomEvent<{ sceneId?: string }>) => {
      const nextSceneId = event.detail?.sceneId
      if (!scenes.some((scene) => scene.sectionId === nextSceneId)) return
      clearPendingSwitch()
      setActiveSectionId(nextSceneId!)
    }
    window.addEventListener('distancia-cero-scene-change', handleSceneChange as EventListener)
    return () => window.removeEventListener('distancia-cero-scene-change', handleSceneChange as EventListener)
  }, [scenes, clearPendingSwitch])

  useEffect(() => {
    const storedVolumeRaw = _safeGet(VOLUME_KEY)
    const storedVolume = Number(storedVolumeRaw)
    if (_safeGet(UNLOCK_KEY) === '1') setIsUnlocked(true)
    if (storedVolumeRaw !== null && Number.isFinite(storedVolume) && storedVolume >= 0 && storedVolume <= 1) {
      setMasterVolume(storedVolume)
      masterVolumeRef.current = storedVolume
    } else {
      _safeSet(VOLUME_KEY, String(DEFAULT_VOLUME))
    }
  }, [])

  useEffect(() => {
    if (!scenes.length) return
    const scheduleDetection = () => {
      if (document.body.classList.contains('scene-mode-enabled')) {
        clearPendingSwitch()
        return
      }
      if (rafRef.current !== null) return
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null
        const detectedScene = findActiveSceneByViewport(scenes)
        if (!detectedScene?.sectionId) return
        const nextSectionId = detectedScene.sectionId
        if (nextSectionId === activeSceneRef.current?.sectionId) {
          clearPendingSwitch()
          return
        }
        if (nextSectionId === pendingSectionRef.current) return
        clearPendingSwitch()
        pendingSectionRef.current = nextSectionId
        switchTimerRef.current = setTimeout(() => {
          switchTimerRef.current = null
          setActiveSectionId(nextSectionId)
          pendingSectionRef.current = ''
        }, SWITCH_DELAY_MS)
      })
    }
    scheduleDetection()
    window.addEventListener('scroll', scheduleDetection, { passive: true })
    window.addEventListener('resize', scheduleDetection, { passive: true })
    return () => {
      window.removeEventListener('scroll', scheduleDetection)
      window.removeEventListener('resize', scheduleDetection)
      clearPendingSwitch()
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }, [scenes, clearPendingSwitch])

  useEffect(() => {
    if (playbackRequestedRef.current) void playScene(activeScene)
    else setAudioError('')
  }, [activeScene, playScene])

  useEffect(() => {
    cancelFadeRef.current?.()
    cancelFadeRef.current = null
    const audio = audioRef.current
    if (audio && isCurrentAudio(audio)) audio.volume = getSceneVolume(activeSceneRef.current, masterVolume)
  }, [masterVolume])

  const resumeMusic = () => {
    setIsUnlocked(true)
    _safeSet(UNLOCK_KEY, '1')
    _safeSet(VOLUME_KEY, String(masterVolumeRef.current))
    void playScene(activeSceneRef.current)
  }

  const changeVolume = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.target.value) / 100
    const safeValue = Math.max(0, Math.min(1, value))
    setMasterVolume(safeValue)
    masterVolumeRef.current = safeValue
    _safeSet(VOLUME_KEY, String(safeValue))
  }

  const toggleMute = () => {
    const nextVolume = masterVolume > 0 ? 0 : DEFAULT_VOLUME
    setMasterVolume(nextVolume)
    masterVolumeRef.current = nextVolume
    _safeSet(VOLUME_KEY, String(nextVolume))
  }

  const seekSong = (event: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current
    const nextTime = Number(event.target.value)
    if (!audio || !Number.isFinite(nextTime) || !duration) return
    const safeTime = Math.max(0, Math.min(nextTime, duration))
    audio.currentTime = safeTime
    setCurrentTime(safeTime)
  }

  const hasAudio = Boolean(resolveAudioSource(activeScene?.src))
  const message = audioError || (!hasAudio
    ? activeScene?.src?.trim()
      ? 'Esta escena tiene una ruta de audio no válida.'
      : 'Esta escena aún no tiene audio.'
    : '')

  const canPause = isPlaying || isStarting
  const buttonText = canPause ? 'Pausar' : isUnlocked ? 'Reproducir' : 'Iniciar banda sonora'
  const volumePercent = Math.round(masterVolume * 100)
  const progressPercent = duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0

  return (
    <div id="scene-music" role="region" aria-label="Banda sonora" tabIndex={-1} className={`scene-music-controller ${isPlaying ? 'is-playing' : ''}`}>
      <audio ref={audioRef} preload="metadata" />

      <div className="scene-music-main">
        <div className="scene-music-orb">
          <Music2 size={19} />
        </div>

        <div className="scene-music-info">
          <span>
            <Sparkles size={13} />
            {activeScene?.label || 'Distancia Cero'}
          </span>

          <strong>{activeScene?.title || 'Banda sonora'}</strong>

          <p>
            <Volume2 size={13} />
            {activeScene?.artist || 'Artista'}
          </p>

          {message && <small role="status">{message}</small>}
        </div>

        <button
          className="scene-music-button"
          type="button"
          onClick={canPause ? pauseMusic : resumeMusic}
          disabled={!hasAudio}
        >
          {canPause ? <Pause size={16} /> : <Play size={16} />}
          {buttonText}
        </button>
      </div>

      <div className="scene-music-progress">
        <span>{formatTime(currentTime)}</span>

        <input
          type="range"
          min="0"
          max={duration || 0}
          step="0.1"
          value={duration ? Math.min(currentTime, duration) : 0}
          onChange={seekSong}
          disabled={!duration}
          aria-label="Progreso de la canción"
          style={{ '--song-progress': `${progressPercent}%` } as React.CSSProperties}
        />

        <span>{formatTime(duration)}</span>
      </div>

      <div className="scene-music-volume">
        <button className="scene-volume-icon" type="button" onClick={toggleMute} aria-label="Silenciar o activar volumen">
          {masterVolume > 0 ? <Volume2 size={15} /> : <VolumeX size={15} />}
        </button>

        <input
          type="range"
          min="0"
          max="100"
          value={volumePercent}
          onChange={changeVolume}
          aria-label="Volumen de la banda sonora"
          style={{ '--volume-progress': `${volumePercent}%` } as React.CSSProperties}
        />

        <span>{volumePercent}%</span>
      </div>
    </div>
  )
}

export default SceneMusicController

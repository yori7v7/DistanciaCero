import { useEffect, useMemo, useRef, useState } from 'react'
import { Music2, Pause, Play, Sparkles, Volume2, VolumeX } from 'lucide-react'
import sceneMusic from '../data/sceneMusic.json'

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

function resolveAudioSrc(src) {
  if (!src) return ''

  if (src.startsWith('http://') || src.startsWith('https://')) {
    return src
  }

  const base = import.meta.env.BASE_URL || '/'

  if (src.startsWith('/')) {
    return `${base}${src.slice(1)}`
  }

  return `${base}${src}`
}

function pauseOtherAudios(currentAudio) {
  document.querySelectorAll('audio').forEach((audio) => {
    if (audio !== currentAudio && !audio.paused) {
      audio.pause()
    }
  })
}

function getSceneVolume(scene, masterVolume) {
  const sceneVolume = typeof scene?.volume === 'number' ? scene.volume : 0.68
  return Math.max(0, Math.min(1, sceneVolume * masterVolume))
}

function fadeAudio(audio, targetVolume, duration = 650) {
  return new Promise<void>((resolve) => {
    if (!audio) {
      resolve()
      return
    }

    const startVolume = audio.volume
    const startTime = performance.now()

    const step = (now) => {
      const progress = Math.min((now - startTime) / duration, 1)
      const eased = progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2

      audio.volume = startVolume + (targetVolume - startVolume) * eased

      if (progress < 1) {
        requestAnimationFrame(step)
      } else {
        audio.volume = targetVolume
        resolve()
      }
    }

    requestAnimationFrame(step)
  })
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

function SceneMusicController() {
  const scenes = useMemo(() => Array.isArray(sceneMusic) ? sceneMusic : [], [])
  const [activeSectionId, setActiveSectionId] = useState(scenes[0]?.sectionId || '')
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioError, setAudioError] = useState('')
  const [masterVolume, setMasterVolume] = useState(DEFAULT_VOLUME)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  const audioRef = useRef(null)
  const isPlayingRef = useRef(false)
  const activeSceneRef = useRef(null)
  const masterVolumeRef = useRef(DEFAULT_VOLUME)
  const transitionRef = useRef(Promise.resolve())
  const switchTimerRef = useRef(null)
  const pendingSectionRef = useRef('')
  const rafRef = useRef(null)

  const activeScene = useMemo(() => {
    return scenes.find((scene) => scene.sectionId === activeSectionId) || scenes[0]
  }, [activeSectionId, scenes])

  useEffect(() => {
    activeSceneRef.current = activeScene
  }, [activeScene])

  useEffect(() => {
    isPlayingRef.current = isPlaying
  }, [isPlaying])

  useEffect(() => {
    masterVolumeRef.current = masterVolume
  }, [masterVolume])

  useEffect(() => {
    const audio = audioRef.current

    if (!audio) return

    const updateTime = () => {
      setCurrentTime(audio.currentTime || 0)
    }

    const updateDuration = () => {
      setDuration(Number.isFinite(audio.duration) ? audio.duration : 0)
    }

    const resetProgress = () => {
      setCurrentTime(0)
      setDuration(0)
    }

    audio.addEventListener('timeupdate', updateTime)
    audio.addEventListener('loadedmetadata', updateDuration)
    audio.addEventListener('durationchange', updateDuration)
    audio.addEventListener('emptied', resetProgress)

    return () => {
      audio.removeEventListener('timeupdate', updateTime)
      audio.removeEventListener('loadedmetadata', updateDuration)
      audio.removeEventListener('durationchange', updateDuration)
      audio.removeEventListener('emptied', resetProgress)
    }
  }, [])

  useEffect(() => {
    const handleSceneChange = (event) => {
      const nextSceneId = event.detail?.sceneId

      if (!nextSceneId) return

      setActiveSectionId(nextSceneId)
    }

    window.addEventListener('distancia-cero-scene-change', handleSceneChange)

    return () => window.removeEventListener('distancia-cero-scene-change', handleSceneChange)
  }, [])

  useEffect(() => {
    const storedUnlock = localStorage.getItem(UNLOCK_KEY)
    const storedVolumeRaw = localStorage.getItem(VOLUME_KEY)
    const storedVolume = Number(storedVolumeRaw)

    if (storedUnlock === '1') {
      setIsUnlocked(true)
    }

    if (!Number.isNaN(storedVolume) && storedVolume >= 0 && storedVolume <= 1) {
      setMasterVolume(storedVolume)
      masterVolumeRef.current = storedVolume
    } else {
      setMasterVolume(DEFAULT_VOLUME)
      masterVolumeRef.current = DEFAULT_VOLUME
      localStorage.setItem(VOLUME_KEY, String(DEFAULT_VOLUME))
    }
  }, [])

  useEffect(() => {
    if (!scenes.length) return

    const scheduleDetection = () => {
      if (document.body.classList.contains('scene-mode-enabled')) return
      if (rafRef.current) return

      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null

        const detectedScene = findActiveSceneByViewport(scenes)

        if (!detectedScene?.sectionId) return

        const nextSectionId = detectedScene.sectionId

        if (nextSectionId === activeSceneRef.current?.sectionId) return
        if (nextSectionId === pendingSectionRef.current) return

        pendingSectionRef.current = nextSectionId

        if (switchTimerRef.current) {
          clearTimeout(switchTimerRef.current)
        }

        switchTimerRef.current = setTimeout(() => {
          setActiveSectionId((current) => {
            if (current === pendingSectionRef.current) return current
            return pendingSectionRef.current
          })
        }, SWITCH_DELAY_MS)
      })
    }

    scheduleDetection()

    window.addEventListener('scroll', scheduleDetection, { passive: true })
    window.addEventListener('resize', scheduleDetection)

    return () => {
      window.removeEventListener('scroll', scheduleDetection)
      window.removeEventListener('resize', scheduleDetection)

      if (switchTimerRef.current) {
        clearTimeout(switchTimerRef.current)
      }

      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [scenes])

  const playScene = async (scene, force = false) => {
    const audio = audioRef.current
    if (!audio || !scene?.src) return

    const nextSrc = resolveAudioSrc(scene.src)
    const nextVolume = getSceneVolume(scene, masterVolumeRef.current)
    const currentSrc = audio.getAttribute('data-scene-src')

    transitionRef.current = transitionRef.current.then(async () => {
      try {
        setAudioError('')

        if (currentSrc !== nextSrc || force) {
          await fadeAudio(audio, 0, 420)
          audio.pause()
          audio.src = nextSrc
          audio.loop = true
          audio.volume = 0
          audio.currentTime = 0
          audio.setAttribute('data-scene-src', nextSrc)
          setCurrentTime(0)
          setDuration(0)
        }

        pauseOtherAudios(audio)

        await audio.play()
        setIsPlaying(true)
        isPlayingRef.current = true

        await fadeAudio(audio, nextVolume, 760)
      } catch (error) {
        setIsPlaying(false)
        isPlayingRef.current = false
        setAudioError('Toca play para desbloquear la música.')
      }
    })

    return transitionRef.current
  }

  useEffect(() => {
    if (!isUnlocked || !activeScene) return
    if (!isPlayingRef.current) return

    playScene(activeScene)
  }, [activeScene, isUnlocked])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !isPlayingRef.current) return

    audio.volume = getSceneVolume(activeSceneRef.current, masterVolume)
  }, [masterVolume])

  const unlockAndPlay = async () => {
    localStorage.setItem(UNLOCK_KEY, '1')
    localStorage.setItem(VOLUME_KEY, String(masterVolumeRef.current || DEFAULT_VOLUME))
    setIsUnlocked(true)

    await playScene(activeSceneRef.current || activeScene, true)
  }

  const pauseMusic = async () => {
    const audio = audioRef.current
    if (!audio) return

    await fadeAudio(audio, 0, 420)
    audio.pause()
    setIsPlaying(false)
    isPlayingRef.current = false
  }

  const resumeMusic = async () => {
    setIsUnlocked(true)
    localStorage.setItem(UNLOCK_KEY, '1')
    localStorage.setItem(VOLUME_KEY, String(masterVolumeRef.current || DEFAULT_VOLUME))

    await playScene(activeSceneRef.current || activeScene, false)
  }

  const changeVolume = (event) => {
    const value = Number(event.target.value) / 100
    const safeValue = Math.max(0, Math.min(1, value))

    setMasterVolume(safeValue)
    masterVolumeRef.current = safeValue
    localStorage.setItem(VOLUME_KEY, String(safeValue))
  }

  const toggleMute = () => {
    const nextVolume = masterVolume > 0 ? 0 : DEFAULT_VOLUME

    setMasterVolume(nextVolume)
    masterVolumeRef.current = nextVolume
    localStorage.setItem(VOLUME_KEY, String(nextVolume))
  }

  const seekSong = (event) => {
    const audio = audioRef.current
    const nextTime = Number(event.target.value)

    if (!audio || !Number.isFinite(nextTime)) return

    audio.currentTime = nextTime
    setCurrentTime(nextTime)
  }

  const buttonText = isPlaying ? 'Pausar' : isUnlocked ? 'Reproducir' : 'Iniciar banda sonora'
  const volumePercent = Math.round(masterVolume * 100)
  const progressPercent = duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0

  return (
    <div className={`scene-music-controller ${isPlaying ? 'is-playing' : ''}`}>
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

          {audioError && <small>{audioError}</small>}
        </div>

        <button
          className="scene-music-button"
          type="button"
          onClick={isPlaying ? pauseMusic : isUnlocked ? resumeMusic : unlockAndPlay}
        >
          {isPlaying ? <Pause size={16} /> : <Play size={16} />}
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

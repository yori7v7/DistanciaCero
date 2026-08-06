import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import type { AudioTrack, AudioContextValue } from '../types/audio'
import siteConfig from '../data/siteConfig.json'

interface AudioContextExtended extends AudioContextValue {
  backgroundTrackPath: string
}

const AudioPlayerContext = createContext<AudioContextExtended | null>(null)

function resolvePublicPath(path: string): string {
  const cleanPath = path.startsWith('/') ? path.slice(1) : path
  return `${import.meta.env.BASE_URL}${cleanPath}`
}

const BACKGROUND_TRACK = resolvePublicPath(siteConfig.audio.backgroundTrackPath)

export function AudioProvider({ children }: { children: ReactNode }) {
  const backgroundAudioRef = useRef<HTMLAudioElement | null>(null)
  const trackAudioRef = useRef<HTMLAudioElement | null>(null)
  const backgroundWasPlayingRef = useRef(false)

  const [backgroundPlaying, setBackgroundPlaying] = useState(false)
  const [currentTrack, setCurrentTrack] = useState<AudioTrack | null>(null)
  const [infoMessage, setInfoMessage] = useState('Tema principal listo para reproducirse.')
  const [backgroundVolume, setBackgroundVolume] = useState(siteConfig.audio.defaultVolume)

  useEffect(() => {
    const background = new Audio(BACKGROUND_TRACK)
    background.loop = false
    background.volume = backgroundVolume
    background.preload = 'auto'
    backgroundAudioRef.current = background

    const track = new Audio()
    track.volume = 1
    track.preload = 'auto'
    trackAudioRef.current = track

    const handleBackgroundEnd = () => {
      setBackgroundPlaying(false)
      setInfoMessage('El tema principal terminó.')
      // Reset to start so the play button works next time
      if (backgroundAudioRef.current) {
        backgroundAudioRef.current.currentTime = 0
      }
    }

    const handleBackgroundError = () => {
      setBackgroundPlaying(false)
      setInfoMessage(`No se pudo cargar el tema principal en: ${BACKGROUND_TRACK}`)
    }

    const handleTrackEnd = () => {
      setCurrentTrack(null)
      setInfoMessage('La canción seleccionada terminó.')
      // Resume background if it was playing before the track started
      if (backgroundAudioRef.current && backgroundWasPlayingRef.current) {
        backgroundAudioRef.current.currentTime = 0
        backgroundAudioRef.current.play().catch(() => {})
        setBackgroundPlaying(true)
      }
    }

    background.addEventListener('ended', handleBackgroundEnd)
    background.addEventListener('error', handleBackgroundError)
    track.addEventListener('ended', handleTrackEnd)

    return () => {
      background.pause()
      track.pause()
      background.removeEventListener('ended', handleBackgroundEnd)
      background.removeEventListener('error', handleBackgroundError)
      track.removeEventListener('ended', handleTrackEnd)
    }
  }, [])

  useEffect(() => {
    if (backgroundAudioRef.current) {
      backgroundAudioRef.current.volume = backgroundVolume
    }
  }, [backgroundVolume])

  const pauseBackground = () => {
    if (backgroundAudioRef.current) {
      backgroundAudioRef.current.pause()
      setBackgroundPlaying(false)
    }
  }

  const resumeBackground = async () => {
    if (!backgroundAudioRef.current) return

    if (currentTrack) {
      setInfoMessage('Primero detén la canción actual si quieres volver al tema principal.')
      return
    }

    try {
      backgroundAudioRef.current.currentTime = backgroundAudioRef.current.currentTime || 0
      await backgroundAudioRef.current.play()
      setBackgroundPlaying(true)
      setInfoMessage('Tema principal sonando.')
    } catch {
      setInfoMessage(`No se pudo reproducir el tema principal. Ruta usada: ${BACKGROUND_TRACK}`)
    }
  }

  const toggleBackground = async () => {
    if (backgroundPlaying) {
      pauseBackground()
      setInfoMessage('Tema principal pausado.')
    } else {
      await resumeBackground()
    }
  }

  const playLocalTrack = async (track: AudioTrack) => {
    if (!track?.src) {
      setInfoMessage('Esa canción local todavía no tiene ruta.')
      return
    }

    if (!trackAudioRef.current) return

    const resolvedTrackPath = resolvePublicPath(track.src)

    backgroundWasPlayingRef.current = backgroundPlaying
    pauseBackground()
    trackAudioRef.current.pause()
    trackAudioRef.current.src = resolvedTrackPath
    trackAudioRef.current.currentTime = 0

    try {
      await trackAudioRef.current.play()
      setCurrentTrack(track)
      setInfoMessage(`Reproduciendo: ${track.title}`)
    } catch {
      setInfoMessage(`No se pudo reproducir ${track.title}. Ruta usada: ${resolvedTrackPath}`)
    }
  }

  const stopTrack = () => {
    if (trackAudioRef.current) {
      trackAudioRef.current.pause()
      trackAudioRef.current.currentTime = 0
    }

    if (backgroundAudioRef.current) {
      backgroundAudioRef.current.pause()
      backgroundAudioRef.current.currentTime = 0
    }

    setBackgroundPlaying(false)
    setCurrentTrack(null)
    setInfoMessage('Reproductor detenido.')
  }

  const openExternalLink = (item: AudioTrack) => {
    pauseBackground()

    if (item?.link) {
      window.open(item.link, '_blank', 'noopener,noreferrer')
      setInfoMessage(`Abriendo enlace externo: ${item.title}`)
    }
  }

  return (
    <AudioPlayerContext.Provider
      value={{
        backgroundPlaying,
        currentTrack,
        infoMessage,
        backgroundVolume,
        setBackgroundVolume,
        toggleBackground,
        pauseBackground,
        resumeBackground,
        playLocalTrack,
        stopTrack,
        openExternalLink,
        backgroundTrackPath: BACKGROUND_TRACK,
      }}
    >
      {children}
    </AudioPlayerContext.Provider>
  )
}

export function useAudio(): AudioContextExtended {
  const context = useContext(AudioPlayerContext)

  if (!context) {
    throw new Error('useAudio debe usarse dentro de AudioProvider')
  }

  return context
}

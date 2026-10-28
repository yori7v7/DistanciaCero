import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import type { AudioTrack, AudioContextValue } from '../types/audio'
import siteConfig from '../data/siteConfig.json'
import { resolveAudioSource } from '../utils/audioSource'
import { resolveExternalUrl } from '../utils/externalUrl'
import { claimAudio, isCurrentAudio, pauseAllAudio, registerAudio, releaseAudio } from '../utils/audioCoordinator'

interface AudioContextExtended extends AudioContextValue {
  backgroundTrackPath: string
}

const AudioPlayerContext = createContext<AudioContextExtended | null>(null)
const BACKGROUND_TRACK = resolveAudioSource(siteConfig.audio.backgroundTrackPath)

export function AudioProvider({ children }: { children: ReactNode }) {
  const backgroundAudioRef = useRef<HTMLAudioElement | null>(null)
  const trackAudioRef = useRef<HTMLAudioElement | null>(null)
  const backgroundWasPlayingRef = useRef(false)
  const currentTrackRef = useRef<AudioTrack | null>(null)
  const backgroundRequestRef = useRef(0)
  const trackRequestRef = useRef(0)
  const mountedRef = useRef(false)

  const [backgroundPlaying, setBackgroundPlaying] = useState(false)
  const [currentTrack, setCurrentTrack] = useState<AudioTrack | null>(null)
  const [pendingTrack, setPendingTrack] = useState<AudioTrack | null>(null)
  const [infoMessage, setInfoMessage] = useState(BACKGROUND_TRACK
    ? 'Tema principal listo para reproducirse.'
    : 'Añade una canción de fondo para activar el ambiente.')
  const [backgroundVolume, setBackgroundVolume] = useState(siteConfig.audio.defaultVolume)

  const pauseBackground = useCallback(() => {
    backgroundRequestRef.current += 1
    const audio = backgroundAudioRef.current
    if (audio) {
      if (!audio.paused) setInfoMessage('Tema principal pausado.')
      releaseAudio(audio)
      audio.pause()
    }
    setBackgroundPlaying(false)
  }, [])

  const pauseTrack = useCallback(() => {
    trackRequestRef.current += 1
    backgroundWasPlayingRef.current = false
    if (currentTrackRef.current) setInfoMessage('Canción pausada.')
    currentTrackRef.current = null
    const audio = trackAudioRef.current
    if (audio) {
      releaseAudio(audio)
      audio.pause()
    }
    setCurrentTrack(null)
    setPendingTrack(null)
  }, [])

  const resumeBackground = useCallback(async () => {
    const audio = backgroundAudioRef.current
    if (!audio) return
    if (!BACKGROUND_TRACK) {
      setInfoMessage('Añade una canción de fondo para activar el ambiente.')
      return
    }
    if (currentTrackRef.current) {
      setInfoMessage('Primero detén la canción actual si quieres volver al tema principal.')
      return
    }

    const request = ++backgroundRequestRef.current
    claimAudio(audio)
    try {
      await audio.play()
      if (!mountedRef.current || request !== backgroundRequestRef.current || !isCurrentAudio(audio)) return
      setBackgroundPlaying(true)
      setInfoMessage('Tema principal sonando.')
    } catch {
      if (!mountedRef.current || request !== backgroundRequestRef.current) return
      pauseBackground()
      setInfoMessage('No se pudo reproducir el audio de ambiente. Revisa que el archivo esté disponible.')
    }
  }, [pauseBackground])

  useEffect(() => {
    mountedRef.current = true
    // An empty source must not request the current page as if it were audio.
    const background = BACKGROUND_TRACK ? new Audio(BACKGROUND_TRACK) : new Audio()
    background.loop = false
    background.volume = Math.max(0, Math.min(1, backgroundVolume))
    background.preload = 'metadata'
    backgroundAudioRef.current = background

    const track = new Audio()
    track.volume = 1
    track.preload = 'metadata'
    trackAudioRef.current = track

    const unregisterBackground = registerAudio(background, pauseBackground)
    const unregisterTrack = registerAudio(track, pauseTrack)

    const handleBackgroundPause = () => {
      if (!background.paused) return
      setBackgroundPlaying(false)
      if (isCurrentAudio(background)) {
        pauseBackground()
        setInfoMessage('Tema principal pausado.')
      }
    }
    const handleBackgroundEnd = () => {
      pauseBackground()
      background.currentTime = 0
      setInfoMessage('El tema principal terminó.')
    }
    const handleBackgroundError = () => {
      pauseBackground()
      setInfoMessage('No se pudo cargar el audio de ambiente. Revisa que el archivo esté disponible.')
    }
    const handleTrackPause = () => {
      if (!track.paused || !isCurrentAudio(track)) return
      pauseTrack()
      setInfoMessage('Canción pausada.')
    }
    const handleTrackEnd = () => {
      const resume = isCurrentAudio(track) && backgroundWasPlayingRef.current
      pauseTrack()
      track.currentTime = 0
      setInfoMessage('La canción seleccionada terminó.')
      if (resume) void resumeBackground()
    }
    const handleTrackError = () => {
      const title = currentTrackRef.current?.title || 'la canción seleccionada'
      pauseTrack()
      setInfoMessage(`No se pudo cargar ${title}. Comprueba su ruta de audio.`)
    }

    background.addEventListener('pause', handleBackgroundPause)
    background.addEventListener('ended', handleBackgroundEnd)
    background.addEventListener('error', handleBackgroundError)
    track.addEventListener('pause', handleTrackPause)
    track.addEventListener('ended', handleTrackEnd)
    track.addEventListener('error', handleTrackError)

    return () => {
      mountedRef.current = false
      backgroundRequestRef.current += 1
      trackRequestRef.current += 1
      backgroundWasPlayingRef.current = false
      currentTrackRef.current = null
      unregisterBackground()
      unregisterTrack()
      background.removeEventListener('pause', handleBackgroundPause)
      background.removeEventListener('ended', handleBackgroundEnd)
      background.removeEventListener('error', handleBackgroundError)
      track.removeEventListener('pause', handleTrackPause)
      track.removeEventListener('ended', handleTrackEnd)
      track.removeEventListener('error', handleTrackError)
      background.pause()
      track.pause()
      backgroundAudioRef.current = null
      trackAudioRef.current = null
    }
  }, [pauseBackground, pauseTrack, resumeBackground])

  useEffect(() => {
    if (backgroundAudioRef.current) {
      backgroundAudioRef.current.volume = Number.isFinite(backgroundVolume)
        ? Math.max(0, Math.min(1, backgroundVolume)) : siteConfig.audio.defaultVolume
    }
  }, [backgroundVolume])

  const toggleBackground = async () => {
    const audio = backgroundAudioRef.current
    if (audio && isCurrentAudio(audio)) {
      pauseBackground()
      setInfoMessage('Tema principal pausado.')
    } else {
      await resumeBackground()
    }
  }

  const playLocalTrack = async (track: AudioTrack) => {
    const resolvedTrackPath = resolveAudioSource(track?.src)
    if (!resolvedTrackPath) {
      setInfoMessage(track?.src?.trim()
        ? 'Esa canción tiene una ruta de audio no válida.'
        : 'Esa canción aún no tiene audio. Añádelo desde el Centro del Universo.')
      return
    }
    const audio = trackAudioRef.current
    if (!audio) return

    const background = backgroundAudioRef.current
    const resumeAfterTrack = currentTrackRef.current
      ? backgroundWasPlayingRef.current
      : Boolean(background && isCurrentAudio(background) && !background.paused)
    // A late play() result must not select the previous song or undo a pause.
    const request = ++trackRequestRef.current
    releaseAudio(audio)
    audio.pause()
    audio.src = resolvedTrackPath
    audio.currentTime = 0
    currentTrackRef.current = track
    backgroundWasPlayingRef.current = resumeAfterTrack
    setCurrentTrack(null)
    setPendingTrack(track)
    claimAudio(audio)
    setInfoMessage(`Cargando: ${track.title}`)

    try {
      await audio.play()
      if (!mountedRef.current || request !== trackRequestRef.current || !isCurrentAudio(audio)) return
      setCurrentTrack(track)
      setPendingTrack(null)
      setInfoMessage(`Reproduciendo: ${track.title}`)
    } catch {
      if (!mountedRef.current || request !== trackRequestRef.current) return
      pauseTrack()
      setInfoMessage(`No se pudo reproducir ${track.title}. Revisa que el audio esté disponible.`)
    }
  }

  const stopTrack = () => {
    pauseTrack()
    pauseBackground()
    if (trackAudioRef.current) trackAudioRef.current.currentTime = 0
    if (backgroundAudioRef.current) backgroundAudioRef.current.currentTime = 0
    setInfoMessage('Reproductor detenido.')
  }

  const openExternalLink = (item: AudioTrack) => {
    // Keep the HTTP(S) allowlist: CMS links must not execute in the app.
    const safeUrl = resolveExternalUrl(item?.link)

    if (safeUrl) {
      pauseAllAudio()
      window.open(safeUrl, '_blank', 'noopener,noreferrer')
      setInfoMessage(`Abriendo enlace externo: ${item.title}`)
    } else {
      setInfoMessage(`Enlace no seguro: ${item.title}`)
    }
  }

  return (
    <AudioPlayerContext.Provider
      value={{
        backgroundPlaying, currentTrack, pendingTrack, infoMessage, backgroundVolume,
        setBackgroundVolume, toggleBackground, pauseBackground, resumeBackground,
        playLocalTrack, stopTrack, openExternalLink, backgroundTrackPath: BACKGROUND_TRACK,
      }}
    >
      {children}
    </AudioPlayerContext.Provider>
  )
}

export function useAudio(): AudioContextExtended {
  const context = useContext(AudioPlayerContext)
  if (!context) throw new Error('useAudio debe usarse dentro de AudioProvider')
  return context
}

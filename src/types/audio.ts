// ─── Tipos base para el sistema de audio ───

/** Track de música (playlist o fondo) */
export interface AudioTrack {
  src: string
  title: string
  artist?: string
  description?: string
  sourceType?: 'external' | 'local'
  link?: string
  tag?: string
  volume?: number
  id?: string | number
}

/** Configuración de música por escena */
export interface SceneMusicConfig {
  sectionId: string
  label: string
  title: string
  artist: string
  src: string
  plannedSrc?: string
  volume: number
}

/** Contexto de audio expuesto por useAudio() */
export interface AudioContextValue {
  backgroundPlaying: boolean
  currentTrack: AudioTrack | null
  infoMessage: string | null
  backgroundVolume: number
  setBackgroundVolume: (volume: number) => void
  toggleBackground: () => void
  pauseBackground: () => void
  resumeBackground: () => void
  playLocalTrack: (track: AudioTrack) => void
  stopTrack: () => void
  openExternalLink: (item: AudioTrack) => void
}

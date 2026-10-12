import type { ReactNode } from 'react'
import { act, cleanup, fireEvent, render, renderHook, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AudioProvider, useAudio } from '../context/AudioContext'
import SceneMusicController from '../components/SceneMusicController'
import PlaylistSection from '../components/PlaylistSection'
import type { SceneMusicConfig } from '../types/audio'
import { resolveAudioSource } from '../utils/audioSource'

const fixtures: SceneMusicConfig[] = [
  { sectionId: 'inicio', label: 'Inicio de prueba', title: 'Tema A', artist: 'Prueba', src: '/audio/a.wav', volume: 0.7 },
  { sectionId: 'universo', label: 'Universo de prueba', title: 'Tema B', artist: 'Prueba', src: '/audio/b.wav', volume: 0.5 },
  { sectionId: 'contadores', label: 'Contadores de prueba', title: 'Tema C', artist: 'Prueba', src: '/audio/c.wav', volume: 0.9 },
  { sectionId: 'playlist', label: 'Playlist de prueba', title: 'Sin canción', artist: 'Prueba', src: '', volume: 0.7 },
]
const songA = { id: 'a', title: 'Canción A', src: '/audio/playlist-a.wav' }
const songB = { id: 'b', title: 'Canción B', src: 'https://example.com/playlist-b.wav' }

let paused: WeakMap<HTMLMediaElement, boolean>
let detached: HTMLAudioElement[]
let frames: Map<number, FrameRequestCallback>
let frameId: number
let play: ReturnType<typeof vi.spyOn>

function beginPlayback(audio: HTMLMediaElement) {
  paused.set(audio, false)
  audio.dispatchEvent(new Event('play'))
}

function deferredPlayback() {
  let resolve!: () => void
  let reject!: (reason?: unknown) => void
  const promise = new Promise<void>((yes, no) => { resolve = yes; reject = no })
  play.mockImplementationOnce(function (this: HTMLMediaElement) {
    beginPlayback(this)
    return promise
  })
  return { resolve, reject }
}

async function flush() {
  await act(async () => { await Promise.resolve() })
}

function sceneChange(sceneId: string) {
  act(() => window.dispatchEvent(new CustomEvent('distancia-cero-scene-change', { detail: { sceneId } })))
}

function finishFrames(elapsed = 800) {
  const pending = [...frames.values()]
  frames.clear()
  for (const callback of pending) callback(performance.now() + elapsed)
}

function mountPlayers() {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <AudioProvider>{children}<SceneMusicController scenes={fixtures} /></AudioProvider>
  )
  const hook = renderHook(useAudio, { wrapper })
  return { ...hook, sceneAudio: document.querySelector('audio')!, background: detached[0], track: detached[1] }
}

beforeEach(() => {
  localStorage.clear()
  window.history.replaceState(null, '', '/app')
  document.body.classList.add('scene-mode-enabled')
  paused = new WeakMap()
  detached = []
  frames = new Map()
  frameId = 0
  vi.stubGlobal('Audio', vi.fn(function (source?: string) {
    const audio = document.createElement('audio')
    if (source) audio.src = source
    detached.push(audio)
    return audio
  }))
  vi.spyOn(HTMLMediaElement.prototype, 'paused', 'get').mockImplementation(function (this: HTMLMediaElement) {
    return paused.get(this) ?? true
  })
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(function (this: HTMLMediaElement) {
    const wasPlaying = !this.paused
    paused.set(this, true)
    if (wasPlaying) this.dispatchEvent(new Event('pause'))
  })
  play = vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(function (this: HTMLMediaElement) {
    beginPlayback(this)
    return Promise.resolve()
  })
  vi.stubGlobal('requestAnimationFrame', vi.fn((callback: FrameRequestCallback) => {
    frames.set(++frameId, callback)
    return frameId
  }))
  vi.stubGlobal('cancelAnimationFrame', vi.fn((id: number) => frames.delete(id)))
  vi.spyOn(window, 'open').mockReturnValue(null)
})

afterEach(() => {
  cleanup()
  document.body.classList.remove('scene-mode-enabled')
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

describe('rutas de audio bajo la base pública', () => {
  it.each([
    ['/audio/a.wav', '/DistanciaCero/audio/a.wav'],
    ['audio/a.wav', '/DistanciaCero/audio/a.wav'],
    ['./audio/a.wav', '/DistanciaCero/audio/a.wav'],
    ['/DistanciaCero/audio/a.wav', '/DistanciaCero/audio/a.wav'],
    ['https://example.com/audio.wav', 'https://example.com/audio.wav'],
    ['http://localhost:5173/audio.wav', 'http://localhost:5173/audio.wav'],
    ['data:audio/wav;base64,UklGRg==', 'data:audio/wav;base64,UklGRg=='],
    ['blob:http://localhost:5173/test-audio', 'blob:http://localhost:5173/test-audio'],
    ['blob:null/test-audio', 'blob:null/test-audio'],
    ['', ''],
    ['   ', ''],
    ['javascript:alert(1)', ''],
    ['data:text/html,example', ''],
    ['//example.com/audio.wav', ''],
  ])('resuelve %s sin confundir fuentes y rutas', (source, expected) => {
    expect(resolveAudioSource(source, '/DistanciaCero/')).toBe(expected)
  })
})

describe('coordinación de escenas, ambiente y playlist', () => {
  it('permite cancelar desde la fila una canción que todavía está cargando', async () => {
    const pending = deferredPlayback()
    render(<AudioProvider><PlaylistSection playlist={[
      { id: 'main', title: 'Ambiente', src: '' },
      { ...songA, sourceType: 'local' },
    ]} /></AudioProvider>)
    const row = screen.getByRole('button', { name: /Canción A/ })
    fireEvent.click(row)
    expect(row).toHaveTextContent('Cargando canción. Toca para cancelar.')
    expect(row).not.toHaveClass('audio-row-playing')
    fireEvent.click(row)
    await act(async () => { pending.resolve(); await Promise.resolve() })
    expect(play).toHaveBeenCalledTimes(1)
    expect(detached[1].paused).toBe(true)
    expect(row).not.toHaveTextContent('Cargando canción')
    expect(row).not.toHaveClass('audio-row-playing')
    expect(screen.getByRole('status')).toHaveTextContent('Reproductor detenido.')
  })

  it('pausa elementos fuera del DOM y permite regresar a escenas explícitamente', async () => {
    const { result, sceneAudio, background, track } = mountPlayers()
    await act(async () => { await result.current.resumeBackground() })
    expect(result.current.backgroundPlaying).toBe(true)
    expect(background.isConnected).toBe(false)

    fireEvent.click(screen.getByRole('button', { name: 'Iniciar banda sonora' }))
    await flush()
    expect(background.paused).toBe(true)
    expect(sceneAudio.paused).toBe(false)
    expect(result.current.backgroundPlaying).toBe(false)

    await act(async () => { await result.current.playLocalTrack(songA) })
    expect(sceneAudio.paused).toBe(true)
    expect(track.paused).toBe(false)
    expect(result.current.currentTrack?.id).toBe('a')
    expect(screen.getByRole('button', { name: 'Reproducir' })).toBeEnabled()

    sceneChange('universo')
    expect(track.paused).toBe(false)
    expect(sceneAudio.paused).toBe(true)
    act(() => track.dispatchEvent(new Event('ended')))
    await flush()
    expect(sceneAudio.paused).toBe(true)
    expect(background.paused).toBe(true)
    fireEvent.click(screen.getByRole('button', { name: 'Reproducir' }))
    await flush()
    expect(sceneAudio.getAttribute('src')).toBe('/audio/b.wav')
    expect(sceneAudio.paused).toBe(false)
  })

  it('limpia la selección y el aviso al reproducir la escena sobre una canción activa', async () => {
    const { result, sceneAudio, track } = mountPlayers()
    await act(async () => { await result.current.playLocalTrack(songA) })
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar banda sonora' }))
    await flush()
    expect(track.paused).toBe(true)
    expect(sceneAudio.paused).toBe(false)
    expect(result.current.currentTrack).toBeNull()
    expect(result.current.infoMessage).toBe('Canción pausada.')
  })

  it('retoma el ambiente después de varias canciones solo si estaba activo antes', async () => {
    const { result, background, track } = mountPlayers()
    await act(async () => { await result.current.resumeBackground() })
    await act(async () => { await result.current.playLocalTrack(songA) })
    await act(async () => { await result.current.playLocalTrack(songB) })
    act(() => track.dispatchEvent(new Event('ended')))
    await flush()
    expect(result.current.currentTrack).toBeNull()
    expect(result.current.backgroundPlaying).toBe(true)
    expect(background.paused).toBe(false)
  })

  it('un fallo al retomar el ambiente no marca reproducción activa', async () => {
    const { result, background, track } = mountPlayers()
    await act(async () => { await result.current.resumeBackground() })
    await act(async () => { await result.current.playLocalTrack(songA) })
    play.mockRejectedValueOnce(new DOMException('Not allowed', 'NotAllowedError'))
    act(() => track.dispatchEvent(new Event('ended')))
    await flush()
    expect(result.current.backgroundPlaying).toBe(false)
    expect(background.paused).toBe(true)
    expect(result.current.infoMessage).toContain('No se pudo reproducir el tema principal')
  })

  it('ignora resultados antiguos tras cambiar rápidamente o detener la playlist', async () => {
    const { result, track } = mountPlayers()
    const first = deferredPlayback()
    act(() => { void result.current.playLocalTrack(songA) })
    await act(async () => { await result.current.playLocalTrack(songB) })
    await act(async () => { first.resolve(); await Promise.resolve() })
    expect(result.current.currentTrack?.id).toBe('b')
    expect(track.getAttribute('src')).toBe(songB.src)

    const pending = deferredPlayback()
    act(() => { void result.current.playLocalTrack(songA) })
    act(() => result.current.stopTrack())
    await act(async () => { pending.resolve(); await Promise.resolve() })
    expect(result.current.currentTrack).toBeNull()
    expect(track.paused).toBe(true)
    expect(result.current.infoMessage).toBe('Reproductor detenido.')
  })

  it('cancela un inicio del ambiente con el mismo botón antes de resolver play', async () => {
    const { result, background } = mountPlayers()
    const pending = deferredPlayback()
    act(() => { void result.current.toggleBackground() })
    act(() => { void result.current.toggleBackground() })
    await act(async () => { pending.resolve(); await Promise.resolve() })
    expect(result.current.backgroundPlaying).toBe(false)
    expect(background.paused).toBe(true)
  })

  it('actualiza el estado ante errores y pausas del elemento de playlist', async () => {
    const { result, track } = mountPlayers()
    await act(async () => { await result.current.playLocalTrack(songA) })
    act(() => track.dispatchEvent(new Event('error')))
    expect(result.current.currentTrack).toBeNull()
    expect(track.paused).toBe(true)
    expect(result.current.infoMessage).toContain('No se pudo cargar Canción A')

    await act(async () => { await result.current.playLocalTrack(songB) })
    act(() => track.pause())
    expect(result.current.currentTrack).toBeNull()
    expect(result.current.infoMessage).toBe('Canción pausada.')
  })

  it('no hace solicitudes vacías ni detiene la canción actual por una ruta inválida', async () => {
    const { result, track } = mountPlayers()
    await act(async () => { await result.current.playLocalTrack(songA) })
    const plays = play.mock.calls.length
    await act(async () => { await result.current.playLocalTrack({ title: 'Vacía', src: ' ' }) })
    expect(result.current.currentTrack?.id).toBe('a')
    expect(result.current.infoMessage).toContain('todavía no tiene ruta')
    expect(play).toHaveBeenCalledTimes(plays)
    expect(track.paused).toBe(false)
  })

  it('un enlace externo válido detiene también la música de escena', async () => {
    const { result, sceneAudio } = mountPlayers()
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar banda sonora' }))
    await flush()
    act(() => result.current.openExternalLink({ title: 'Externa', src: '', link: 'https://example.com/song' }))
    expect(sceneAudio.paused).toBe(true)
    expect(screen.getByRole('button', { name: 'Reproducir' })).toBeEnabled()
    expect(window.open).toHaveBeenCalledWith('https://example.com/song', '_blank', 'noopener,noreferrer')
  })
})

describe('ciclo de vida de la música de escena', () => {
  it('muestra la escena de un enlace directo antes del primer evento de navegación', () => {
    window.history.replaceState(null, '', '/app#/universo')
    render(<SceneMusicController scenes={fixtures} />)
    expect(screen.getByText('Universo de prueba')).toBeInTheDocument()
    expect(screen.getByText('Tema B')).toBeInTheDocument()
    expect(play).not.toHaveBeenCalled()
  })

  it('conserva las rutas de plantilla vacías sin autoplay y ofrece una indicación útil', () => {
    localStorage.setItem('distancia-cero-scene-music-unlocked', '1')
    const { container } = render(<SceneMusicController />)
    expect(screen.getByRole('button', { name: 'Reproducir' })).toBeDisabled()
    expect(screen.getByRole('status')).toHaveTextContent('Esta escena aún no tiene audio')
    expect(container.querySelector('audio')).not.toHaveAttribute('src')
    expect(play).not.toHaveBeenCalled()
  })

  it('una pausa explícita cancela un play pendiente y su fade', async () => {
    const { sceneAudio } = mountPlayers()
    const pending = deferredPlayback()
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar banda sonora' }))
    fireEvent.click(screen.getByRole('button', { name: 'Pausar' }))
    await act(async () => { pending.resolve(); await Promise.resolve() })
    expect(sceneAudio.paused).toBe(true)
    expect(screen.getByRole('button', { name: 'Reproducir' })).toBeEnabled()
    expect(frames.size).toBe(0)
  })

  it('mantiene volumen cero después de pausar y reanudar, sin fades que lo sobrescriban', async () => {
    const { sceneAudio } = mountPlayers()
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar banda sonora' }))
    await flush()
    act(() => finishFrames(380))
    expect(sceneAudio.volume).toBeGreaterThan(0)
    fireEvent.change(screen.getByRole('slider', { name: 'Volumen de la banda sonora' }), { target: { value: '0' } })
    act(() => finishFrames())
    expect(sceneAudio.volume).toBe(0)
    fireEvent.click(screen.getByRole('button', { name: 'Pausar' }))
    fireEvent.click(screen.getByRole('button', { name: 'Reproducir' }))
    await flush()
    act(() => finishFrames())
    expect(sceneAudio.volume).toBe(0)
    expect(localStorage.getItem('distancia-cero-scene-music-volume')).toBe('0')
  })

  it('mantiene solo la última escena cuando una transición anterior termina tarde', async () => {
    const { sceneAudio } = mountPlayers()
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar banda sonora' }))
    await flush()
    const pending = deferredPlayback()
    sceneChange('universo')
    sceneChange('contadores')
    await flush()
    await act(async () => { pending.resolve(); await Promise.resolve() })
    expect(sceneAudio.getAttribute('src')).toBe('/audio/c.wav')
    expect(screen.getByText('Tema C')).toBeInTheDocument()
    expect(frames.size).toBe(1)
    fireEvent.click(screen.getByRole('button', { name: 'Pausar' }))
    const pausedVolume = sceneAudio.volume
    act(() => finishFrames())
    expect(sceneAudio.volume).toBe(pausedVolume)
    expect(frames.size).toBe(0)
  })

  it('pausa la canción anterior al entrar en una escena vacía y exige reanudar al regresar', async () => {
    const { sceneAudio } = mountPlayers()
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar banda sonora' }))
    await flush()
    sceneChange('playlist')
    expect(sceneAudio.paused).toBe(true)
    expect(screen.getByRole('button', { name: 'Reproducir' })).toBeDisabled()
    expect(screen.getByRole('status')).toHaveTextContent('Esta escena aún no tiene audio')
    const plays = play.mock.calls.length
    sceneChange('universo')
    await flush()
    expect(play).toHaveBeenCalledTimes(plays)
    expect(screen.getByRole('button', { name: 'Reproducir' })).toBeEnabled()
  })

  it.each(['pause', 'ended', 'error'])('sincroniza el control con el evento %s y cancela el fade', async (event) => {
    const { sceneAudio } = mountPlayers()
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar banda sonora' }))
    await flush()
    act(() => {
      if (event === 'pause') sceneAudio.pause()
      else sceneAudio.dispatchEvent(new Event(event))
    })
    expect(sceneAudio.paused).toBe(true)
    expect(screen.getByRole('button', { name: 'Reproducir' })).toBeEnabled()
    expect(frames.size).toBe(0)
  })

  it('explica un bloqueo de autoplay sin dejar el botón activo', async () => {
    mountPlayers()
    play.mockRejectedValueOnce(new DOMException('Not allowed', 'NotAllowedError'))
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar banda sonora' }))
    await flush()
    expect(screen.getByRole('status')).toHaveTextContent('El navegador bloqueó la música')
    expect(screen.getByRole('button', { name: 'Reproducir' })).toBeEnabled()
    expect(frames.size).toBe(0)
  })

  it('desmontar detiene todos los elementos y evita que una promesa tardía programe otro fade', async () => {
    const { result, sceneAudio, background, track, unmount } = mountPlayers()
    await act(async () => { await result.current.playLocalTrack(songA) })
    const pending = deferredPlayback()
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar banda sonora' }))
    unmount()
    await act(async () => { pending.resolve(); await Promise.resolve() })
    expect([sceneAudio.paused, background.paused, track.paused]).toEqual([true, true, true])
    expect(frames.size).toBe(0)
  })
})

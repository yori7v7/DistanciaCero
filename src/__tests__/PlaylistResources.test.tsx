import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { AudioTrack } from '../types/audio'
import PlaylistSection from '../components/PlaylistSection'
import Hero from '../components/Hero'
import { resolveExternalUrl } from '../utils/externalUrl'

const audio = vi.hoisted(() => ({
  backgroundPlaying: false,
  backgroundTrackPath: '',
  currentTrack: null as AudioTrack | null,
  pendingTrack: null as AudioTrack | null,
  infoMessage: '',
  toggleBackground: vi.fn(), playLocalTrack: vi.fn(), stopTrack: vi.fn(), openExternalLink: vi.fn(),
}))
vi.mock('../context/AudioContext', () => ({ useAudio: () => audio }))
vi.mock('../services/contentService', () => ({ mergeCollectionWithLocal: (items: unknown[]) => items }))
vi.mock('../components/FileUploader', () => ({ default: () => null }))
vi.mock('../services/storageService', () => ({ listFiles: vi.fn(), deleteFile: vi.fn(), getFileUrl: vi.fn() }))
vi.mock('../integrations/supabase/client', () => ({ isRemoteContentEnabled: () => false }))
vi.mock('../services/supabaseAuthService', () => ({ isSupabaseAuthenticated: () => false }))

beforeEach(() => {
  localStorage.clear()
  audio.backgroundPlaying = false
  audio.backgroundTrackPath = ''
  audio.currentTrack = null
  audio.pendingTrack = null
  vi.clearAllMocks()
})
afterEach(() => cleanup())

describe('recursos de playlist y ambiente', () => {
  it('la primera canción local es una fila reproducible y el ambiente es independiente', () => {
    const song = { id: 'first', title: 'Primera local', sourceType: 'local' as const, src: '/audio/first.wav' }
    render(<PlaylistSection playlist={[song]} />)
    expect(screen.getByRole('heading', { name: 'Audio de ambiente' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Reproducir ambiente' })).toBeDisabled()
    const row = screen.getByRole('button', { name: /Primera local/ })
    expect(row).toBeEnabled()
    fireEvent.click(row)
    expect(audio.playLocalTrack).toHaveBeenCalledWith(song)
    expect(audio.toggleBackground).not.toHaveBeenCalled()
  })

  it('la primera canción externa abre su propio enlace', () => {
    const song = { id: 'first', title: 'Primera externa', sourceType: 'external', link: 'https://example.com/song' }
    render(<PlaylistSection playlist={[song]} />)
    fireEvent.click(screen.getByRole('button', { name: /Primera externa/ }))
    expect(audio.openExternalLink).toHaveBeenCalledWith(song)
    expect(audio.toggleBackground).not.toHaveBeenCalled()
  })

  it('distingue filas sin audio o enlace y no ofrece acciones que fallen', () => {
    render(<PlaylistSection playlist={[
      { id: 'local', title: 'Local pendiente', sourceType: 'local' as const, src: '', description: 'Una descripción que se conserva sin audio.' },
      { id: 'missing', title: 'Externa pendiente', sourceType: 'external', link: '' },
      { id: 'unsafe', title: 'Enlace incorrecto', sourceType: 'external', link: 'javascript:alert(1)' },
      { id: 'bad-audio', title: 'Audio incorrecto', sourceType: 'local' as const, src: 'data:text/html,example' },
    ]} />)
    for (const title of ['Local pendiente', 'Externa pendiente', 'Enlace incorrecto', 'Audio incorrecto']) {
      const row = screen.getByRole('button', { name: new RegExp(title) })
      expect(row).toBeDisabled()
      expect(row).toHaveTextContent(/Audio pendiente|Enlace pendiente/)
      fireEvent.click(row)
    }
    expect(audio.playLocalTrack).not.toHaveBeenCalled()
    expect(audio.openExternalLink).not.toHaveBeenCalled()
    expect(screen.getByText('Una descripción que se conserva sin audio.')).toBeVisible()
  })

  it('conserva detener y cancelar aunque se vacíe o cambie la fuente de la fila', () => {
    const song = { id: 'first', title: 'Primera local', sourceType: 'local' as const, src: '/audio/first.wav' }
    audio.pendingTrack = song
    const { rerender } = render(<PlaylistSection playlist={[{ ...song, sourceType: 'external', src: '', link: '' }]} />)
    const row = screen.getByRole('button', { name: /Primera local/ })
    expect(row).toHaveTextContent('Cargando canción. Toca para cancelar.')
    expect(row).toBeEnabled()
    fireEvent.click(row)
    expect(audio.stopTrack).toHaveBeenCalledTimes(1)
    audio.pendingTrack = null
    audio.currentTrack = song
    rerender(<PlaylistSection playlist={[{ ...song, src: '' }]} />)
    expect(row).toHaveTextContent('Sonando ahora.')
    expect(row).toBeEnabled()
    fireEvent.click(row)
    expect(audio.stopTrack).toHaveBeenCalledTimes(2)
    expect(audio.playLocalTrack).not.toHaveBeenCalled()
  })

  it('el ambiente configurado funciona incluso sin canciones en la playlist', () => {
    audio.backgroundTrackPath = '/audio/background.wav'
    render(<PlaylistSection playlist={[]} />)
    const button = screen.getByRole('button', { name: 'Reproducir ambiente' })
    expect(button).toBeEnabled()
    fireEvent.click(button)
    expect(audio.toggleBackground).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('heading', { name: 'Audio de ambiente' })).toBeVisible()
  })

  it('la portada explica que falta la canción de fondo y no intenta reproducirla', () => {
    render(<Hero />)
    const button = screen.getByRole('button', { name: 'Añade una canción de fondo' })
    expect(button).toBeDisabled()
    fireEvent.click(button)
    expect(audio.toggleBackground).not.toHaveBeenCalled()
  })
})

describe('enlaces externos permitidos', () => {
  it.each([
    [' https://example.com/song ', 'https://example.com/song'],
    ['http://localhost:5173/audio', 'http://localhost:5173/audio'],
    ['', ''], [null, ''], [42, ''], ['javascript:alert(1)', ''], ['data:text/html,example', ''],
    ['//example.com/song', ''], ['/local', ''], ['https://', ''], ['https:example.com', ''],
  ])('resuelve %s como %s', (input, expected) => {
    expect(resolveExternalUrl(input)).toBe(expected)
  })
})

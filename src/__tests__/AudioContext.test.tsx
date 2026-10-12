import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, renderHook } from '@testing-library/react'
import { AudioProvider, useAudio } from '../context/AudioContext'

beforeEach(() => {
  localStorage.clear()
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {})
  vi.spyOn(window, 'open').mockReturnValue(null)
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('enlaces externos de playlist', () => {
  it.each(['https://example.com/song', 'http://localhost/song'])('abre %s en otra pestaña protegida', (link) => {
    const { result } = renderHook(useAudio, { wrapper: AudioProvider })
    act(() => result.current.openExternalLink({ title: 'Canción de prueba', src: '', link }))
    expect(window.open).toHaveBeenCalledExactlyOnceWith(link, '_blank', 'noopener,noreferrer')
    expect(result.current.infoMessage).toBe('Abriendo enlace externo: Canción de prueba')
  })

  it.each(['javascript:alert(1)', 'data:text/html,example', 'spotify:track:example', 'esto no es una URL'])('rechaza %s y muestra un aviso', (link) => {
    const { result } = renderHook(useAudio, { wrapper: AudioProvider })
    act(() => result.current.openExternalLink({ title: 'Canción de prueba', src: '', link }))
    expect(window.open).not.toHaveBeenCalled()
    expect(result.current.infoMessage).toBe('Enlace no seguro: Canción de prueba')
  })
})

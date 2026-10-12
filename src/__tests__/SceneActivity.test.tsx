import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import useSceneActivity, { useReducedMotion } from '../hooks/useSceneActivity'
import { CENTRO_VISIBLE_KEY, SCENE_STORAGE_KEY } from '../utils/sceneSelection'

const originalUrl = window.location.href
const motionQuery = '(prefers-reduced-motion: reduce)'
let fixture: HTMLElement
let tabHidden = false
let mediaQuery: MediaQueryList

function addSection(id: string, className = 'section') {
  const section = document.createElement('section')
  section.id = id
  section.className = className
  fixture.appendChild(section)
  return section
}

function selectHash(hash: string) {
  window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}${hash}`)
}

function sceneChange(appSceneId: string, sceneId = appSceneId) {
  window.dispatchEvent(new CustomEvent('distancia-cero-scene-change', {
    detail: { appSceneId, sceneId },
  }))
}

function changeMotionPreference(matches: boolean) {
  Object.defineProperty(mediaQuery, 'matches', { configurable: true, value: matches })
  const event = new Event('change')
  Object.defineProperties(event, { matches: { value: matches }, media: { value: motionQuery } })
  mediaQuery.dispatchEvent(event)
}

beforeEach(() => {
  localStorage.clear()
  tabHidden = false
  vi.spyOn(document, 'hidden', 'get').mockImplementation(() => tabHidden)
  document.body.classList.remove('scene-mode-enabled')
  selectHash('')
  fixture = document.createElement('main')
  document.body.appendChild(fixture)
  mediaQuery = Object.assign(new EventTarget(), {
    matches: false,
    media: motionQuery,
    onchange: null,
  }) as MediaQueryList
  vi.stubGlobal('matchMedia', vi.fn(() => mediaQuery))
})

afterEach(() => {
  cleanup()
  fixture.remove()
  document.body.classList.remove('scene-mode-enabled')
  localStorage.clear()
  window.history.replaceState(null, '', originalUrl)
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('actividad de escenas', () => {
  it.each([
    { hash: '#/musica', activeId: 'playlist', otherId: 'galeria-agujero-negro', mounted: false },
    { hash: '#/musica', activeId: 'playlist', otherId: 'galeria-agujero-negro', mounted: true },
    { hash: '#/galeria', activeId: 'galeria-agujero-negro', otherId: 'playlist', mounted: false },
    { hash: '#/galeria', activeId: 'galeria-agujero-negro', otherId: 'playlist', mounted: true },
  ])('recupera $hash aunque el evento ocurrió antes del montaje (DOM: $mounted)', ({ hash, activeId, otherId, mounted }) => {
    document.body.classList.add('scene-mode-enabled')
    selectHash(hash)
    sceneChange(hash.slice(2), activeId)
    if (mounted) {
      addSection(activeId)
      addSection(otherId)
    }

    const { result } = renderHook(() => ({
      active: useSceneActivity(activeId).isActive,
      other: useSceneActivity(otherId).isActive,
    }))

    expect(result.current).toEqual({ active: true, other: false })
  })

  it.each(['', '#/desconocida'])('usa la escena guardada cuando el hash no selecciona una escena: "%s"', hash => {
    document.body.classList.add('scene-mode-enabled')
    localStorage.setItem(SCENE_STORAGE_KEY, 'galeria')
    selectHash(hash)
    addSection('galeria-agujero-negro')
    addSection('playlist')

    const { result } = renderHook(() => ({
      gallery: useSceneActivity('galeria-agujero-negro').isActive,
      music: useSceneActivity('playlist').isActive,
    }))

    expect(result.current).toEqual({ gallery: true, music: false })
  })

  it('el enlace directo gana a la selección guardada y responde al historial sin otro evento de escena', () => {
    document.body.classList.add('scene-mode-enabled')
    localStorage.setItem(SCENE_STORAGE_KEY, 'galeria')
    selectHash('#/musica')
    const { result } = renderHook(() => ({
      music: useSceneActivity('playlist').isActive,
      gallery: useSceneActivity('galeria-agujero-negro').isActive,
    }))
    expect(result.current).toEqual({ music: true, gallery: false })

    act(() => {
      selectHash('#/galeria')
      window.dispatchEvent(new Event('hashchange'))
    })
    expect(result.current).toEqual({ music: false, gallery: true })

    act(() => {
      selectHash('#/musica')
      window.dispatchEvent(new PopStateEvent('popstate'))
    })
    expect(result.current).toEqual({ music: true, gallery: false })
  })

  it('recupera la visibilidad guardada del Centro para una sección aún sin marcar', () => {
    document.body.classList.add('scene-mode-enabled')
    selectHash('#/musica')
    localStorage.setItem(CENTRO_VISIBLE_KEY, 'true')
    addSection('centro-universo')
    const { result } = renderHook(() => useSceneActivity('centro-universo'))
    expect(result.current.isActive).toBe(true)

    act(() => {
      localStorage.setItem(CENTRO_VISIBLE_KEY, 'false')
      sceneChange('musica', 'playlist')
    })
    expect(result.current.isActive).toBe(false)
  })

  it.each(['scene-visible', 'aria-hidden'])('una marca visible del DOM tiene prioridad sobre el hash: %s', marker => {
    document.body.classList.add('scene-mode-enabled')
    selectHash('#/galeria')
    const section = addSection('playlist')
    if (marker === 'scene-visible') section.classList.add(marker)
    else section.setAttribute('aria-hidden', 'false')

    const { result } = renderHook(() => useSceneActivity('playlist'))
    expect(result.current.isActive).toBe(true)
  })

  it.each(['scene-hidden', 'inert', 'aria-hidden'])('una sección dentro de un ancestro oculto queda inactiva: %s', marker => {
    document.body.classList.add('scene-mode-enabled')
    selectHash('#/musica')
    const wrapper = document.createElement('div')
    if (marker === 'scene-hidden') wrapper.classList.add(marker)
    else wrapper.setAttribute(marker, marker === 'aria-hidden' ? 'true' : '')
    fixture.appendChild(wrapper)
    wrapper.appendChild(addSection('playlist', 'section scene-visible'))

    const { result } = renderHook(() => useSceneActivity('playlist'))
    expect(result.current.isActive).toBe(false)
  })

  it('permite una sección visible sin marcas fuera del modo de escenas', () => {
    selectHash('#/galeria')
    addSection('playlist')
    const { result } = renderHook(() => useSceneActivity('playlist'))
    expect(result.current.isActive).toBe(true)
  })

  it('pausa y reanuda al cambiar los atributos reales sin depender del evento de navegación', async () => {
    document.body.classList.add('scene-mode-enabled')
    selectHash('#/universo')
    const section = addSection('universo', 'section scene-visible')
    const { result } = renderHook(() => useSceneActivity('universo'))
    expect(result.current.isActive).toBe(true)

    await act(async () => {
      section.classList.replace('scene-visible', 'scene-hidden')
      section.setAttribute('inert', '')
      section.setAttribute('aria-hidden', 'true')
    })
    expect(result.current.isActive).toBe(false)

    await act(async () => {
      section.classList.replace('scene-hidden', 'scene-visible')
      section.removeAttribute('inert')
      section.setAttribute('aria-hidden', 'false')
    })
    expect(result.current.isActive).toBe(true)
  })

  it('la pestaña oculta pausa y al volver respeta si la escena sigue oculta', async () => {
    const section = addSection('universo', 'section scene-visible')
    const { result } = renderHook(() => useSceneActivity('universo'))
    expect(result.current.isActive).toBe(true)

    act(() => {
      tabHidden = true
      document.dispatchEvent(new Event('visibilitychange'))
    })
    expect(result.current.isActive).toBe(false)

    await act(async () => {
      section.classList.replace('scene-visible', 'scene-hidden')
      sceneChange('inicio')
    })
    act(() => {
      tabHidden = false
      document.dispatchEvent(new Event('visibilitychange'))
    })
    expect(result.current.isActive).toBe(false)

    await act(async () => {
      section.classList.replace('scene-hidden', 'scene-visible')
      sceneChange('universo')
    })
    expect(result.current.isActive).toBe(true)
  })

  it('no inicia actividad si la pestaña ya estaba oculta al montar', () => {
    tabHidden = true
    addSection('universo', 'section scene-visible')
    const { result } = renderHook(() => useSceneActivity('universo'))
    expect(result.current.isActive).toBe(false)
  })

  it('libera eventos y observación al desmontar', () => {
    addSection('universo', 'section scene-visible')
    const addWindow = vi.spyOn(window, 'addEventListener')
    const removeWindow = vi.spyOn(window, 'removeEventListener')
    const addDocument = vi.spyOn(document, 'addEventListener')
    const removeDocument = vi.spyOn(document, 'removeEventListener')
    const disconnect = vi.spyOn(MutationObserver.prototype, 'disconnect')
    const view = renderHook(() => useSceneActivity('universo'))
    view.unmount()

    for (const eventName of ['distancia-cero-scene-change', 'hashchange', 'popstate']) {
      const registration = addWindow.mock.calls.find(([name]) => name === eventName)
      expect(registration, `registro de ${eventName}`).toBeDefined()
      expect(removeWindow.mock.calls.some(([name, listener]) => name === eventName && listener === registration![1])).toBe(true)
    }
    const visibilityRegistration = addDocument.mock.calls.find(([name]) => name === 'visibilitychange')
    expect(visibilityRegistration).toBeDefined()
    expect(removeDocument.mock.calls.some(([name, listener]) => name === 'visibilitychange' && listener === visibilityRegistration![1])).toBe(true)
    expect(disconnect).toHaveBeenCalled()
  })
})

describe('preferencia de movimiento', () => {
  it('lee la preferencia inicial y propaga cambios en vivo a ambos hooks', () => {
    changeMotionPreference(true)
    addSection('universo', 'section scene-visible')
    const { result } = renderHook(() => ({
      preference: useReducedMotion(),
      scene: useSceneActivity('universo'),
    }))
    expect(result.current.preference).toBe(true)
    expect(result.current.scene).toEqual({ isActive: true, reducedMotion: true })

    act(() => changeMotionPreference(false))
    expect(result.current.preference).toBe(false)
    expect(result.current.scene).toEqual({ isActive: true, reducedMotion: false })

    act(() => changeMotionPreference(true))
    expect(result.current.preference).toBe(true)
    expect(result.current.scene.reducedMotion).toBe(true)
    expect(window.matchMedia).toHaveBeenCalledWith(motionQuery)
  })

  it('retira los listeners de la preferencia al desmontar', () => {
    const addMedia = vi.spyOn(mediaQuery, 'addEventListener')
    const removeMedia = vi.spyOn(mediaQuery, 'removeEventListener')
    const view = renderHook(() => useReducedMotion())
    const registrations = addMedia.mock.calls.filter(([name]) => name === 'change')
    expect(registrations.length).toBeGreaterThan(0)
    view.unmount()

    for (const [, registeredListener] of registrations) {
      expect(removeMedia.mock.calls.some(([name, listener]) => name === 'change' && listener === registeredListener)).toBe(true)
    }
  })
})

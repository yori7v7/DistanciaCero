import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import ReasonsSection from '../components/ReasonsSection'

const activity = vi.hoisted(() => ({ isActive: true, reducedMotion: false }))
vi.mock('../hooks/useSceneActivity', () => ({ default: () => activity }))

const reasons = Array.from({ length: 100 }, (_, index) => ({
  id: index + 1,
  title: `Razón ${index + 1}`,
  text: `Texto ${index + 1}`,
}))

let frames: Map<number, FrameRequestCallback>
let requestFrame: ReturnType<typeof vi.fn>
let cancelFrame: ReturnType<typeof vi.fn>
let boxWidth: number
let boxRect: ReturnType<typeof vi.spyOn>

function nextFrame() {
  act(() => {
    const pending = [...frames.values()]
    frames.clear()
    pending.forEach(callback => callback(16))
  })
}

beforeEach(() => {
  localStorage.clear()
  vi.useFakeTimers()
  vi.spyOn(document, 'hidden', 'get').mockReturnValue(false)
  activity.isActive = true
  activity.reducedMotion = false
  frames = new Map()
  let frameId = 0
  requestFrame = vi.fn((callback: FrameRequestCallback) => {
    const id = ++frameId
    frames.set(id, callback)
    return id
  })
  cancelFrame = vi.fn((id: number) => frames.delete(id))
  vi.stubGlobal('requestAnimationFrame', requestFrame)
  vi.stubGlobal('cancelAnimationFrame', cancelFrame)
  boxWidth = 214
  boxRect = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function () {
    return {
      x: 0, y: 0, top: 0, left: 0, width: boxWidth, height: 1260,
      right: boxWidth, bottom: 1260, toJSON: () => ({}),
    }
  })
})

afterEach(() => {
  cleanup()
  vi.clearAllTimers()
  vi.useRealTimers()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  document.body.style.overflow = ''
})

describe('actividad de Razones', () => {
  it('no agenda trabajo oculta, cancela al salir y vuelve a animar al regresar', () => {
    activity.isActive = false
    const view = render(<ReasonsSection reasons={reasons} />)
    expect(requestFrame).not.toHaveBeenCalled()
    expect(vi.getTimerCount()).toBe(0)

    activity.isActive = true
    view.rerender(<ReasonsSection reasons={reasons} />)
    expect(frames.size).toBe(1)
    const reads = boxRect.mock.calls.length
    nextFrame()
    expect(frames.size).toBe(1)
    expect(boxRect).toHaveBeenCalledTimes(reads)

    activity.isActive = false
    view.rerender(<ReasonsSection reasons={reasons} />)
    expect(cancelFrame).toHaveBeenCalled()
    expect(frames.size).toBe(0)
    const requests = requestFrame.mock.calls.length
    act(() => {
      window.dispatchEvent(new Event('resize'))
      vi.advanceTimersByTime(500)
    })
    expect(requestFrame).toHaveBeenCalledTimes(requests)
    expect(vi.getTimerCount()).toBe(0)

    activity.isActive = true
    view.rerender(<ReasonsSection reasons={reasons} />)
    expect(frames.size).toBe(1)
    view.unmount()
    expect(frames.size).toBe(0)
  })

  it('detiene RAF con foco o un detalle y lo reanuda cuando el foco deja los corazones', () => {
    const view = render(<ReasonsSection reasons={reasons.slice(0, 2)} />)
    const first = screen.getByRole('button', { name: 'Abrir razón: Razón 1' })
    const second = screen.getByRole('button', { name: 'Abrir razón: Razón 2' })
    expect(frames.size).toBe(1)
    act(() => first.focus())
    expect(frames.size).toBe(0)
    act(() => second.focus())
    expect(frames.size).toBe(0)

    const outside = document.createElement('button')
    document.body.appendChild(outside)
    act(() => outside.focus())
    expect(frames.size).toBe(1)

    fireEvent.click(first, { detail: 0 })
    const dialog = screen.getByRole('dialog', { name: 'Razón 1' })
    expect(view.container).not.toContainElement(dialog)
    expect(document.body).toContainElement(dialog)
    expect(frames.size).toBe(0)
    act(() => vi.advanceTimersByTime(500))
    expect(frames.size).toBe(0)
    fireEvent.keyDown(within(dialog).getAllByRole('button', { name: 'Cerrar' })[0], { key: 'Escape' })
    expect(first).toHaveFocus()
    expect(frames.size).toBe(0)
    act(() => outside.focus())
    expect(frames.size).toBe(1)
    outside.remove()
  })

  it('mantiene las cien razones dentro del ancho real tras colisiones y al redimensionar', () => {
    render(<ReasonsSection reasons={reasons} />)
    const buttons = screen.getAllByRole('button', { name: /^Abrir razón:/ })
    const expectWithinBox = () => {
      for (const button of buttons) {
        const coordinates = button.style.transform.match(/translate3d\(([^,]+)px, ([^,]+)px,/)
        expect(coordinates).not.toBeNull()
        const x = Number(coordinates![1])
        expect(x).toBeGreaterThanOrEqual(24)
        expect(x).toBeLessThanOrEqual(boxWidth - 62 - 24)
      }
    }
    expect(buttons).toHaveLength(100)
    nextFrame()
    expectWithinBox()
    boxWidth = 184
    act(() => window.dispatchEvent(new Event('resize')))
    nextFrame()
    expectWithinBox()
  })

  it('presenta todas las razones estáticas y conserva lectura y teclado con movimiento reducido', () => {
    activity.reducedMotion = true
    const view = render(<ReasonsSection reasons={reasons} />)
    const grid = view.container.querySelector('.reasons-static-grid')!
    const buttons = within(grid as HTMLElement).getAllByRole('button', { name: /^Abrir razón:/ })
    expect(buttons).toHaveLength(100)
    expect(view.container.querySelector('.reasons-3d-chaos-box')).toBeNull()
    expect(requestFrame).not.toHaveBeenCalled()
    expect(vi.getTimerCount()).toBe(0)
    for (const button of buttons) {
      expect(button).toHaveClass('reason-static-heart')
      expect(button).not.toHaveClass('hyper-chaotic-heart', 'reason-depth-heart')
      expect(button.style.transform).toBe('')
      expect(button.style.animation).toBe('none')
    }
    act(() => buttons[99].focus())
    fireEvent.click(buttons[99], { detail: 0 })
    const dialog = screen.getByRole('dialog', { name: 'Razón 100' })
    expect(dialog).toHaveAccessibleDescription('Texto 100')
    fireEvent.keyDown(within(dialog).getAllByRole('button', { name: 'Cerrar' })[0], { key: 'Escape' })
    expect(buttons[99]).toHaveFocus()
    expect(requestFrame).not.toHaveBeenCalled()
  })

  it('limpia las coordenadas al cambiar a movimiento reducido y reanuda al desactivarlo', () => {
    const view = render(<ReasonsSection reasons={reasons} />)
    const button = screen.getByRole('button', { name: 'Abrir razón: Razón 1' })
    nextFrame()
    expect(button.style.transform).toContain('translate3d')
    activity.reducedMotion = true
    view.rerender(<ReasonsSection reasons={reasons} />)
    expect(frames.size).toBe(0)
    expect(button.style.transform).toBe('')
    expect(button.style.filter).toBe('')
    expect(button.style.opacity).toBe('')
    expect(button.style.zIndex).toBe('')

    activity.reducedMotion = false
    view.rerender(<ReasonsSection reasons={reasons} />)
    expect(frames.size).toBe(1)
    expect(button.style.transform).toContain('translate3d')
  })
})

import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Children } from 'react'
import UniverseSection from '../components/UniverseSection'
import BlackHoleGallerySection from '../components/BlackHoleGallerySection'

// Exercise the DOM reader and pending timers without starting WebGL or animation frames.
vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }) => {
    const scene = Children.toArray(children.props.children).find((child: any) => child.props.onSelect || child.props.onPick) as any
    const props = scene.props
    if (props.onSelect) return <div>
      {['Nosotros', 'Confianza'].map((name, index) => <button key={name} onClick={event => props.onSelect({
        id: index, name, type: 'Prueba', description: `Detalle ${name}`, features: [], isCenter: index === 0,
      }, [0, 0, 0], [0, 0, 1], event.currentTarget)}>{name}</button>)}
    </div>
    return <button onClick={event => props.hasEntered
      ? props.onPick(props.items[0], event.currentTarget)
      : props.onBlocked()}>Recuerdo en órbita</button>
  },
  useFrame: vi.fn(),
  useThree: () => ({ camera: {} }),
}))
vi.mock('@react-three/drei', () => ({ Html: () => null, OrbitControls: () => null, Stars: () => null }))

const previousScrollIntoView = HTMLElement.prototype.scrollIntoView
const scrollIntoView = vi.fn()

beforeEach(() => {
  localStorage.clear()
  vi.useFakeTimers()
  scrollIntoView.mockClear()
  HTMLElement.prototype.scrollIntoView = scrollIntoView
  vi.stubGlobal('matchMedia', vi.fn(() => ({
    matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn(),
  })))
})

afterEach(() => {
  cleanup()
  vi.clearAllTimers()
  vi.useRealTimers()
  vi.unstubAllGlobals()
  if (previousScrollIntoView) HTMLElement.prototype.scrollIntoView = previousScrollIntoView
  else delete (HTMLElement.prototype as any).scrollIntoView
})

describe('lector del Universo', () => {
  it('enfoca el detalle y vuelve a su disparador con Escape y scroll reducido', () => {
    render(<UniverseSection universe={{}} />)
    const trigger = screen.getByRole('button', { name: 'Nosotros' })
    trigger.focus()
    fireEvent.click(trigger, { detail: 0 })
    act(() => vi.advanceTimersByTime(950))
    const title = screen.getByRole('heading', { name: 'Nosotros' })
    expect(title).toHaveFocus()
    act(() => vi.advanceTimersByTime(140))
    expect(scrollIntoView).toHaveBeenLastCalledWith({ behavior: 'auto', block: 'center' })
    fireEvent.keyDown(title, { key: 'Escape' })
    expect(screen.queryByRole('heading', { name: 'Nosotros' })).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
  })

  it('cancela el scroll del mundo anterior cuando se selecciona otro', () => {
    render(<UniverseSection universe={{}} />)
    fireEvent.click(screen.getByRole('button', { name: 'Nosotros' }))
    act(() => vi.advanceTimersByTime(1000))
    const second = screen.getByRole('button', { name: 'Confianza' })
    act(() => second.focus())
    fireEvent.click(second)
    expect(second).toHaveFocus()
    act(() => vi.advanceTimersByTime(90))
    expect(scrollIntoView).not.toHaveBeenCalled()
    act(() => vi.advanceTimersByTime(860))
    expect(screen.getByRole('heading', { name: 'Confianza' })).toHaveFocus()
    act(() => vi.advanceTimersByTime(140))
    expect(scrollIntoView).toHaveBeenCalledOnce()
  })

  it('conserva la selección al salir sin ejecutar foco ni scroll pendiente', () => {
    const view = render(<UniverseSection universe={{}} />)
    fireEvent.click(screen.getByRole('button', { name: 'Nosotros' }))
    const section = view.container.querySelector<HTMLElement>('#universo')!
    section.classList.add('scene-hidden')
    section.setAttribute('inert', '')
    const outside = document.createElement('button')
    document.body.appendChild(outside)
    outside.focus()
    act(() => window.dispatchEvent(new CustomEvent('distancia-cero-scene-change', {
      detail: { appSceneId: 'inicio', sceneId: 'inicio' },
    })))
    act(() => vi.advanceTimersByTime(5000))
    expect(outside).toHaveFocus()
    expect(section.querySelector('.universe-selected-card')).toHaveTextContent('Detalle Nosotros')
    expect(scrollIntoView).not.toHaveBeenCalled()
    view.unmount()
    act(() => vi.runOnlyPendingTimers())
    expect(scrollIntoView).not.toHaveBeenCalled()
    outside.remove()
  })
})

describe('lector inline de Galería', () => {
  const memories = [{ id: 'a', title: 'Primer recuerdo' }, { id: 'b', title: 'Segundo recuerdo' }]

  it('enfoca el encabezado, conserva foco al seleccionar miniaturas y retorna al último disparador', () => {
    const view = render(<BlackHoleGallerySection items={memories} />)
    const enter = screen.getByRole('button', { name: 'Entrar al agujero negro' })
    enter.focus()
    fireEvent.click(enter)
    act(() => vi.advanceTimersByTime(2850))
    const heading = screen.getByRole('heading', { name: 'Estos pedacitos de nosotros se quedaron viviendo en mí.' })
    expect(heading).toHaveFocus()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    const thumbs = within(view.container.querySelector<HTMLElement>('.blackhole-gallery-grid')!)
    expect(thumbs.getByRole('button', { pressed: true })).toHaveTextContent('Primer recuerdo')
    const second = thumbs.getByRole('button', { name: /Segundo recuerdo/ })
    second.focus()
    fireEvent.click(second)
    expect(second).toHaveFocus()
    expect(second).toHaveAttribute('aria-pressed', 'true')
    fireEvent.keyDown(second, { key: 'Escape' })
    expect(enter).toHaveFocus()

    const orbit = screen.getByRole('button', { name: 'Recuerdo en órbita' })
    orbit.focus()
    fireEvent.click(orbit)
    expect(screen.getByRole('heading', { name: 'Estos pedacitos de nosotros se quedaron viviendo en mí.' })).toHaveFocus()
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar galería' }))
    expect(orbit).toHaveFocus()
  })

  it('salir durante la entrada cancela la apertura y el desplazamiento posteriores', () => {
    render(<BlackHoleGallerySection items={memories} />)
    fireEvent.click(screen.getByRole('button', { name: 'Entrar al agujero negro' }))
    act(() => window.dispatchEvent(new CustomEvent('distancia-cero-scene-change', {
      detail: { appSceneId: 'inicio', sceneId: 'inicio' },
    })))
    act(() => vi.advanceTimersByTime(5000))
    expect(screen.queryByRole('button', { name: 'Cerrar galería' })).not.toBeInTheDocument()
    expect(scrollIntoView).not.toHaveBeenCalled()
    expect(screen.getByText('Cruza primero el horizonte de sucesos')).toBeInTheDocument()
  })
})

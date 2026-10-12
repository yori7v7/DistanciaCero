import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, useLocation, useNavigate } from 'react-router-dom'
import SceneModeController from '../components/SceneModeController'
import scenes from '../data/scenes.json'

const scrollIntoView = vi.fn()

function HistoryControls() {
  const navigate = useNavigate()
  const location = useLocation()
  return <><output data-testid="location">{location.pathname}{location.hash}</output>
    <button onClick={() => navigate(-1)}>Atrás del navegador</button>
    <button onClick={() => navigate(1)}>Adelante del navegador</button>
    <button onClick={() => navigate('#/desconocida')}>Hash desconocido</button></>
}

function renderNavigation(path = '/app#/inicio') {
  return render(<MemoryRouter initialEntries={[path]}>
    <main>{scenes.flatMap(scene => scene.sectionIds).map(id => <section key={id} id={id} className="section">{id}</section>)}</main>
    <SceneModeController /><HistoryControls />
  </MemoryRouter>)
}

beforeEach(() => {
  localStorage.clear()
  vi.useFakeTimers()
  vi.stubEnv('VITE_REMOTE_CONTENT_ENABLED', 'false')
  Object.defineProperty(Element.prototype, 'scrollIntoView', { configurable: true, value: scrollIntoView })
  scrollIntoView.mockClear()
})
afterEach(() => {
  cleanup()
  vi.clearAllTimers()
  vi.useRealTimers()
  vi.restoreAllMocks()
  vi.unstubAllEnvs()
  delete (Element.prototype as Partial<Element>).scrollIntoView
})

describe('historial y estado de escenas', () => {
  it('desplaza la sección vigente si el placeholder se reemplaza antes del timer', () => {
    renderNavigation()
    const placeholder = document.getElementById('inicio')!
    const loaded = placeholder.cloneNode(true)
    act(() => {
      placeholder.replaceWith(loaded)
      vi.advanceTimersByTime(100)
    })
    expect(scrollIntoView.mock.instances).toContain(loaded)
    expect(scrollIntoView.mock.instances).not.toContain(placeholder)
  })

  it('expone la escena actual, mantiene las ocultas inertes y devuelve foco desde Ajustes', () => {
    renderNavigation('/app#/cartas')
    const nav = within(screen.getByRole('navigation'))
    expect(nav.getByRole('button', { name: 'Cartas' })).toHaveAttribute('aria-current', 'page')
    expect(document.getElementById('inicio')).toHaveAttribute('inert')
    expect(document.getElementById('cartas')).not.toHaveAttribute('inert')
    const settings = nav.getByRole('button', { name: 'Ajustes' })
    settings.focus()
    fireEvent.click(settings)
    expect(nav.getByRole('button', { name: 'Cerrar' })).toHaveFocus()
    fireEvent.keyDown(document.activeElement!, { key: 'Escape' })
    expect(settings).toHaveFocus()
    expect(settings).toHaveAttribute('aria-expanded', 'false')
    expect(nav.queryByRole('button', { name: 'Cerrar' })).not.toBeInTheDocument()
  })

  it('normaliza un hash desconocido sin perder la última escena visible', () => {
    renderNavigation('/app#/cartas')
    fireEvent.click(screen.getByRole('button', { name: 'Hash desconocido' }))
    expect(screen.getByTestId('location')).toHaveTextContent('/app#/cartas')
    expect(document.getElementById('cartas')).toHaveAttribute('aria-hidden', 'false')
    expect(document.getElementById('playlist')).toHaveAttribute('aria-hidden', 'true')
  })

  it('conserva las escenas anteriores para atrás/adelante y restaura la visibilidad', () => {
    renderNavigation()
    const nav = within(screen.getByRole('navigation'))
    fireEvent.click(nav.getByRole('button', { name: 'Música' }))
    fireEvent.click(nav.getByRole('button', { name: 'Cartas' }))
    expect(screen.getByTestId('location')).toHaveTextContent('/app#/cartas')
    fireEvent.click(screen.getByRole('button', { name: 'Atrás del navegador' }))
    expect(screen.getByTestId('location')).toHaveTextContent('/app#/musica')
    expect(document.getElementById('playlist')).toHaveAttribute('aria-hidden', 'false')
    expect(document.getElementById('cartas')).toHaveAttribute('aria-hidden', 'true')
    fireEvent.click(screen.getByRole('button', { name: 'Adelante del navegador' }))
    expect(screen.getByTestId('location')).toHaveTextContent('/app#/cartas')
    expect(document.getElementById('cartas')).toHaveAttribute('aria-hidden', 'false')
  })

  it('un enlace directo tiene prioridad sobre la escena guardada y persiste ajustes', () => {
    localStorage.setItem('distancia-cero-active-scene', 'razones')
    const view = renderNavigation('/app#/universo')
    expect(localStorage.getItem('distancia-cero-active-scene')).toBe('universo')
    const nav = within(screen.getByRole('navigation'))
    fireEvent.click(nav.getByRole('button', { name: 'Ajustes' }))
    fireEvent.click(nav.getByRole('button', { name: /Centro del Universo/ }))
    expect(localStorage.getItem('distancia-cero-centro-visible')).toBe('true')
    view.unmount()
    renderNavigation('/app')
    expect(document.getElementById('universo')).toHaveAttribute('aria-hidden', 'false')
    expect(document.getElementById('centro-universo')).toHaveAttribute('aria-hidden', 'false')
  })

  it('desmontar cancela scrolls pendientes y limpia las clases globales', () => {
    const scroll = scrollIntoView
    const view = renderNavigation()
    const nav = within(screen.getByRole('navigation'))
    fireEvent.click(nav.getByRole('button', { name: 'Música' }))
    fireEvent.click(nav.getByRole('button', { name: 'Ajustes' }))
    fireEvent.click(nav.getByRole('button', { name: /Centro del Universo/ }))
    scroll.mockClear()
    view.unmount()
    act(() => vi.runAllTimers())
    expect(scroll).not.toHaveBeenCalled()
    expect(document.body).not.toHaveClass('scene-mode-enabled')
  })
})

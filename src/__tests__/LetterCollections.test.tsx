import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, cleanup, fireEvent, render, within } from '@testing-library/react'
import MonthlyLetters from '../components/MonthlyLetters'
import OpenWhenSection from '../components/OpenWhenSection'
import CentroUniversoSection from '../components/CentroUniversoSection'
import type { ContentItem } from '../types/content'
import {
  getCollectionItems, getSimulationUnlocked, isMonthlyLetterOpened, isOpenWhenLetterOpened,
  migrateLegacyLettersIfNeeded, notifyContentUpdated, saveCollectionHiddenIds,
  saveCollectionItems, saveCollectionOverrides, setMonthlyLetterOpened,
  setOpenWhenLetterOpened, setSimulationUnlocked,
} from '../services/contentService'

const variants = [
  { name: 'mensuales', collection: 'monthlyLetters', section: 'cartas', isOpened: isMonthlyLetterOpened,
    render: (items: ContentItem[]) => <MonthlyLetters letters={items} /> },
  { name: 'abrir cuando', collection: 'openWhenLetters', section: 'abrir-cuando', isOpened: isOpenWhenLetterOpened,
    render: (items: ContentItem[]) => <OpenWhenSection cards={items} /> },
]

const letter: ContentItem = {
  id: 'base', month: 'Mes de prueba', mood: 'Momento de prueba', title: 'Carta de prueba',
  preview: 'Adelanto de prueba', content: ['Primer párrafo', 'Segundo párrafo'], locked: false,
}

function section(id: string): HTMLElement {
  const element = document.getElementById(id)
  expect(element).not.toBeNull()
  return element!
}

beforeEach(() => {
  localStorage.clear()
  vi.useFakeTimers()
  // Run browser scroll callbacks only after cleanup, when their target is gone.
  vi.stubEnv('VITE_REMOTE_CONTENT_ENABLED', 'false')
})

afterEach(() => {
  cleanup()
  vi.runOnlyPendingTimers()
  vi.useRealTimers()
  vi.restoreAllMocks()
  vi.unstubAllEnvs()
})

describe.each(variants)('lector de cartas $name', (variant) => {
  it('no desplaza el listado después de que el usuario enfoque otro control', () => {
    render(<>{variant.render([letter])}<button type="button">Otra acción</button></>)
    fireEvent.click(within(section(variant.section)).getByRole('button', { name: 'Abrir carta' }))
    const scroll = vi.fn()
    section(variant.section).scrollIntoView = scroll
    act(() => vi.advanceTimersByTime(50))
    expect(scroll).toHaveBeenCalledTimes(1)
    fireEvent.click(within(section(variant.section)).getByRole('button', { name: 'Volver a las cartas' }))
    within(document.body).getByRole('button', { name: 'Otra acción' }).focus()
    act(() => vi.advanceTimersByTime(50))
    expect(scroll).toHaveBeenCalledTimes(1)
  })

  it('abre todos los párrafos, vuelve al listado y conserva lectura al remontar, incluido ID 0', () => {
    const data = [{ ...letter, id: 0 }]
    const view = render(variant.render(data))
    fireEvent.click(within(section(variant.section)).getByRole('button', { name: 'Abrir carta' }))
    expect(within(section(variant.section)).getByText('Primer párrafo')).toBeInTheDocument()
    expect(within(section(variant.section)).getByText('Segundo párrafo')).toBeInTheDocument()
    expect(variant.isOpened('0')).toBe(true)
    fireEvent.click(within(section(variant.section)).getByRole('button', { name: 'Volver a las cartas' }))
    expect(section(variant.section).querySelector('.letters-counter')).toHaveTextContent('1 / 1')
    view.unmount()
    render(variant.render(data))
    expect(within(section(variant.section)).getByRole('button', { name: 'Releer carta' })).toBeEnabled()
  })

  it('aplica overrides y ocultos, y añade cartas locales sin alterar los originales', () => {
    saveCollectionOverrides(variant.collection, { base: { id: 'base', title: 'Personalizada' } })
    saveCollectionHiddenIds(variant.collection, ['hidden'])
    saveCollectionItems(variant.collection, [{ ...letter, id: 'local', title: 'Creación local', isLocal: true }])
    render(variant.render([letter, { ...letter, id: 'hidden', title: 'Oculta' }]))
    const titles = within(section(variant.section)).getAllByRole('heading', { level: 3 }).map(el => el.textContent)
    expect(titles).toEqual(['Personalizada', 'Creación local'])
    expect(letter.title).toBe('Carta de prueba')
  })

  it('actualiza el lector abierto y lo cierra al ocultar o borrar su carta', () => {
    render(variant.render([letter]))
    fireEvent.click(within(section(variant.section)).getByRole('button', { name: 'Abrir carta' }))
    act(() => {
      saveCollectionOverrides(variant.collection, { base: { id: 'base', content: ['Texto actualizado'] } })
      notifyContentUpdated(variant.collection)
    })
    expect(within(section(variant.section)).getByText('Texto actualizado')).toBeInTheDocument()
    act(() => {
      saveCollectionHiddenIds(variant.collection, ['base'])
      saveCollectionItems(variant.collection, [{ ...letter, id: 'local', isLocal: true }])
      notifyContentUpdated(variant.collection)
    })
    expect(within(section(variant.section)).queryByRole('button', { name: 'Volver a las cartas' })).not.toBeInTheDocument()
    fireEvent.click(within(section(variant.section)).getByRole('button', { name: 'Abrir carta' }))
    act(() => {
      saveCollectionItems(variant.collection, [])
      notifyContentUpdated(variant.collection)
    })
    expect(section(variant.section).querySelector('.letters-counter')).toHaveTextContent('0 / 0')
  })

  it('respeta bloqueo y etiqueta, y cierra una carta simulada al desactivar el modo', () => {
    render(variant.render([{ ...letter, locked: true, availableLabel: 'Aún no', unlockHint: 'Espera la fecha' }]))
    expect(within(section(variant.section)).getByRole('button', { name: 'Aún no' })).toBeDisabled()
    act(() => { setSimulationUnlocked(true); notifyContentUpdated('letters') })
    fireEvent.click(within(section(variant.section)).getByRole('button', { name: 'Abrir (Sim)' }))
    expect(within(section(variant.section)).getByText('Primer párrafo')).toBeInTheDocument()
    act(() => { setSimulationUnlocked(false); notifyContentUpdated('letters') })
    expect(within(section(variant.section)).queryByText('Primer párrafo')).not.toBeInTheDocument()
    expect(within(section(variant.section)).getByRole('button', { name: 'Aún no' })).toBeDisabled()
    act(() => { setSimulationUnlocked(true); notifyContentUpdated('letters') })
    expect(within(section(variant.section)).getByRole('button', { name: 'Releer carta' })).toBeInTheDocument()
  })

  it('ignora eventos de otra colección y se actualiza con el evento global', () => {
    render(variant.render([letter]))
    act(() => {
      saveCollectionOverrides(variant.collection, { base: { id: 'base', title: 'Nuevo título' } })
      notifyContentUpdated('reasons')
    })
    expect(within(section(variant.section)).getByRole('heading', { name: 'Carta de prueba' })).toBeInTheDocument()
    act(() => notifyContentUpdated('all'))
    expect(within(section(variant.section)).getByRole('heading', { name: 'Nuevo título' })).toBeInTheDocument()
  })
})

it('mantiene independiente la lectura del mismo ID en ambas colecciones', () => {
  render(<><MonthlyLetters letters={[letter]} /><OpenWhenSection cards={[letter]} /></>)
  fireEvent.click(within(section('cartas')).getByRole('button', { name: 'Abrir carta' }))
  expect(isMonthlyLetterOpened('base')).toBe(true)
  expect(isOpenWhenLetterOpened('base')).toBe(false)
  expect(section('abrir-cuando').querySelector('.letters-counter')).toHaveTextContent('0 / 1')
})

it('reserva el día especial antes del merge, conservando la precedencia del override del CMS', () => {
  render(<OpenWhenSection cards={[{ ...letter, mood: 'Abrir cuando sea un día especial' }]} />)
  expect(within(section('abrir-cuando')).getByRole('button', { name: 'Próximamente' })).toBeDisabled()
  act(() => {
    saveCollectionOverrides('openWhenLetters', { base: { id: 'base', title: 'Ya llegó', locked: false } })
    notifyContentUpdated('openWhenLetters')
  })
  expect(within(section('abrir-cuando')).getByRole('heading', { name: 'Ya llegó' })).toBeInTheDocument()
  expect(within(section('abrir-cuando')).getByRole('button', { name: 'Abrir carta' })).toBeEnabled()
})

function renderWithCms(locked = true) {
  migrateLegacyLettersIfNeeded()
  for (const variant of variants) {
    saveCollectionItems(variant.collection, [{ ...letter, id: 'local-shared', isLocal: true, locked }])
  }
  render(<><CentroUniversoSection /><MonthlyLetters letters={[]} /><OpenWhenSection cards={[]} /></>)
}

function openedStat(groupName: string) {
  const panel = section('centro-universo').querySelector<HTMLElement>('.letter-stats-panel')!
  const group = within(panel).getByRole('heading', { name: groupName }).closest('.stats-group')!
  return within(group as HTMLElement).getByText('Abiertas').closest('.stat-card')!.querySelector('strong')!
}

function controls() {
  return within(section('centro-universo').querySelector<HTMLElement>('.control-actions')!)
}

describe('CMS, simulación y progreso compartido', () => {
  it('solo desplaza el último destino y cancela al elegir otro módulo o acción', () => {
    render(<CentroUniversoSection />)
    const stats = section('centro-universo').querySelector<HTMLElement>('.letter-stats-panel')!
    const groups = stats.querySelectorAll<HTMLElement>('.stats-group')
    const modules = section('centro-universo').querySelector<HTMLElement>('.crud-selector-grid')!
    const actions = section('centro-universo').querySelector<HTMLElement>('.crud-selector-grid.compact')!
    const monthly = document.getElementById('local-monthly-editor')!
    const openWhen = document.getElementById('local-openwhen-editor')!
    monthly.scrollIntoView = vi.fn()
    openWhen.scrollIntoView = vi.fn()
    fireEvent.click(within(groups[0]).getAllByRole('button')[0])
    fireEvent.click(within(groups[1]).getAllByRole('button')[0])
    act(() => vi.advanceTimersByTime(200))
    expect(monthly.scrollIntoView).not.toHaveBeenCalled()
    expect(openWhen.scrollIntoView).toHaveBeenCalledTimes(1)
    fireEvent.click(within(groups[0]).getAllByRole('button')[0])
    fireEvent.click(within(modules).getByRole('button', { name: 'Razones' }))
    act(() => vi.advanceTimersByTime(200))
    expect(monthly.scrollIntoView).not.toHaveBeenCalled()
    fireEvent.click(within(groups[0]).getAllByRole('button')[0])
    fireEvent.click(within(actions).getByRole('button', { name: 'Originales' }))
    act(() => vi.advanceTimersByTime(200))
    expect(monthly.scrollIntoView).not.toHaveBeenCalled()
  }, 15_000)

  it('cancela la navegación diferida al desmontar, aunque otro CMS use el mismo ID', () => {
    const view = render(<CentroUniversoSection />)
    const stats = section('centro-universo').querySelector<HTMLElement>('.letter-stats-panel')!
    fireEvent.click(within(stats).getAllByRole('button')[0])
    view.unmount()
    const replacement = document.createElement('div')
    replacement.id = 'local-monthly-editor'
    replacement.scrollIntoView = vi.fn()
    document.body.appendChild(replacement)
    try {
      act(() => vi.advanceTimersByTime(200))
      expect(replacement.scrollIntoView).not.toHaveBeenCalled()
    } finally {
      replacement.remove()
    }
  })

  it('alterna dos veces, actualiza lectores/estadísticas y conserva el nodo y foco del formulario', () => {
    renderWithCms()
    const cms = section('centro-universo')
    const input = document.getElementById('monthlyLetters-title') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'Borrador sin guardar' } })
    input.focus()
    fireEvent.focus(window)
    expect(section('centro-universo')).toBe(cms)
    expect(document.activeElement).toBe(input)
    fireEvent.click(controls().getByRole('button', { name: 'Activar Modo Prueba' }))
    expect(getSimulationUnlocked()).toBe(true)
    for (const variant of variants) {
      fireEvent.click(within(section(variant.section)).getByRole('button', { name: 'Abrir (Sim)' }))
    }
    expect(openedStat('Cartas Mensuales')).toHaveTextContent('1')
    expect(openedStat('Abrir Cuando...')).toHaveTextContent('1')
    fireEvent.click(controls().getByRole('button', { name: 'Desactivar Modo Prueba' }))
    expect(getSimulationUnlocked()).toBe(false)
    expect(controls().getByRole('button', { name: 'Activar Modo Prueba' })).toBeInTheDocument()
    expect(document.getElementById('monthlyLetters-title')).toBe(input)
    expect(input).toHaveValue('Borrador sin guardar')
    for (const variant of variants) {
      expect(within(section(variant.section)).getByRole('button', { name: 'Próximamente' })).toBeDisabled()
    }
  }, 15_000)

  it.each([true, false])('reinicia lectura base/local y simulación sin borrar contenido (bloqueada: %s)', (locked) => {
    setMonthlyLetterOpened('m1')
    setOpenWhenLetterOpened('ow1')
    renderWithCms(locked)
    const beforeMonthly = getCollectionItems('monthlyLetters')
    const beforeOpenWhen = getCollectionItems('openWhenLetters')
    fireEvent.click(controls().getByRole('button', { name: 'Activar Modo Prueba' }))
    for (const variant of variants) {
      fireEvent.click(within(section(variant.section)).getByRole('button', { name: locked ? 'Abrir (Sim)' : 'Abrir carta' }))
    }
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    fireEvent.click(controls().getByRole('button', { name: 'Resetear Progreso' }))
    expect(getSimulationUnlocked()).toBe(false)
    expect(isMonthlyLetterOpened('m1')).toBe(false)
    expect(isOpenWhenLetterOpened('ow1')).toBe(false)
    for (const variant of variants) {
      expect(variant.isOpened('local-shared')).toBe(false)
      expect(section(variant.section).querySelector('.letters-counter')).toHaveTextContent('0 / 1')
    }
    expect(openedStat('Cartas Mensuales')).toHaveTextContent('0')
    expect(openedStat('Abrir Cuando...')).toHaveTextContent('0')
    expect(getCollectionItems('monthlyLetters')).toEqual(beforeMonthly)
    expect(getCollectionItems('openWhenLetters')).toEqual(beforeOpenWhen)
  }, 15_000)

  it('cancelar el reinicio conserva simulación, lectura y la carta abierta', () => {
    renderWithCms()
    fireEvent.click(controls().getByRole('button', { name: 'Activar Modo Prueba' }))
    fireEvent.click(within(section('cartas')).getByRole('button', { name: 'Abrir (Sim)' }))
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    fireEvent.click(controls().getByRole('button', { name: 'Resetear Progreso' }))
    expect(getSimulationUnlocked()).toBe(true)
    expect(isMonthlyLetterOpened('local-shared')).toBe(true)
    expect(within(section('cartas')).getByText('Primer párrafo')).toBeInTheDocument()
  })
})

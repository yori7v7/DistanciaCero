import { useRef, useState } from 'react'
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import ReasonsSection from '../components/ReasonsSection'
import MonthlyLetters from '../components/MonthlyLetters'
import OpenWhenSection from '../components/OpenWhenSection'
import BackupPanel from '../components/centro-universo/BackupPanel'
import CentroUniversoSection from '../components/CentroUniversoSection'
import useDialogFocus from '../hooks/useDialogFocus'
import type { ContentItem } from '../types/content'

beforeEach(() => {
  localStorage.clear()
  vi.useFakeTimers()
  vi.stubEnv('VITE_REMOTE_CONTENT_ENABLED', 'false')
})

afterEach(() => {
  cleanup()
  vi.clearAllTimers()
  vi.useRealTimers()
  vi.restoreAllMocks()
  vi.unstubAllEnvs()
  document.body.style.overflow = ''
})

describe('Razones accesibles', () => {
  it('abre mediante click de teclado, contiene Tab y restaura foco al cerrar con Escape', () => {
    render(<ReasonsSection reasons={[{ id: 1, title: 'Razón de prueba', text: 'Texto de prueba' }]} />)
    const trigger = screen.getByRole('button', { name: 'Abrir razón: Razón de prueba' })
    trigger.focus()
    // Native keyboard activation emits click with detail 0; jsdom does not synthesize it from Enter.
    fireEvent.click(trigger, { detail: 0 })

    const dialog = screen.getByRole('dialog', { name: 'Razón de prueba' })
    const [first, last] = within(dialog).getAllByRole('button', { name: 'Cerrar' })
    expect(first).toHaveFocus()
    expect(dialog).toHaveAccessibleDescription('Texto de prueba')
    expect(document.body.style.overflow).toBe('hidden')

    last.focus()
    fireEvent.keyDown(last, { key: 'Tab' })
    expect(first).toHaveFocus()
    fireEvent.keyDown(first, { key: 'Tab', shiftKey: true })
    expect(last).toHaveFocus()
    trigger.focus()
    expect(first).toHaveFocus()

    fireEvent.keyDown(first, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
    expect(document.body.style.overflow).toBe('')
  })

  it('cierra el detalle al dejar Razones y libera los listeners de foco', () => {
    render(<ReasonsSection reasons={[{ id: 1, title: 'Razón', text: 'Texto' }]} />)
    const trigger = screen.getByRole('button', { name: 'Abrir razón: Razón' })
    fireEvent.click(trigger)
    act(() => window.dispatchEvent(new CustomEvent('distancia-cero-scene-change', {
      detail: { sceneId: 'inicio', appSceneId: 'inicio' },
    })))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(document.body.style.overflow).toBe('')
    const outside = document.createElement('button')
    document.body.appendChild(outside)
    outside.focus()
    expect(outside).toHaveFocus()
    outside.remove()
  })
})

const letter: ContentItem = {
  id: 0, month: 'Mes', mood: 'Momento', title: 'Carta accesible', preview: 'Adelanto',
  content: ['Contenido'], locked: false,
}

describe.each([
  { name: 'mensuales', render: () => <MonthlyLetters letters={[letter]} /> },
  { name: 'abrir cuando', render: () => <OpenWhenSection cards={[letter]} /> },
])('foco del lector $name', variant => {
  it('lleva el foco al título al abrir y a la misma carta al volver', () => {
    render(variant.render())
    const trigger = screen.getByRole('button', { name: 'Abrir carta' })
    trigger.focus()
    fireEvent.click(trigger, { detail: 0 })
    expect(screen.getByRole('heading', { name: 'Carta accesible' })).toHaveFocus()
    fireEvent.click(screen.getByRole('button', { name: 'Volver a las cartas' }), { detail: 0 })
    expect(screen.getByRole('button', { name: 'Releer carta' })).toHaveFocus()
  })
})

it('el botón Importar respaldo permite activar el selector de archivo desde teclado', () => {
  const view = render(<BackupPanel />)
  const input = view.container.querySelector<HTMLInputElement>('input[type="file"]')!
  const chooseFile = vi.spyOn(input, 'click').mockImplementation(() => {})
  const button = screen.getByRole('button', { name: 'Importar respaldo' })
  button.focus()
  fireEvent.click(button, { detail: 0 })
  expect(button).toHaveFocus()
  expect(chooseFile).toHaveBeenCalledOnce()
})

it('identifica el estado de selectores CMS y asocia ambas etiquetas de imagen', () => {
  const view = render(<CentroUniversoSection />)
  const groups = view.container.querySelectorAll<HTMLElement>('.crud-selector-grid')
  const modules = within(groups[0])
  const actions = within(groups[1])
  const cards = modules.getByText('Cartas', { exact: true }).closest('button')!
  expect(cards).toHaveAccessibleName('Cartas')
  expect(cards).toHaveAttribute('aria-pressed', 'true')
  const gallery = modules.getByText('Galería', { exact: true }).closest('button')!
  expect(gallery).toHaveAccessibleName('Galería')
  fireEvent.click(gallery)
  expect(gallery).toHaveAttribute('aria-pressed', 'true')
  const originals = actions.getByText('Originales', { exact: true }).closest('button')!
  expect(originals).toHaveAttribute('aria-pressed', 'true')
  const local = actions.getByText('Tus creaciones', { exact: true }).closest('button')!
  fireEvent.click(local)
  expect(local).toHaveAccessibleName('Tus creaciones')
  expect(local).toHaveAttribute('aria-pressed', 'true')

  const uploads = ['local-blackhole-editor', 'base-blackhole-editor'].map(id =>
    within(view.container.querySelector<HTMLElement>(`#${id}`)!).getByLabelText('Subir imagen desde archivo'))
  expect(uploads).toHaveLength(2)
  expect(new Set(uploads.map(input => input.id)).size).toBe(2)
  for (const upload of uploads) expect(upload).toHaveAttribute('type', 'file')
}, 15_000)

function InlineReader() {
  const [open, setOpen] = useState(false)
  const regionRef = useRef<HTMLElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  useDialogFocus({
    isOpen: open, dialogRef: regionRef, initialFocusRef: titleRef, returnFocusRef: triggerRef,
    onClose: () => setOpen(false), trapFocus: false,
  })
  return <>
    <button ref={triggerRef} onClick={() => setOpen(true)}>Abrir detalle</button>
    <button onClick={() => setOpen(false)}>Otra acción</button>
    {open && <article ref={regionRef} tabIndex={-1}>
      <h2 ref={titleRef} tabIndex={-1}>Detalle</h2>
      <button onClick={() => setOpen(false)}>Cerrar detalle</button>
    </article>}
  </>
}

it('el lector inline permite foco exterior y solo cierra con Escape desde dentro', () => {
  render(<InlineReader />)
  const trigger = screen.getByRole('button', { name: 'Abrir detalle' })
  fireEvent.click(trigger)
  const heading = screen.getByRole('heading', { name: 'Detalle' })
  expect(heading).toHaveFocus()
  expect(document.body.style.overflow).toBe('')
  const outside = screen.getByRole('button', { name: 'Otra acción' })
  outside.focus()
  fireEvent.keyDown(outside, { key: 'Escape' })
  expect(heading).toBeInTheDocument()
  expect(outside).toHaveFocus()
  heading.focus()
  fireEvent.keyDown(heading, { key: 'Escape' })
  expect(screen.queryByRole('heading', { name: 'Detalle' })).not.toBeInTheDocument()
  expect(trigger).toHaveFocus()
})

it('cerrar un lector inline desde otra acción conserva el foco en esa acción', () => {
  render(<InlineReader />)
  fireEvent.click(screen.getByRole('button', { name: 'Abrir detalle' }))
  const outside = screen.getByRole('button', { name: 'Otra acción' })
  outside.focus()
  fireEvent.click(outside)
  expect(screen.queryByRole('heading', { name: 'Detalle' })).not.toBeInTheDocument()
  expect(outside).toHaveFocus()
})

import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import ReasonsSection from '../components/ReasonsSection'
import { restoreContentBackup } from '../services/contentService'

beforeEach(() => {
  localStorage.clear()
  vi.useFakeTimers()
})
afterEach(() => {
  cleanup()
  vi.clearAllTimers()
  vi.useRealTimers()
})

describe('Razones al restaurar un respaldo', () => {
  it('actualiza una razón abierta con el mismo ID y cierra su detalle si desaparece', () => {
    restoreContentBackup({ version: 2, content: { reasons: [{ id: 'test', title: 'Antes', text: 'Texto anterior' }] } })
    render(<ReasonsSection reasons={[]} />)
    fireEvent.click(screen.getByTitle('Antes'))
    expect(screen.getByRole('dialog')).toHaveTextContent('Texto anterior')

    act(() => restoreContentBackup({ version: 2, content: { reasons: [{ id: 'test', title: 'Después', text: 'Texto restaurado' }] } }))
    expect(screen.getByRole('dialog')).toHaveTextContent('Texto restaurado')
    expect(screen.queryByTitle('Antes')).not.toBeInTheDocument()
    expect(screen.getByTitle('Después')).toBeInTheDocument()

    act(() => restoreContentBackup({ version: 2, content: { reasons: [] } }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.queryByTitle('Después')).not.toBeInTheDocument()
  })
})

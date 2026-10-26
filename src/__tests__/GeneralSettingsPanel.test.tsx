import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import GeneralSettingsPanel from '../components/centro-universo/GeneralSettingsPanel'
import useSiteConfig from '../hooks/useSiteConfig'
import { saveSiteSettings, SITE_SETTINGS_STORAGE_KEY } from '../services/siteSettingsService'
import { restoreContentBackup } from '../services/contentService'

function Preview() {
  const config = useSiteConfig()
  return <output data-testid="settings-preview">{JSON.stringify({ couple: config.couple, dates: config.dates, title: config.hero.titleName })}</output>
}
function setup() {
  render(<><GeneralSettingsPanel /><Preview /></>)
  fireEvent.click(screen.getByText('Ajustes generales', { exact: true }))
  const form = screen.getByRole('form', { name: 'Ajustes generales' })
  return { form, name: within(form).getByLabelText('Tu nombre'), preview: screen.getByTestId('settings-preview') }
}
beforeEach(() => localStorage.clear())
afterEach(() => { cleanup(); vi.restoreAllMocks() })

describe('ajustes generales y consumidores reactivos', () => {
  it('guarda nombres y fechas, con portada derivada solo cuando no hay título propio', () => {
    const { form, name, preview } = setup()
    fireEvent.change(name, { target: { value: 'Alex' } })
    fireEvent.change(within(form).getByLabelText('Nombre de tu pareja'), { target: { value: 'Sam' } })
    fireEvent.change(within(form).getByLabelText('Inicio de la relación'), { target: { value: '2025-02-01' } })
    fireEvent.submit(form)
    expect(preview).toHaveTextContent('Alex')
    expect(preview).toHaveTextContent('2025-02-01')
    expect(JSON.parse(preview.textContent!).title).toBe('Sam')
    fireEvent.change(within(form).getByLabelText('Nombre en portada (opcional)'), { target: { value: 'Mi estrella' } })
    fireEvent.submit(form)
    act(() => saveSiteSettings({ couple: { herName: 'Otra persona' }, hero: { titleName: 'Mi estrella' } }))
    expect(JSON.parse(preview.textContent!).title).toBe('Mi estrella')
  })

  it('conserva borrador y valores aplicados cuando falla la persistencia', () => {
    saveSiteSettings({ couple: { yourName: 'Guardado' } })
    const { form, name, preview } = setup()
    fireEvent.change(name, { target: { value: 'Borrador' } })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new DOMException('Quota', 'QuotaExceededError') })
    fireEvent.submit(form)
    expect(screen.getByRole('alert')).toBeVisible()
    expect(name).toHaveValue('Borrador')
    expect(preview).toHaveTextContent('Guardado')
    expect(preview).not.toHaveTextContent('Borrador')
  })

  it('protege un borrador ante cambios externos y permite cargar lo guardado', () => {
    const { form, name } = setup()
    fireEvent.change(name, { target: { value: 'Borrador' } })
    act(() => saveSiteSettings({ couple: { yourName: 'Desde otra pestaña' } }))
    expect(name).toHaveValue('Borrador')
    expect(within(form).getByRole('button', { name: 'Guardar ajustes' })).toBeDisabled()
    fireEvent.click(screen.getByRole('button', { name: 'Descartar borrador y cargar ajustes' }))
    expect(name).toHaveValue('Desde otra pestaña')
  })

  it('refresca importaciones y resets de almacenamiento y restaura solo ajustes', () => {
    const { form, name, preview } = setup()
    act(() => restoreContentBackup({ version: 2, settings: { couple: { yourName: 'Importado' } } }))
    expect(name).toHaveValue('Importado')
    act(() => {
      localStorage.setItem(SITE_SETTINGS_STORAGE_KEY, JSON.stringify({ couple: { yourName: 'Otra pestaña' } }))
      window.dispatchEvent(new StorageEvent('storage', { key: SITE_SETTINGS_STORAGE_KEY }))
    })
    expect(preview).toHaveTextContent('Otra pestaña')
    localStorage.setItem('distancia-cero-content-reasons', '[{"id":"keep","title":"Conservar"}]')
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    fireEvent.click(within(form).getByRole('button', { name: 'Restaurar plantilla' }))
    expect(localStorage.getItem('distancia-cero-content-reasons')).toContain('Conservar')
    act(() => { localStorage.clear(); window.dispatchEvent(new StorageEvent('storage', { key: null })) })
    expect(name).toHaveValue('')
  })
})

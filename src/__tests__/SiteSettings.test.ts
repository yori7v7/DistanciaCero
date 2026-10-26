import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  getSiteSettings, resetSiteSettings, saveSiteSettings,
  SITE_SETTINGS_STORAGE_KEY, SETTINGS_UPDATED_EVENT,
} from '../services/siteSettingsService'
import { exportContentBackup, restoreContentBackup, validateContentBackup } from '../services/contentService'
import { ContentStorageError } from '../utils/localContentStore'
import { validateSiteSettings } from '../utils/siteSettings'

const reasonsKey = 'distancia-cero-content-reasons'
const migratedKey = 'distancia-cero-legacy-migrated-v2'
const contentEvent = 'distancia-cero-content-updated'

function storageSnapshot() {
  const result: Record<string, string> = {}
  for (let index = 0; index < localStorage.length; index++) {
    const key = localStorage.key(index)!
    result[key] = localStorage.getItem(key)!
  }
  return result
}

beforeEach(() => {
  localStorage.clear()
  vi.stubEnv('VITE_REMOTE_CONTENT_ENABLED', 'false')
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllEnvs()
})

describe('ajustes generales locales', () => {
  it('empieza sin overrides y valida una copia normalizada sin modificar el borrador', () => {
    expect(getSiteSettings()).toEqual({})
    const input = Object.freeze({
      couple: Object.freeze({ yourName: '  Alex  ', herName: '', mainPairName: '  Nosotros dos  ' }),
      hero: Object.freeze({ titleName: '  Para ti  ' }),
      dates: Object.freeze({ relationshipStartDate: '2024-02-29', nextMeetingDate: '2999-12-31' }),
    })
    const checked = validateSiteSettings(input)
    expect(checked).toEqual({
      couple: { yourName: 'Alex', herName: '', mainPairName: 'Nosotros dos' },
      hero: { titleName: 'Para ti' },
      dates: { relationshipStartDate: '2024-02-29', nextMeetingDate: '2999-12-31' },
    })
    expect(input.couple.yourName).toBe('  Alex  ')
    expect(checked.couple).not.toBe(input.couple)
    expect(localStorage.length).toBe(0)
  })

  it.each([
    null, [], 'ajustes',
    { audio: {} }, { secret: { passwords: ['otra'] } },
    { couple: [] }, { couple: null }, { couple: { displayName: 'Otro' } },
    { couple: { yourName: 123 } }, { couple: { mainPairName: '   ' } },
    { hero: { titleName: 'x'.repeat(81) } },
    { dates: { metDate: '' } }, { dates: { metDate: '2024-2-01' } },
    { dates: { metDate: '2025-02-29' } }, { dates: { metDate: '2024-02-30' } },
    { dates: { metDate: '2024-13-01' } }, { dates: { metDate: '2024-01-00' } },
    { dates: { metDate: '0000-01-01' } }, { dates: { metDate: true } },
    JSON.parse('{"couple":{"__proto__":{"polluted":true}}}'),
    Object.create({ couple: { yourName: 'Heredado' } }),
  ])('rechaza un documento desconocido o mal formado sin persistir: %j', input => {
    const before = storageSnapshot()
    const dispatch = vi.spyOn(window, 'dispatchEvent')
    expect(() => saveSiteSettings(input)).toThrow(/Ajustes inválidos/)
    expect(storageSnapshot()).toEqual(before)
    expect(dispatch).not.toHaveBeenCalled()
  })

  it('persiste los campos parciales y notifica únicamente después del guardado', () => {
    localStorage.setItem('distancia-cero-current-user', 'local-user2')
    localStorage.setItem('dato-ajeno', 'conservar')
    const dispatch = vi.spyOn(window, 'dispatchEvent')
    const saved = saveSiteSettings({ couple: { yourName: ' Alex ' }, dates: { metDate: '0001-01-01' } })
    expect(saved).toEqual({ couple: { yourName: 'Alex' }, dates: { metDate: '0001-01-01' } })
    expect(getSiteSettings()).toEqual(saved)
    expect(JSON.parse(localStorage.getItem(SITE_SETTINGS_STORAGE_KEY)!)).toEqual(saved)
    expect(localStorage.getItem('distancia-cero-current-user')).toBe('local-user2')
    expect(localStorage.getItem('dato-ajeno')).toBe('conservar')
    expect(dispatch.mock.calls.map(([event]) => event.type)).toEqual([SETTINGS_UPDATED_EVENT])
  })

  it('reset restablece los valores base sin borrar contenido o progreso', () => {
    saveSiteSettings({ couple: { mainPairName: 'Universo de prueba' } })
    localStorage.setItem(reasonsKey, '[{"id":"a","title":"Conservar"}]')
    localStorage.setItem('distancia-cero-monthly-letter-a', 'opened')
    resetSiteSettings()
    expect(getSiteSettings()).toEqual({})
    expect(localStorage.getItem(SITE_SETTINGS_STORAGE_KEY)).toBe('{}')
    expect(localStorage.getItem(reasonsKey)).toContain('Conservar')
    expect(localStorage.getItem('distancia-cero-monthly-letter-a')).toBe('opened')
  })

  it('un fallo al guardar conserva el estado anterior y no publica éxito', () => {
    saveSiteSettings({ couple: { yourName: 'Anterior' } })
    const before = storageSnapshot()
    const dispatch = vi.spyOn(window, 'dispatchEvent')
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Cuota de prueba', 'QuotaExceededError')
    })
    expect(() => saveSiteSettings({ couple: { yourName: 'Nuevo' } })).toThrow(ContentStorageError)
    expect(storageSnapshot()).toEqual(before)
    expect(dispatch).not.toHaveBeenCalled()
  })

  it('tolera almacenamiento dañado al leer la experiencia, pero no lo exporta como vacío', () => {
    localStorage.setItem(SITE_SETTINGS_STORAGE_KEY, '{json roto')
    expect(getSiteSettings()).toEqual({})
    expect(() => exportContentBackup()).toThrow(ContentStorageError)
    expect(localStorage.getItem(SITE_SETTINGS_STORAGE_KEY)).toBe('{json roto')
  })

  it('tolera un acceso bloqueado al leer y comunica error al guardar o exportar', () => {
    vi.spyOn(window, 'localStorage', 'get').mockImplementation(() => {
      throw new DOMException('Bloqueado', 'SecurityError')
    })
    expect(getSiteSettings()).toEqual({})
    expect(() => saveSiteSettings({})).toThrow(ContentStorageError)
    expect(() => exportContentBackup()).toThrow(ContentStorageError)
  })
})

describe('ajustes en respaldos v2', () => {
  it('exporta siempre settings y conserva sus valores en un round-trip JSON', () => {
    expect(exportContentBackup().settings).toEqual({})
    const settings = { couple: { yourName: 'Alex', herName: 'Sam' }, dates: { relationshipStartDate: '2026-10-25' } }
    saveSiteSettings(settings)
    const backup = JSON.parse(JSON.stringify(exportContentBackup()))
    expect(backup.version).toBe(2)
    expect(backup.settings).toEqual(settings)
    localStorage.clear()
    restoreContentBackup(backup)
    expect(getSiteSettings()).toEqual(settings)
  })

  it('los respaldos v2 antiguos y v1 conservan ajustes ausentes', () => {
    const settings = { couple: { mainPairName: 'Nuestra historia' } }
    saveSiteSettings(settings)
    restoreContentBackup({ version: 2, content: { reasons: [] } })
    expect(getSiteSettings()).toEqual(settings)
    restoreContentBackup({ version: 1, monthlyLetters: [], settings: { couple: { yourName: 'Ignorado' } } })
    expect(getSiteSettings()).toEqual(settings)
  })

  it('acepta un respaldo solo de ajustes y {} explícito vuelve a los valores base', () => {
    localStorage.setItem(reasonsKey, '[{"id":"a","title":"Conservar"}]')
    restoreContentBackup({ version: 2, settings: { hero: { titleName: 'Sam' } } })
    expect(getSiteSettings()).toEqual({ hero: { titleName: 'Sam' } })
    const contentBeforeReset = localStorage.getItem(reasonsKey)
    const dispatch = vi.spyOn(window, 'dispatchEvent')
    restoreContentBackup({ version: 2, settings: {} })
    expect(getSiteSettings()).toEqual({})
    expect(localStorage.getItem(reasonsKey)).toBe(contentBeforeReset)
    expect(dispatch.mock.calls.map(([event]) => event.type)).toEqual([contentEvent])
    expect((dispatch.mock.calls[0][0] as CustomEvent).detail.collection).toBe('all')
  })

  it('la validación de ajustes del respaldo es pura y no cambia el input', () => {
    const input = { version: 2, settings: { couple: { yourName: '  Alex  ' } } }
    const serialized = JSON.stringify(input)
    expect(validateContentBackup(input).settings?.couple?.yourName).toBe('Alex')
    expect(JSON.stringify(input)).toBe(serialized)
    expect(localStorage.length).toBe(0)
  })

  it('ajustes inválidos abortan todo el respaldo antes de escribir contenido', () => {
    saveSiteSettings({ couple: { yourName: 'Anterior' } })
    const before = storageSnapshot()
    const write = vi.spyOn(Storage.prototype, 'setItem')
    const dispatch = vi.spyOn(window, 'dispatchEvent')
    expect(() => restoreContentBackup({ version: 2, content: { reasons: [{ id: 'nuevo', title: 'Nuevo' }] },
      settings: { dates: { metDate: '2025-02-29' } } })).toThrow(/Respaldo inválido/)
    expect(write).not.toHaveBeenCalled()
    expect(storageSnapshot()).toEqual(before)
    expect(dispatch).not.toHaveBeenCalled()
  })

  it('un fallo de cuota en ajustes revierte contenido, claves nuevas y marcador legacy juntos', () => {
    localStorage.setItem(reasonsKey, '[{"id":"anterior","title":"Anterior"}]')
    saveSiteSettings({ couple: { yourName: 'Anterior' } })
    localStorage.setItem('dato-ajeno', 'conservar')
    const before = storageSnapshot()
    const nativeSet = Storage.prototype.setItem
    let failed = false
    let writesBeforeFailure = 0
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (key, value) {
      if (key === SITE_SETTINGS_STORAGE_KEY && !failed) {
        failed = true
        throw new DOMException('Cuota de prueba', 'QuotaExceededError')
      }
      if (!failed) writesBeforeFailure++
      nativeSet.call(this, key, value)
    })
    const dispatch = vi.spyOn(window, 'dispatchEvent')
    expect(() => restoreContentBackup({ version: 2,
      content: { reasons: [{ id: 'nuevo', title: 'Nuevo' }] },
      settings: { couple: { yourName: 'Nuevo' } },
    })).toThrow(ContentStorageError)
    expect(writesBeforeFailure).toBeGreaterThan(0)
    expect(storageSnapshot()).toEqual(before)
    expect(localStorage.getItem(migratedKey)).toBeNull()
    expect(dispatch).not.toHaveBeenCalled()
  })

  it('un fallo leyendo ajustes previos aborta la transacción antes de cualquier escritura', () => {
    localStorage.setItem(reasonsKey, '[{"id":"anterior","title":"Anterior"}]')
    const nativeGet = Storage.prototype.getItem
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(function (key) {
      if (key === SITE_SETTINGS_STORAGE_KEY) throw new DOMException('Bloqueado', 'SecurityError')
      return nativeGet.call(this, key)
    })
    const write = vi.spyOn(Storage.prototype, 'setItem')
    expect(() => restoreContentBackup({ version: 2, content: { reasons: [] }, settings: {} })).toThrow(ContentStorageError)
    expect(write).not.toHaveBeenCalled()
    expect(nativeGet.call(localStorage, reasonsKey)).toContain('Anterior')
  })
})

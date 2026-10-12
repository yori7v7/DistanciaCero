import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  exportContentBackup, restoreContentBackup, getCollectionItems,
  getLegacyMonthlyLetters, getLegacyOpenWhenLetters, migrateLegacyLettersIfNeeded,
  saveCollectionItems, validateContentBackup,
} from '../services/contentService'
import { deleteCollectionItem } from '../repositories/localContentRepository'
import { ContentStorageError } from '../utils/localContentStore'
import { CONTENT_COLLECTIONS, type CollectionName, type ContentItem, type ContentSnapshot } from '../types/content'

const collections: CollectionName[] = [
  'reasons', 'promises', 'importantDates', 'futureDreams', 'timeline',
  'blackHoleGallery', 'playlist', 'monthlyLetters', 'openWhenLetters',
]
const letters = [
  { name: 'monthlyLetters' as const, legacy: 'distancia-cero-local-monthly-letters', read: getLegacyMonthlyLetters },
  { name: 'openWhenLetters' as const, legacy: 'distancia-cero-local-open-when', read: getLegacyOpenWhenLetters },
]
const migratedV1 = 'distancia-cero-legacy-migrated-v1'
const migratedV2 = 'distancia-cero-legacy-migrated-v2'
const contentKey = (name: string) => `distancia-cero-content-${name}`
const eventName = 'distancia-cero-content-updated'
const metadata = {
  createdBy: 'local-user2', updatedBy: 'local-user1',
  createdAt: '2024-02-03T04:05:06.000Z', updatedAt: '2025-06-07T08:09:10.000Z',
  source: 'local-dev', spaceId: 'preserved-space', displayLabel: 'Local 17',
}

function item(id: string | number, title = 'Contenido guardado'): ContentItem {
  return { id, title, isLocal: true, ...metadata, extraCompatible: { revision: 3 } }
}

function fullSnapshot(title = 'Contenido guardado'): ContentSnapshot {
  const snapshot: ContentSnapshot = { content: {}, overrides: {}, hidden: {} }
  for (const name of collections) {
    snapshot.content[name] = [item(`local-${name}`, title)]
    snapshot.overrides[name] = { 0: { id: 0, title: `Personalizado: ${name}` } }
    snapshot.hidden[name] = ['base-hidden', '2']
  }
  snapshot.content.monthlyLetters![0].content = ['Párrafo uno', 'Párrafo dos']
  snapshot.content.openWhenLetters![0].locked = true
  snapshot.content.timeline![0].details = ['Recuerdo uno', 'Recuerdo dos']
  snapshot.content.blackHoleGallery![0].image = 'data:image/png;base64,c3ludGhldGlj'
  snapshot.content.playlist![0].src = '/audio/prueba.mp3'
  return snapshot
}

function seed(snapshot = fullSnapshot(), migrated = true): void {
  for (const name of collections) {
    if (Object.hasOwn(snapshot.content, name)) localStorage.setItem(contentKey(name), JSON.stringify(snapshot.content[name]))
    if (Object.hasOwn(snapshot.overrides, name)) localStorage.setItem(`${contentKey(name)}-overrides`, JSON.stringify(snapshot.overrides[name]))
    if (Object.hasOwn(snapshot.hidden, name)) localStorage.setItem(`${contentKey(name)}-hidden`, JSON.stringify(snapshot.hidden[name]))
  }
  if (migrated) localStorage.setItem(migratedV2, '1')
}

function storageSnapshot(): Record<string, string> {
  const entries: [string, string][] = []
  for (let index = 0; index < localStorage.length; index++) {
    const key = localStorage.key(index)!
    entries.push([key, localStorage.getItem(key)!])
  }
  return Object.fromEntries(entries.sort(([a], [b]) => a.localeCompare(b)))
}

function contentEvents(spy: ReturnType<typeof vi.spyOn>): Event[] {
  return spy.mock.calls.map(call => call[0] as Event).filter(event => event.type === eventName)
}

beforeEach(() => {
  localStorage.clear()
  vi.stubEnv('VITE_REMOTE_CONTENT_ENABLED', 'false')
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllEnvs()
})

describe.each(letters)('migración y restauración de $name', ({ name, legacy, read }) => {
  it.each([false, true])('preserva unión visible, precedencia estándar y metadata con marcador v1=%s', oldMarker => {
    const standard = item(0, 'Versión estándar')
    const legacyOnly = { id: 'legacy-only', title: 'Carta antigua', ...metadata }
    localStorage.setItem(contentKey(name), JSON.stringify([standard]))
    localStorage.setItem(legacy, JSON.stringify([{ id: '0', title: 'Copia vieja' }, legacyOnly]))
    if (oldMarker) localStorage.setItem(migratedV1, '1')
    const legacyBefore = localStorage.getItem(legacy)

    expect(read()).toEqual([standard, { ...legacyOnly, isLocal: true }])
    expect(migrateLegacyLettersIfNeeded()).toBe(true)
    expect(getCollectionItems(name)).toEqual([standard, { ...legacyOnly, isLocal: true }])
    expect(localStorage.getItem(legacy)).toBe(legacyBefore)
    expect(localStorage.getItem(migratedV2)).toBe('1')
    expect(migrateLegacyLettersIfNeeded()).toBe(false)
  })

  it('no resucita una carta legacy borrada después de migrar, ni al exportar', () => {
    localStorage.setItem(legacy, JSON.stringify([{ id: 'old', title: 'Anterior' }]))
    localStorage.setItem(migratedV1, '1')
    migrateLegacyLettersIfNeeded()
    deleteCollectionItem(name, 'old')
    expect(read()).toEqual([])
    expect(getCollectionItems(name)).toEqual([])
    expect(exportContentBackup().content[name]).toEqual([])
    migrateLegacyLettersIfNeeded()
    expect(read()).toEqual([])
    expect(localStorage.getItem(legacy)).not.toBeNull()
  })

  it.each([1, 2])('v%s reemplaza el mismo ID y elimina cartas no incluidas sin regenerar metadata', version => {
    localStorage.setItem(legacy, JSON.stringify([item('same', 'Vieja'), item('removed')]))
    migrateLegacyLettersIfNeeded()
    const restored = { ...item('same', 'Restaurada'), createdBy: 'autor-histórico' }
    restoreContentBackup(version === 1
      ? { version, [name]: [restored] }
      : { version, content: { [name]: [restored] } })
    expect(read()).toEqual([restored])
    expect(exportContentBackup().content[name]).toEqual([restored])
    restoreContentBackup(version === 1 ? { version, [name]: [] } : { version, content: { [name]: [] } })
    expect(read()).toEqual([])
  })
})

describe('respaldo completo y parcial', () => {
  it('conserva las nueve colecciones, overrides, ocultos, IDs y metadata al exportar e importar JSON', () => {
    expect(CONTENT_COLLECTIONS).toEqual(collections)
    const original = fullSnapshot()
    seed(original)
    const backup = exportContentBackup()
    expect(backup).toMatchObject({ version: 2, ...original })
    expect(Number.isNaN(Date.parse(backup.exportedAt))).toBe(false)
    localStorage.clear()
    restoreContentBackup(JSON.parse(JSON.stringify(backup)))
    expect(exportContentBackup()).toMatchObject(original)
    for (const name of collections) expect(getCollectionItems(name)).toEqual(original.content[name])
  })

  it.each(collections)('%s: vacío explícito borra y ausencia conserva las otras colecciones y secciones', name => {
    const original = fullSnapshot()
    seed(original)
    restoreContentBackup({ version: 2, content: { [name]: [] } })
    const contentOnly = exportContentBackup()
    expect(contentOnly.content).toEqual({ ...original.content, [name]: [] })
    expect(contentOnly.overrides).toEqual(original.overrides)
    expect(contentOnly.hidden).toEqual(original.hidden)
    restoreContentBackup({ version: 2, overrides: { [name]: {} }, hidden: { [name]: [] } })
    const after = exportContentBackup()
    expect(after.content).toEqual(contentOnly.content)
    expect(after.overrides).toEqual({ ...original.overrides, [name]: {} })
    expect(after.hidden).toEqual({ ...original.hidden, [name]: [] })
  })

  it('v1 parcial conserva otra carta, las siete colecciones, overrides, ocultos y progreso', () => {
    const original = fullSnapshot()
    seed(original)
    localStorage.setItem('distancia-cero-monthly-letter-0', 'opened')
    localStorage.setItem('distancia-cero-sim-unlocked', '1')
    restoreContentBackup({ version: 1, monthlyLetters: [] })
    expect(exportContentBackup()).toMatchObject({ ...original, content: { ...original.content, monthlyLetters: [] } })
    expect(localStorage.getItem('distancia-cero-monthly-letter-0')).toBe('opened')
    expect(localStorage.getItem('distancia-cero-sim-unlocked')).toBe('1')
  })

  it('tolera items históricos sin metadata, normaliza IDs ocultos y emite éxito con ambos campos del evento', () => {
    const dispatch = vi.spyOn(window, 'dispatchEvent')
    restoreContentBackup({ version: 2, content: { reasons: [{ id: 0, title: 'Sin metadata' }] },
      overrides: { reasons: { 0: { title: 'Original personalizado' } } }, hidden: { reasons: [0, '0', 2] } })
    expect(getCollectionItems('reasons')).toEqual([{ id: 0, title: 'Sin metadata', isLocal: true }])
    expect(exportContentBackup().hidden.reasons).toEqual(['0', '2'])
    const events = contentEvents(dispatch)
    expect(events).toHaveLength(1)
    expect((events[0] as CustomEvent).detail).toEqual({ collection: 'all', collectionName: 'all' })
  })
})

const malformed: [string, unknown][] = [
  ['raíz nula', null], ['raíz array', []], ['versión desconocida', { version: 3 }],
  ['sin colecciones', { version: 2, content: {} }],
  ['contenedor array', { version: 2, content: [] }],
  ['colección desconocida', { version: 2, content: { desconocida: [] } }],
  ['colección no array', { version: 2, content: { reasons: {} } }],
  ['item nulo', { version: 2, content: { reasons: [null] } }],
  ['item primitivo', { version: 2, content: { reasons: ['texto'] } }],
  ['ID ausente', { version: 2, content: { reasons: [{ title: 'Sin ID' }] } }],
  ['ID vacío', { version: 2, content: { reasons: [{ id: '  ' }] } }],
  ['ID objeto', { version: 2, content: { reasons: [{ id: {} }] } }],
  ['ID no finito', { version: 2, content: { reasons: [{ id: Infinity }] } }],
  ['IDs equivalentes duplicados', { version: 2, content: { reasons: [{ id: 0 }, { id: '0' }] } }],
  ['campo de texto inválido', { version: 2, content: { reasons: [{ id: 'a', title: {} }] } }],
  ['párrafos inválidos', { version: 2, content: { monthlyLetters: [{ id: 'a', content: ['bien', {}] }] } }],
  ['pie de historia inválido', { version: 2, content: { timeline: [{ id: 'a', caption: {} }] } }],
  ['tipo de historia inválido', { version: 2, content: { timeline: [{ id: 'a', type: {} }] } }],
  ['detalles antiguos inválidos', { version: 2, content: { timeline: [{ id: 'a', features: [{}] }] } }],
  ['año antiguo inválido', { version: 2, content: { timeline: [{ id: 'a', year: {} }] } }],
  ['override nulo', { version: 2, overrides: { reasons: { a: null } } }],
  ['ID de override discordante', { version: 2, overrides: { reasons: { a: { id: 'b' } } } }],
  ['oculto inválido', { version: 2, hidden: { reasons: [{}] } }],
  ['objeto peligroso anidado', JSON.parse('{"version":2,"content":{"reasons":[{"id":"a","extra":{"__proto__":{}}}]}}')],
  ['v1 segunda carta inválida', { version: 1, monthlyLetters: [], openWhenLetters: [null] }],
]

describe('validación completa antes de guardar', () => {
  it('conserva campos antiguos compatibles de historia', () => {
    const item = { id: 'historia', year: 2024, caption: 'Recuerdo', type: 'Aventura', features: ['Un detalle'] }
    restoreContentBackup({ version: 2, content: { timeline: [item] } })
    expect(exportContentBackup().content.timeline).toEqual([{ ...item, isLocal: true }])
  })
  it.each(malformed)('rechaza %s sin escrituras, migración ni evento de éxito', (_label, input) => {
    seed(fullSnapshot(), false)
    localStorage.setItem(letters[0].legacy, JSON.stringify([item('legacy')]))
    const before = storageSnapshot()
    const write = vi.spyOn(Storage.prototype, 'setItem')
    const dispatch = vi.spyOn(window, 'dispatchEvent')
    expect(() => restoreContentBackup(input)).toThrow(/Respaldo inválido/)
    expect(write).not.toHaveBeenCalled()
    expect(storageSnapshot()).toEqual(before)
    expect(contentEvents(dispatch)).toEqual([])
  })

  it('rechaza un campo inválido tardío aunque anteriores colecciones sean válidas', () => {
    seed()
    const before = storageSnapshot()
    const dispatch = vi.spyOn(window, 'dispatchEvent')
    expect(() => restoreContentBackup({ version: 2, ...fullSnapshot('Cambio'),
      hidden: { openWhenLetters: [null] } })).toThrow(/Respaldo inválido/)
    expect(storageSnapshot()).toEqual(before)
    expect(contentEvents(dispatch)).toEqual([])
  })

  it('la validación pura no modifica el documento original ni escribe almacenamiento', () => {
    const input = { version: 2, content: { reasons: [{ id: 0, title: 'Original' }] } }
    const before = JSON.stringify(input)
    expect(validateContentBackup(input).content.reasons![0].isLocal).toBe(true)
    expect(JSON.stringify(input)).toBe(before)
    expect(localStorage.length).toBe(0)
  })
})

describe('fallos de almacenamiento y recuperación', () => {
  it('revierte todas las escrituras previas y claves nuevas si la cuota falla al final, incluido el marcador', () => {
    seed(fullSnapshot(), false)
    localStorage.removeItem(contentKey('futureDreams'))
    localStorage.setItem('dato-ajeno', 'no tocar')
    const before = storageSnapshot()
    const nativeSet = Storage.prototype.setItem
    let failed = false
    let writesBeforeFailure = 0
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (key, value) {
      if (key === `${contentKey('openWhenLetters')}-hidden` && !failed) {
        failed = true
        throw new DOMException('Cuota de prueba', 'QuotaExceededError')
      }
      if (!failed) writesBeforeFailure++
      nativeSet.call(this, key, value)
    })
    const dispatch = vi.spyOn(window, 'dispatchEvent')
    const next = fullSnapshot('Importado')
    next.hidden.openWhenLetters = ['nuevo-oculto']
    expect(() => restoreContentBackup({ version: 2, ...next })).toThrow(ContentStorageError)
    expect(writesBeforeFailure).toBeGreaterThan(5)
    expect(storageSnapshot()).toEqual(before)
    expect(contentEvents(dispatch)).toEqual([])
  })

  it('informa recuperación incompleta cuando también falla restaurar un valor anterior', () => {
    seed()
    const oldReasons = localStorage.getItem(contentKey('reasons'))
    const nativeSet = Storage.prototype.setItem
    let failed = false
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (key, value) {
      if (key === contentKey('promises') && !failed) {
        failed = true
        throw new DOMException('Cuota de prueba', 'QuotaExceededError')
      }
      if (failed && key === contentKey('reasons') && value === oldReasons) {
        throw new DOMException('Recuperación bloqueada', 'SecurityError')
      }
      nativeSet.call(this, key, value)
    })
    const dispatch = vi.spyOn(window, 'dispatchEvent')
    let failure: unknown
    try { restoreContentBackup({ version: 2, ...fullSnapshot('Nuevo') }) } catch (error) { failure = error }
    expect(failure).toBeInstanceOf(ContentStorageError)
    expect(failure).toMatchObject({ recoveryIncomplete: true })
    expect((failure as Error).message).toMatch(/ni recuperar todo el estado anterior/)
    expect(localStorage.getItem(contentKey('reasons'))).not.toBe(oldReasons)
    expect(contentEvents(dispatch)).toEqual([])
  })

  it('un fallo leyendo snapshots aborta antes de escribir y no anuncia éxito', () => {
    seed()
    const before = storageSnapshot()
    const nativeGet = Storage.prototype.getItem
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(function (key) {
      if (key === contentKey('promises')) throw new DOMException('Acceso bloqueado', 'SecurityError')
      return nativeGet.call(this, key)
    })
    const write = vi.spyOn(Storage.prototype, 'setItem')
    const dispatch = vi.spyOn(window, 'dispatchEvent')
    expect(() => restoreContentBackup({ version: 2, ...fullSnapshot('Nuevo') })).toThrow(ContentStorageError)
    expect(write).not.toHaveBeenCalled()
    expect(contentEvents(dispatch)).toEqual([])
    vi.restoreAllMocks()
    expect(storageSnapshot()).toEqual(before)
  })

  it('no exporta un respaldo vacío ni finge guardado si el acceso a localStorage está bloqueado', () => {
    seed()
    const before = storageSnapshot()
    vi.spyOn(window, 'localStorage', 'get').mockImplementation(() => {
      throw new DOMException('Acceso bloqueado', 'SecurityError')
    })
    const dispatch = vi.spyOn(window, 'dispatchEvent')
    expect(() => exportContentBackup()).toThrow(ContentStorageError)
    expect(() => restoreContentBackup({ version: 2, content: { reasons: [] } })).toThrow(ContentStorageError)
    expect(() => saveCollectionItems('reasons', [])).toThrow(ContentStorageError)
    expect(contentEvents(dispatch)).toEqual([])
    vi.restoreAllMocks()
    expect(storageSnapshot()).toEqual(before)
  })
})

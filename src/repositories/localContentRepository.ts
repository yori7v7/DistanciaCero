import { CONTENT_COLLECTIONS, type ContentItem, type ContentSnapshot, type OverrideMap } from '../types/content'
import {
  addLocalItem,
  deleteLocalItem,
  deleteLocalOverride,
  getHiddenItemIds,
  getLocalItems,
  getLocalOverrides,
  hideDefaultItem,
  mergeWithLocalItems,
  restoreHiddenItem,
  saveHiddenItemIds,
  saveLocalItems,
  saveLocalOverrides,
  setLocalOverride,
  updateLocalItem,
  ContentStorageError,
  getStorageKey,
  getOverrideStorageKey,
  getHiddenStorageKey,
  writeStorageTransaction
} from '../utils/localContentStore'
import { buildUpdateMetadata, withCreateMetadata } from '../services/contentMetadataService'
import type { SiteSettings } from '../types/siteSettings'
import { SITE_SETTINGS_STORAGE_KEY, validateSiteSettings } from '../utils/siteSettings'

const LEGACY_MONTHLY_LETTERS_KEY = 'distancia-cero-local-monthly-letters'
const LEGACY_OPEN_WHEN_LETTERS_KEY = 'distancia-cero-local-open-when'
const SIMULATION_UNLOCKED_KEY = 'distancia-cero-sim-unlocked'
const LEGACY_MIGRATED_KEY = 'distancia-cero-legacy-migrated-v2'
const LEGACY_KEYS: Record<string, string> = {
  monthlyLetters: LEGACY_MONTHLY_LETTERS_KEY,
  openWhenLetters: LEGACY_OPEN_WHEN_LETTERS_KEY
}

function canUseLocalStorage(): boolean {
  if (typeof window === 'undefined') return false

  try {
    return typeof window.localStorage !== 'undefined'
  } catch {
    return false
  }
}

function safeGetItem(key: string): string | null {
  if (!canUseLocalStorage()) return null

  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

function safeSetItem(key: string, value: string): void {
  if (!canUseLocalStorage()) return

  try {
    window.localStorage.setItem(key, value)
  } catch {
    // localStorage puede fallar en modo privado o por cuota excedida.
  }
}

function safeRemoveItem(key: string): void {
  if (!canUseLocalStorage()) return

  try {
    window.localStorage.removeItem(key)
  } catch {
    // Mantener helpers legacy sin lanzar errores.
  }
}

function safeReadJsonArray(key: string, strict = false): ContentItem[] {
  try {
    const rawValue = strict ? window.localStorage.getItem(key) : safeGetItem(key)
    const parsedValue: unknown = rawValue ? JSON.parse(rawValue) : []
    if (!Array.isArray(parsedValue) && strict) throw new ContentStorageError()
    return Array.isArray(parsedValue) ? parsedValue : []
  } catch {
    if (strict) throw new ContentStorageError()
    return []
  }
}

function getSafeIdSegment(id: string | number | null | undefined): string {
  if (id === null || id === undefined) return ''
  return String(id).trim()
}

export function getCollectionItems(collectionName: string): ContentItem[] {
  return readCollectionItems(collectionName)
}

function readCollectionItems(collectionName: string, strict = false): ContentItem[] {
  const standard = getLocalItems(collectionName, strict)
  if (!Object.hasOwn(LEGACY_KEYS, collectionName) || safeGetItem(LEGACY_MIGRATED_KEY) === '1') return standard
  const seen = new Set<string>()
  return [...standard, ...safeReadJsonArray(LEGACY_KEYS[collectionName], strict)].filter(item => {
    const id = String(item.id)
    if (seen.has(id)) return false
    seen.add(id)
    return true
  }).map(item => ({ ...item, isLocal: true }))
}

function prepareLetterMutation(collectionName: string): void {
  if (Object.hasOwn(LEGACY_KEYS, collectionName)) migrateLegacyLettersIfNeeded()
}

export function saveCollectionItems(collectionName: string, items: ContentItem[]): ContentItem[] {
  if (Object.hasOwn(LEGACY_KEYS, collectionName)) {
    const safeItems = Array.isArray(items) ? items.map(item => ({ ...item, isLocal: true })) : []
    restoreContentSnapshot({ content: { [collectionName]: safeItems }, overrides: {}, hidden: {} })
    return safeItems
  }
  return saveLocalItems(collectionName, items)
}

export function addCollectionItem(collectionName: string, item: ContentItem): ContentItem[] {
  prepareLetterMutation(collectionName)
  return addLocalItem(collectionName, withCreateMetadata(item))
}

export function updateCollectionItem(collectionName: string, id: string, patch: Partial<ContentItem>): ContentItem[] {
  prepareLetterMutation(collectionName)
  const currentItem = getLocalItems(collectionName).find(
    (item) => String(item.id) === String(id) && item.isLocal
  )
  const updateMetadata = buildUpdateMetadata()

  return updateLocalItem(collectionName, id, {
    ...patch,
    updatedBy: updateMetadata.updatedBy,
    updatedAt: updateMetadata.updatedAt,
    source: currentItem?.source || updateMetadata.source,
    spaceId: currentItem?.spaceId || updateMetadata.spaceId
  })
}

export function deleteCollectionItem(collectionName: string, id: string): ContentItem[] {
  prepareLetterMutation(collectionName)
  return deleteLocalItem(collectionName, id)
}

export function getCollectionOverrides(collectionName: string): OverrideMap {
  return getLocalOverrides(collectionName)
}

export function saveCollectionOverrides(collectionName: string, overrides: OverrideMap): OverrideMap {
  return saveLocalOverrides(collectionName, overrides)
}

export function setCollectionOverride(collectionName: string, id: string, patch: Partial<ContentItem>): OverrideMap {
  return setLocalOverride(collectionName, id, patch)
}

export function deleteCollectionOverride(collectionName: string, id: string): OverrideMap {
  return deleteLocalOverride(collectionName, id)
}

export function getCollectionHiddenIds(collectionName: string): string[] {
  return getHiddenItemIds(collectionName)
}

export function saveCollectionHiddenIds(collectionName: string, ids: string[]): string[] {
  return saveHiddenItemIds(collectionName, ids)
}

export function hideCollectionItem(collectionName: string, id: string): string[] {
  return hideDefaultItem(collectionName, id)
}

export function restoreCollectionItem(collectionName: string, id: string): string[] {
  return restoreHiddenItem(collectionName, id)
}

export function mergeCollectionWithLocal(defaultItems: ContentItem[], collectionName: string): ContentItem[] {
  return mergeWithLocalItems(defaultItems, collectionName)
}

export function getLegacyMonthlyLetters(): ContentItem[] {
  return getCollectionItems('monthlyLetters')
}

export function saveLegacyMonthlyLetters(items: ContentItem[]): ContentItem[] {
  return saveCollectionItems('monthlyLetters', items)
}

export function getLegacyOpenWhenLetters(): ContentItem[] {
  return getCollectionItems('openWhenLetters')
}

export function saveLegacyOpenWhenLetters(items: ContentItem[]): ContentItem[] {
  return saveCollectionItems('openWhenLetters', items)
}

export function isMonthlyLetterOpened(id: string | number): boolean {
  const safeId = getSafeIdSegment(id)
  if (!safeId) return false

  return safeGetItem(`distancia-cero-monthly-letter-${safeId}`) === 'opened'
}

export function setMonthlyLetterOpened(id: string | number, value = true): void {
  const safeId = getSafeIdSegment(id)
  if (!safeId) return

  const key = `distancia-cero-monthly-letter-${safeId}`
  if (value) {
    safeSetItem(key, 'opened')
  } else {
    safeRemoveItem(key)
  }
}

export function isOpenWhenLetterOpened(id: string | number): boolean {
  const safeId = getSafeIdSegment(id)
  if (!safeId) return false

  return safeGetItem(`distancia-cero-open-when-${safeId}`) === 'opened'
}

export function setOpenWhenLetterOpened(id: string | number, value = true): void {
  const safeId = getSafeIdSegment(id)
  if (!safeId) return

  const key = `distancia-cero-open-when-${safeId}`
  if (value) {
    safeSetItem(key, 'opened')
  } else {
    safeRemoveItem(key)
  }
}

export function getSimulationUnlocked(): boolean {
  return safeGetItem(SIMULATION_UNLOCKED_KEY) === '1'
}

export function setSimulationUnlocked(value: boolean): void {
  if (value) {
    safeSetItem(SIMULATION_UNLOCKED_KEY, '1')
  } else {
    safeRemoveItem(SIMULATION_UNLOCKED_KEY)
  }
}

/** Conserva la unión visible, con prioridad estándar. Las claves antiguas quedan archivadas. */
export function migrateLegacyLettersIfNeeded(): boolean {
  if (safeGetItem(LEGACY_MIGRATED_KEY) === '1') return false
  restoreContentSnapshot({ content: {}, overrides: {}, hidden: {} })
  return true
}

/** Incluye la migración y el respaldo en una sola escritura recuperable. */
export function restoreContentSnapshot(snapshot: ContentSnapshot): void {
  const values: Record<string, unknown> = {}
  if (safeGetItem(LEGACY_MIGRATED_KEY) !== '1') {
    for (const name of ['monthlyLetters', 'openWhenLetters'] as const) {
      if (!Object.hasOwn(snapshot.content, name)) values[getStorageKey(name)] = readCollectionItems(name, true)
    }
    values[LEGACY_MIGRATED_KEY] = 1
  }
  for (const name of CONTENT_COLLECTIONS) {
    if (Object.hasOwn(snapshot.content, name)) values[getStorageKey(name)] = snapshot.content[name]
    if (Object.hasOwn(snapshot.overrides, name)) values[getOverrideStorageKey(name)] = snapshot.overrides[name]
    if (Object.hasOwn(snapshot.hidden, name)) values[getHiddenStorageKey(name)] = snapshot.hidden[name]
  }
  if (Object.hasOwn(snapshot, 'settings')) values[SITE_SETTINGS_STORAGE_KEY] = validateSiteSettings(snapshot.settings)
  writeStorageTransaction(values)
}

export function getContentSnapshot(): ContentSnapshot {
  const snapshot: ContentSnapshot = { content: {}, overrides: {}, hidden: {} }
  for (const name of CONTENT_COLLECTIONS) {
    snapshot.content[name] = readCollectionItems(name, true)
    snapshot.overrides[name] = getLocalOverrides(name, true)
    snapshot.hidden[name] = getHiddenItemIds(name, true)
  }
  snapshot.settings = getSiteSettings(true)
  return snapshot
}

/** La UI tolera datos inaccesibles; los respaldos requieren una lectura íntegra. */
export function getSiteSettings(strict = false): SiteSettings {
  try {
    if (!canUseLocalStorage()) throw new ContentStorageError()
    const raw = window.localStorage.getItem(SITE_SETTINGS_STORAGE_KEY)
    return raw === null ? {} : validateSiteSettings(JSON.parse(raw))
  } catch {
    if (strict) throw new ContentStorageError()
    return {}
  }
}

export function saveSiteSettings(settings: SiteSettings): SiteSettings {
  const checked = validateSiteSettings(settings)
  writeStorageTransaction({ [SITE_SETTINGS_STORAGE_KEY]: checked })
  return checked
}

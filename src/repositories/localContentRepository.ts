import type { ContentItem, OverrideMap } from '../types/content'
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
  updateLocalItem
} from '../utils/localContentStore'
import { buildUpdateMetadata, withCreateMetadata } from '../services/contentMetadataService'

const LEGACY_MONTHLY_LETTERS_KEY = 'distancia-cero-local-monthly-letters'
const LEGACY_OPEN_WHEN_LETTERS_KEY = 'distancia-cero-local-open-when'
const SIMULATION_UNLOCKED_KEY = 'distancia-cero-sim-unlocked'

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

function safeReadJsonArray(key: string): ContentItem[] {
  try {
    const rawValue = safeGetItem(key)
    const parsedValue: unknown = rawValue ? JSON.parse(rawValue) : []
    return Array.isArray(parsedValue) ? parsedValue : []
  } catch {
    return []
  }
}

function safeSaveJsonArray(key: string, items: ContentItem[]): ContentItem[] {
  const safeItems = Array.isArray(items) ? items : []
  safeSetItem(key, JSON.stringify(safeItems))
  return safeItems
}

function getSafeIdSegment(id: string | number | null | undefined): string {
  if (id === null || id === undefined) return ''
  return String(id).trim()
}

export function getCollectionItems(collectionName: string): ContentItem[] {
  return getLocalItems(collectionName)
}

export function saveCollectionItems(collectionName: string, items: ContentItem[]): ContentItem[] {
  return saveLocalItems(collectionName, items)
}

export function addCollectionItem(collectionName: string, item: ContentItem): ContentItem[] {
  return addLocalItem(collectionName, withCreateMetadata(item))
}

export function updateCollectionItem(collectionName: string, id: string, patch: Partial<ContentItem>): ContentItem[] {
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
  return safeReadJsonArray(LEGACY_MONTHLY_LETTERS_KEY)
}

export function saveLegacyMonthlyLetters(items: ContentItem[]): ContentItem[] {
  return safeSaveJsonArray(LEGACY_MONTHLY_LETTERS_KEY, items)
}

export function getLegacyOpenWhenLetters(): ContentItem[] {
  return safeReadJsonArray(LEGACY_OPEN_WHEN_LETTERS_KEY)
}

export function saveLegacyOpenWhenLetters(items: ContentItem[]): ContentItem[] {
  return safeSaveJsonArray(LEGACY_OPEN_WHEN_LETTERS_KEY, items)
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

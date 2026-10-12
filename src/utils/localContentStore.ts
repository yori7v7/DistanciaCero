import type { ContentItem, OverrideMap } from '../types/content'

// ─── Storage key maps ───

const COLLECTION_KEYS: Record<string, string> = {
  reasons: 'distancia-cero-content-reasons',
  promises: 'distancia-cero-content-promises',
  importantDates: 'distancia-cero-content-importantDates',
  futureDreams: 'distancia-cero-content-futureDreams',
  timeline: 'distancia-cero-content-timeline',
  blackHoleGallery: 'distancia-cero-content-blackHoleGallery',
  playlist: 'distancia-cero-content-playlist'
}

const OVERRIDE_KEYS: Record<string, string> = {
  reasons: 'distancia-cero-content-reasons-overrides',
  promises: 'distancia-cero-content-promises-overrides',
  monthlyLetters: 'distancia-cero-content-monthlyLetters-overrides',
  openWhenLetters: 'distancia-cero-content-openWhenLetters-overrides',
  importantDates: 'distancia-cero-content-importantDates-overrides',
  futureDreams: 'distancia-cero-content-futureDreams-overrides',
  timeline: 'distancia-cero-content-timeline-overrides',
  blackHoleGallery: 'distancia-cero-content-blackHoleGallery-overrides',
  playlist: 'distancia-cero-content-playlist-overrides'
}

const HIDDEN_KEYS: Record<string, string> = {
  reasons: 'distancia-cero-content-reasons-hidden',
  promises: 'distancia-cero-content-promises-hidden',
  monthlyLetters: 'distancia-cero-content-monthlyLetters-hidden',
  openWhenLetters: 'distancia-cero-content-openWhenLetters-hidden',
  importantDates: 'distancia-cero-content-importantDates-hidden',
  futureDreams: 'distancia-cero-content-futureDreams-hidden',
  timeline: 'distancia-cero-content-timeline-hidden',
  blackHoleGallery: 'distancia-cero-content-blackHoleGallery-hidden',
  playlist: 'distancia-cero-content-playlist-hidden'
}

// ─── Internal helpers ───

export function getStorageKey(collectionName: string): string {
  return COLLECTION_KEYS[collectionName] || `distancia-cero-content-${collectionName}`
}

export function getOverrideStorageKey(collectionName: string): string {
  return OVERRIDE_KEYS[collectionName] || `distancia-cero-content-${collectionName}-overrides`
}

export function getHiddenStorageKey(collectionName: string): string {
  return HIDDEN_KEYS[collectionName] || `distancia-cero-content-${collectionName}-hidden`
}

function canUseLocalStorage(): boolean {
  try {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
  } catch {
    return false
  }
}

export class ContentStorageError extends Error {
  constructor(public readonly recoveryIncomplete = false) {
    super(recoveryIncomplete
      ? 'No se pudo guardar ni recuperar todo el estado anterior. Conserva tu archivo de respaldo y revisa el almacenamiento del navegador antes de continuar.'
      : 'No se pudo guardar el contenido. Comprueba el espacio y los permisos de almacenamiento del navegador e inténtalo de nuevo.')
    this.name = 'ContentStorageError'
  }
}

/** Serializa y captura el estado antes de escribir; revierte si una escritura falla. */
export function writeStorageTransaction(values: Record<string, unknown>): void {
  const changed: string[] = []
  const previous = new Map<string, string | null>()
  let storage: Storage
  try {
    const entries = Object.entries(values).map(([key, value]) => [key, JSON.stringify(value)] as const)
    storage = window.localStorage
    for (const [key] of entries) previous.set(key, storage.getItem(key))
    for (const [key, value] of entries) {
      if (previous.get(key) === value) continue
      storage.setItem(key, value)
      changed.push(key)
    }
  } catch {
    let recoveryIncomplete = false
    // Liberar primero las escrituras nuevas permite recuperar el espacio previo.
    for (const key of changed) {
      try { storage!.removeItem(key) } catch { recoveryIncomplete = true }
    }
    for (const key of changed) {
      const value = previous.get(key)
      if (value !== null) {
        try { storage!.setItem(key, value!) } catch { recoveryIncomplete = true }
      }
    }
    throw new ContentStorageError(recoveryIncomplete)
  }
}

// ─── Items ───

export function getLocalItems(collectionName: string, strict = false): ContentItem[] {
  if (!canUseLocalStorage()) {
    if (strict) throw new ContentStorageError()
    return []
  }

  try {
    const rawValue = window.localStorage.getItem(getStorageKey(collectionName))
    const parsedValue: unknown = rawValue ? JSON.parse(rawValue) : []
    if (!Array.isArray(parsedValue) && strict) throw new ContentStorageError()
    return Array.isArray(parsedValue) ? parsedValue : []
  } catch {
    if (strict) throw new ContentStorageError()
    return []
  }
}

export function saveLocalItems(collectionName: string, items: ContentItem[]): ContentItem[] {
  const safeItems = Array.isArray(items) ? items : []
  writeStorageTransaction({ [getStorageKey(collectionName)]: safeItems })
  return safeItems
}

export function addLocalItem(collectionName: string, item: ContentItem): ContentItem[] {
  const currentItems = getLocalItems(collectionName, true)
  const localIndexes = currentItems
    .map((currentItem) => {
      const match = String(currentItem.displayLabel || '').match(/^Local (\d+)$/)
      return match ? Number(match[1]) : 0
    })
  const nextLocalIndex = Math.max(0, ...localIndexes) + 1
  const nextItem: ContentItem = {
    ...item,
    isLocal: true,
    displayLabel: item.displayLabel || `Local ${nextLocalIndex}`
  }
  const updatedItems = [...currentItems, nextItem]
  saveLocalItems(collectionName, updatedItems)
  return updatedItems
}

export function updateLocalItem(collectionName: string, id: string, patch: Partial<ContentItem>): ContentItem[] {
  const currentItems = getLocalItems(collectionName, true)
  const updatedItems = currentItems.map((item) => {
    if (String(item.id) !== String(id) || !item.isLocal) return item
    return {
      ...item,
      ...patch,
      id: item.id,
      isLocal: true,
      displayLabel: item.displayLabel || patch.displayLabel
    }
  })
  saveLocalItems(collectionName, updatedItems)
  return updatedItems
}

export function deleteLocalItem(collectionName: string, id: string): ContentItem[] {
  const currentItems = getLocalItems(collectionName, true)
  const updatedItems = currentItems.filter((item) => String(item.id) !== String(id) || !item.isLocal)
  saveLocalItems(collectionName, updatedItems)
  return updatedItems
}

// ─── Overrides ───

export function getLocalOverrides(collectionName: string, strict = false): OverrideMap {
  if (!canUseLocalStorage()) {
    if (strict) throw new ContentStorageError()
    return {}
  }

  try {
    const rawValue = window.localStorage.getItem(getOverrideStorageKey(collectionName))
    const parsedValue: unknown = rawValue ? JSON.parse(rawValue) : {}
    const valid = parsedValue && !Array.isArray(parsedValue) && typeof parsedValue === 'object'
    if (!valid && strict) throw new ContentStorageError()
    return valid ? parsedValue as OverrideMap : {}
  } catch {
    if (strict) throw new ContentStorageError()
    return {}
  }
}

export function saveLocalOverrides(collectionName: string, overrides: OverrideMap): OverrideMap {
  const safeOverrides = overrides && !Array.isArray(overrides) && typeof overrides === 'object' ? overrides : {}
  writeStorageTransaction({ [getOverrideStorageKey(collectionName)]: safeOverrides })
  return safeOverrides
}

export function setLocalOverride(collectionName: string, id: string, patch: Partial<ContentItem>): OverrideMap {
  const currentOverrides = getLocalOverrides(collectionName, true)
  const updatedOverrides: OverrideMap = {
    ...currentOverrides,
    [String(id)]: {
      ...patch,
      id
    }
  }

  saveLocalOverrides(collectionName, updatedOverrides)
  return updatedOverrides
}

export function deleteLocalOverride(collectionName: string, id: string): OverrideMap {
  const currentOverrides = getLocalOverrides(collectionName, true)
  const updatedOverrides = { ...currentOverrides }
  delete updatedOverrides[String(id)]
  saveLocalOverrides(collectionName, updatedOverrides)
  return updatedOverrides
}

// ─── Hidden ───

export function getHiddenItemIds(collectionName: string, strict = false): string[] {
  if (!canUseLocalStorage()) {
    if (strict) throw new ContentStorageError()
    return []
  }

  try {
    const rawValue = window.localStorage.getItem(getHiddenStorageKey(collectionName))
    const parsedValue: unknown = rawValue ? JSON.parse(rawValue) : []
    if (!Array.isArray(parsedValue) && strict) throw new ContentStorageError()
    return Array.isArray(parsedValue) ? parsedValue.map((id) => String(id)) : []
  } catch {
    if (strict) throw new ContentStorageError()
    return []
  }
}

export function saveHiddenItemIds(collectionName: string, ids: string[]): string[] {
  const safeIds = Array.isArray(ids) ? ids.map((id) => String(id)) : []
  writeStorageTransaction({ [getHiddenStorageKey(collectionName)]: safeIds })
  return safeIds
}

export function hideDefaultItem(collectionName: string, id: string): string[] {
  const currentIds = getHiddenItemIds(collectionName, true)
  const nextId = String(id)
  const updatedIds = currentIds.includes(nextId) ? currentIds : [...currentIds, nextId]
  saveHiddenItemIds(collectionName, updatedIds)
  return updatedIds
}

export function restoreHiddenItem(collectionName: string, id: string): string[] {
  const updatedIds = getHiddenItemIds(collectionName, true).filter((hiddenId) => hiddenId !== String(id))
  saveHiddenItemIds(collectionName, updatedIds)
  return updatedIds
}

// ─── Merge ───

export function mergeWithLocalItems(defaultItems: ContentItem[], collectionName: string): ContentItem[] {
  const safeDefaultItems = Array.isArray(defaultItems) ? defaultItems : []
  const localOverrides = getLocalOverrides(collectionName)
  const hiddenIds = getHiddenItemIds(collectionName)
  const localItems = getLocalItems(collectionName).map((item, index) => ({
    ...item,
    isLocal: true,
    displayLabel: item.displayLabel || `Local ${index + 1}`
  }))

  const defaultWithOverrides = safeDefaultItems
    .filter((item) => !hiddenIds.includes(String(item.id)))
    .map((item) => {
      const override = localOverrides[String(item.id)]
      return {
        ...item,
        ...(override || {}),
        id: item.id,
        isLocal: false,
        isOverridden: Boolean(override),
        displayLabel: item.displayLabel || String(item.id)
      }
    })

  return [...defaultWithOverrides, ...localItems]
}

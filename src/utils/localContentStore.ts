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

function getStorageKey(collectionName: string): string {
  return COLLECTION_KEYS[collectionName] || `distancia-cero-content-${collectionName}`
}

function getOverrideStorageKey(collectionName: string): string {
  return OVERRIDE_KEYS[collectionName] || `distancia-cero-content-${collectionName}-overrides`
}

function getHiddenStorageKey(collectionName: string): string {
  return HIDDEN_KEYS[collectionName] || `distancia-cero-content-${collectionName}-hidden`
}

function canUseLocalStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

// ─── Items ───

export function getLocalItems(collectionName: string): ContentItem[] {
  if (!canUseLocalStorage()) return []

  try {
    const rawValue = window.localStorage.getItem(getStorageKey(collectionName))
    const parsedValue: unknown = rawValue ? JSON.parse(rawValue) : []
    return Array.isArray(parsedValue) ? parsedValue : []
  } catch {
    return []
  }
}

export function saveLocalItems(collectionName: string, items: ContentItem[]): ContentItem[] {
  if (!canUseLocalStorage()) return []

  const safeItems = Array.isArray(items) ? items : []
  try {
    window.localStorage.setItem(getStorageKey(collectionName), JSON.stringify(safeItems))
  } catch (err) {
    // QuotaExceededError (private browsing / full quota) must not crash the app.
    // The in-memory result is still returned so the UI keeps working this session.
    console.warn(`[store] saveLocalItems failed for '${collectionName}':`, (err as Error).message)
  }
  return safeItems
}

export function addLocalItem(collectionName: string, item: ContentItem): ContentItem[] {
  const currentItems = getLocalItems(collectionName)
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
  const currentItems = getLocalItems(collectionName)
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
  const currentItems = getLocalItems(collectionName)
  const updatedItems = currentItems.filter((item) => String(item.id) !== String(id) || !item.isLocal)
  saveLocalItems(collectionName, updatedItems)
  return updatedItems
}

// ─── Overrides ───

export function getLocalOverrides(collectionName: string): OverrideMap {
  if (!canUseLocalStorage()) return {}

  try {
    const rawValue = window.localStorage.getItem(getOverrideStorageKey(collectionName))
    const parsedValue: unknown = rawValue ? JSON.parse(rawValue) : {}
    return parsedValue && !Array.isArray(parsedValue) && typeof parsedValue === 'object' ? parsedValue as OverrideMap : {}
  } catch {
    return {}
  }
}

export function saveLocalOverrides(collectionName: string, overrides: OverrideMap): OverrideMap {
  if (!canUseLocalStorage()) return {}

  const safeOverrides = overrides && !Array.isArray(overrides) && typeof overrides === 'object' ? overrides : {}
  try {
    window.localStorage.setItem(getOverrideStorageKey(collectionName), JSON.stringify(safeOverrides))
  } catch (err) {
    // QuotaExceededError (private browsing / full quota) must not crash the app.
    console.warn(`[store] saveLocalOverrides failed for '${collectionName}':`, (err as Error).message)
  }
  return safeOverrides
}

export function setLocalOverride(collectionName: string, id: string, patch: Partial<ContentItem>): OverrideMap {
  const currentOverrides = getLocalOverrides(collectionName)
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
  const currentOverrides = getLocalOverrides(collectionName)
  const updatedOverrides = { ...currentOverrides }
  delete updatedOverrides[String(id)]
  saveLocalOverrides(collectionName, updatedOverrides)
  return updatedOverrides
}

// ─── Hidden ───

export function getHiddenItemIds(collectionName: string): string[] {
  if (!canUseLocalStorage()) return []

  try {
    const rawValue = window.localStorage.getItem(getHiddenStorageKey(collectionName))
    const parsedValue: unknown = rawValue ? JSON.parse(rawValue) : []
    return Array.isArray(parsedValue) ? parsedValue.map((id) => String(id)) : []
  } catch {
    return []
  }
}

export function saveHiddenItemIds(collectionName: string, ids: string[]): string[] {
  if (!canUseLocalStorage()) return []

  const safeIds = Array.isArray(ids) ? ids.map((id) => String(id)) : []
  try {
    window.localStorage.setItem(getHiddenStorageKey(collectionName), JSON.stringify(safeIds))
  } catch (err) {
    // QuotaExceededError (private browsing / full quota) must not crash the app.
    console.warn(`[store] saveHiddenItemIds failed for '${collectionName}':`, (err as Error).message)
  }
  return safeIds
}

export function hideDefaultItem(collectionName: string, id: string): string[] {
  const currentIds = getHiddenItemIds(collectionName)
  const nextId = String(id)
  const updatedIds = currentIds.includes(nextId) ? currentIds : [...currentIds, nextId]
  saveHiddenItemIds(collectionName, updatedIds)
  return updatedIds
}

export function restoreHiddenItem(collectionName: string, id: string): string[] {
  const updatedIds = getHiddenItemIds(collectionName).filter((hiddenId) => hiddenId !== String(id))
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

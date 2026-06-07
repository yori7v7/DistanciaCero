const COLLECTION_KEYS = {
  reasons: 'distancia-cero-content-reasons',
  promises: 'distancia-cero-content-promises'
}

const OVERRIDE_KEYS = {
  reasons: 'distancia-cero-content-reasons-overrides',
  promises: 'distancia-cero-content-promises-overrides',
  monthlyLetters: 'distancia-cero-content-monthlyLetters-overrides'
}

const HIDDEN_KEYS = {
  reasons: 'distancia-cero-content-reasons-hidden',
  promises: 'distancia-cero-content-promises-hidden',
  monthlyLetters: 'distancia-cero-content-monthlyLetters-hidden'
}

function getStorageKey(collectionName) {
  return COLLECTION_KEYS[collectionName] || `distancia-cero-content-${collectionName}`
}

function getOverrideStorageKey(collectionName) {
  return OVERRIDE_KEYS[collectionName] || `distancia-cero-content-${collectionName}-overrides`
}

function getHiddenStorageKey(collectionName) {
  return HIDDEN_KEYS[collectionName] || `distancia-cero-content-${collectionName}-hidden`
}

function canUseLocalStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

export function getLocalItems(collectionName) {
  if (!canUseLocalStorage()) return []

  try {
    const rawValue = window.localStorage.getItem(getStorageKey(collectionName))
    const parsedValue = rawValue ? JSON.parse(rawValue) : []
    return Array.isArray(parsedValue) ? parsedValue : []
  } catch (error) {
    return []
  }
}

export function saveLocalItems(collectionName, items) {
  if (!canUseLocalStorage()) return []

  const safeItems = Array.isArray(items) ? items : []
  window.localStorage.setItem(getStorageKey(collectionName), JSON.stringify(safeItems))
  return safeItems
}

export function addLocalItem(collectionName, item) {
  const currentItems = getLocalItems(collectionName)
  const localIndexes = currentItems
    .map((currentItem) => {
      const match = String(currentItem.displayLabel || '').match(/^Local (\d+)$/)
      return match ? Number(match[1]) : 0
    })
  const nextLocalIndex = Math.max(0, ...localIndexes) + 1
  const nextItem = {
    ...item,
    isLocal: true,
    displayLabel: item.displayLabel || `Local ${nextLocalIndex}`
  }
  const updatedItems = [...currentItems, nextItem]
  saveLocalItems(collectionName, updatedItems)
  return updatedItems
}

export function updateLocalItem(collectionName, id, patch) {
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

export function deleteLocalItem(collectionName, id) {
  const currentItems = getLocalItems(collectionName)
  const updatedItems = currentItems.filter((item) => String(item.id) !== String(id) || !item.isLocal)
  saveLocalItems(collectionName, updatedItems)
  return updatedItems
}

export function getLocalOverrides(collectionName) {
  if (!canUseLocalStorage()) return {}

  try {
    const rawValue = window.localStorage.getItem(getOverrideStorageKey(collectionName))
    const parsedValue = rawValue ? JSON.parse(rawValue) : {}
    return parsedValue && !Array.isArray(parsedValue) && typeof parsedValue === 'object' ? parsedValue : {}
  } catch (error) {
    return {}
  }
}

export function saveLocalOverrides(collectionName, overrides) {
  if (!canUseLocalStorage()) return {}

  const safeOverrides = overrides && !Array.isArray(overrides) && typeof overrides === 'object' ? overrides : {}
  window.localStorage.setItem(getOverrideStorageKey(collectionName), JSON.stringify(safeOverrides))
  return safeOverrides
}

export function setLocalOverride(collectionName, id, patch) {
  const currentOverrides = getLocalOverrides(collectionName)
  const updatedOverrides = {
    ...currentOverrides,
    [String(id)]: {
      ...patch,
      id
    }
  }

  saveLocalOverrides(collectionName, updatedOverrides)
  return updatedOverrides
}

export function deleteLocalOverride(collectionName, id) {
  const currentOverrides = getLocalOverrides(collectionName)
  const updatedOverrides = { ...currentOverrides }
  delete updatedOverrides[String(id)]
  saveLocalOverrides(collectionName, updatedOverrides)
  return updatedOverrides
}

export function getHiddenItemIds(collectionName) {
  if (!canUseLocalStorage()) return []

  try {
    const rawValue = window.localStorage.getItem(getHiddenStorageKey(collectionName))
    const parsedValue = rawValue ? JSON.parse(rawValue) : []
    return Array.isArray(parsedValue) ? parsedValue.map((id) => String(id)) : []
  } catch (error) {
    return []
  }
}

export function saveHiddenItemIds(collectionName, ids) {
  if (!canUseLocalStorage()) return []

  const safeIds = Array.isArray(ids) ? ids.map((id) => String(id)) : []
  window.localStorage.setItem(getHiddenStorageKey(collectionName), JSON.stringify(safeIds))
  return safeIds
}

export function hideDefaultItem(collectionName, id) {
  const currentIds = getHiddenItemIds(collectionName)
  const nextId = String(id)
  const updatedIds = currentIds.includes(nextId) ? currentIds : [...currentIds, nextId]
  saveHiddenItemIds(collectionName, updatedIds)
  return updatedIds
}

export function restoreHiddenItem(collectionName, id) {
  const updatedIds = getHiddenItemIds(collectionName).filter((hiddenId) => hiddenId !== String(id))
  saveHiddenItemIds(collectionName, updatedIds)
  return updatedIds
}

export function mergeWithLocalItems(defaultItems, collectionName) {
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

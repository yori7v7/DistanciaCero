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

const LEGACY_MONTHLY_LETTERS_KEY = 'distancia-cero-local-monthly-letters'
const LEGACY_OPEN_WHEN_LETTERS_KEY = 'distancia-cero-local-open-when'
const SIMULATION_UNLOCKED_KEY = 'distancia-cero-sim-unlocked'

function canUseLocalStorage() {
  if (typeof window === 'undefined') return false

  try {
    return typeof window.localStorage !== 'undefined'
  } catch (error) {
    return false
  }
}

function safeGetItem(key) {
  if (!canUseLocalStorage()) return null

  try {
    return window.localStorage.getItem(key)
  } catch (error) {
    return null
  }
}

function safeSetItem(key, value) {
  if (!canUseLocalStorage()) return

  try {
    window.localStorage.setItem(key, value)
  } catch (error) {
    // LocalStorage can fail in private mode or quota-limited contexts.
  }
}

function safeRemoveItem(key) {
  if (!canUseLocalStorage()) return

  try {
    window.localStorage.removeItem(key)
  } catch (error) {
    // Keep legacy helpers non-throwing.
  }
}

function safeReadJsonArray(key) {
  try {
    const rawValue = safeGetItem(key)
    const parsedValue = rawValue ? JSON.parse(rawValue) : []
    return Array.isArray(parsedValue) ? parsedValue : []
  } catch (error) {
    return []
  }
}

function safeSaveJsonArray(key, items) {
  const safeItems = Array.isArray(items) ? items : []
  safeSetItem(key, JSON.stringify(safeItems))
  return safeItems
}

function getSafeIdSegment(id) {
  if (id === null || id === undefined) return ''
  return String(id).trim()
}

// Fachada sync sobre LocalStorage. Deja el contrato listo para un backend futuro
// sin cambiar todavia el comportamiento local actual.
export function getCollectionItems(collectionName) {
  return getLocalItems(collectionName)
}

export function saveCollectionItems(collectionName, items) {
  return saveLocalItems(collectionName, items)
}

export function addCollectionItem(collectionName, item) {
  return addLocalItem(collectionName, item)
}

export function updateCollectionItem(collectionName, id, patch) {
  return updateLocalItem(collectionName, id, patch)
}

export function deleteCollectionItem(collectionName, id) {
  return deleteLocalItem(collectionName, id)
}

export function getCollectionOverrides(collectionName) {
  return getLocalOverrides(collectionName)
}

export function saveCollectionOverrides(collectionName, overrides) {
  return saveLocalOverrides(collectionName, overrides)
}

export function setCollectionOverride(collectionName, id, patch) {
  return setLocalOverride(collectionName, id, patch)
}

export function deleteCollectionOverride(collectionName, id) {
  return deleteLocalOverride(collectionName, id)
}

export function getCollectionHiddenIds(collectionName) {
  return getHiddenItemIds(collectionName)
}

export function saveCollectionHiddenIds(collectionName, ids) {
  return saveHiddenItemIds(collectionName, ids)
}

export function hideCollectionItem(collectionName, id) {
  return hideDefaultItem(collectionName, id)
}

export function restoreCollectionItem(collectionName, id) {
  return restoreHiddenItem(collectionName, id)
}

export function mergeCollectionWithLocal(defaultItems, collectionName) {
  return mergeWithLocalItems(defaultItems, collectionName)
}

// Legacy letter helpers: centralizan keys historicas sin cambiar comportamiento.
export function getLegacyMonthlyLetters() {
  return safeReadJsonArray(LEGACY_MONTHLY_LETTERS_KEY)
}

export function saveLegacyMonthlyLetters(items) {
  return safeSaveJsonArray(LEGACY_MONTHLY_LETTERS_KEY, items)
}

export function getLegacyOpenWhenLetters() {
  return safeReadJsonArray(LEGACY_OPEN_WHEN_LETTERS_KEY)
}

export function saveLegacyOpenWhenLetters(items) {
  return safeSaveJsonArray(LEGACY_OPEN_WHEN_LETTERS_KEY, items)
}

export function isMonthlyLetterOpened(id) {
  const safeId = getSafeIdSegment(id)
  if (!safeId) return false

  return safeGetItem(`distancia-cero-monthly-letter-${safeId}`) === 'opened'
}

export function setMonthlyLetterOpened(id, value = true) {
  const safeId = getSafeIdSegment(id)
  if (!safeId) return

  const key = `distancia-cero-monthly-letter-${safeId}`
  if (value) {
    safeSetItem(key, 'opened')
  } else {
    safeRemoveItem(key)
  }
}

export function isOpenWhenLetterOpened(id) {
  const safeId = getSafeIdSegment(id)
  if (!safeId) return false

  return safeGetItem(`distancia-cero-open-when-${safeId}`) === 'opened'
}

export function setOpenWhenLetterOpened(id, value = true) {
  const safeId = getSafeIdSegment(id)
  if (!safeId) return

  const key = `distancia-cero-open-when-${safeId}`
  if (value) {
    safeSetItem(key, 'opened')
  } else {
    safeRemoveItem(key)
  }
}

export function getSimulationUnlocked() {
  return safeGetItem(SIMULATION_UNLOCKED_KEY) === '1'
}

export function setSimulationUnlocked(value) {
  if (value) {
    safeSetItem(SIMULATION_UNLOCKED_KEY, '1')
  } else {
    safeRemoveItem(SIMULATION_UNLOCKED_KEY)
  }
}

export function notifyContentUpdated(collectionName) {
  if (typeof window === 'undefined') return

  window.dispatchEvent(
    new CustomEvent('distancia-cero-content-updated', {
      detail: {
        collection: collectionName,
        collectionName
      }
    })
  )
}

export function notifyAllContentUpdated() {
  notifyContentUpdated('all')
}

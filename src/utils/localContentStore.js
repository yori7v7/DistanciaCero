const COLLECTION_KEYS = {
  reasons: 'distancia-cero-content-reasons'
}

function getStorageKey(collectionName) {
  return COLLECTION_KEYS[collectionName] || `distancia-cero-content-${collectionName}`
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
  const nextItem = {
    ...item,
    isLocal: true
  }
  const updatedItems = [...currentItems, nextItem]
  saveLocalItems(collectionName, updatedItems)
  return updatedItems
}

export function updateLocalItem(collectionName, id, patch) {
  const currentItems = getLocalItems(collectionName)
  const updatedItems = currentItems.map((item) => {
    if (item.id !== id || !item.isLocal) return item
    return {
      ...item,
      ...patch,
      id: item.id,
      isLocal: true
    }
  })
  saveLocalItems(collectionName, updatedItems)
  return updatedItems
}

export function deleteLocalItem(collectionName, id) {
  const currentItems = getLocalItems(collectionName)
  const updatedItems = currentItems.filter((item) => item.id !== id || !item.isLocal)
  saveLocalItems(collectionName, updatedItems)
  return updatedItems
}

export function mergeWithLocalItems(defaultItems, collectionName) {
  const safeDefaultItems = Array.isArray(defaultItems) ? defaultItems : []
  return [...safeDefaultItems, ...getLocalItems(collectionName)]
}

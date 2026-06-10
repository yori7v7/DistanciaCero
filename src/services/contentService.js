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

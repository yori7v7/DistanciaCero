import * as contentRepository from '../repositories/contentRepository'

// Fachada sync sobre LocalStorage. Deja el contrato listo para un backend futuro
// sin cambiar todavia el comportamiento local actual.
export function getCollectionItems(collectionName) {
  return contentRepository.getCollectionItems(collectionName)
}

export function saveCollectionItems(collectionName, items) {
  return contentRepository.saveCollectionItems(collectionName, items)
}

export function addCollectionItem(collectionName, item) {
  return contentRepository.addCollectionItem(collectionName, item)
}

export function updateCollectionItem(collectionName, id, patch) {
  return contentRepository.updateCollectionItem(collectionName, id, patch)
}

export function deleteCollectionItem(collectionName, id) {
  return contentRepository.deleteCollectionItem(collectionName, id)
}

export function getCollectionOverrides(collectionName) {
  return contentRepository.getCollectionOverrides(collectionName)
}

export function saveCollectionOverrides(collectionName, overrides) {
  return contentRepository.saveCollectionOverrides(collectionName, overrides)
}

export function setCollectionOverride(collectionName, id, patch) {
  return contentRepository.setCollectionOverride(collectionName, id, patch)
}

export function deleteCollectionOverride(collectionName, id) {
  return contentRepository.deleteCollectionOverride(collectionName, id)
}

export function getCollectionHiddenIds(collectionName) {
  return contentRepository.getCollectionHiddenIds(collectionName)
}

export function saveCollectionHiddenIds(collectionName, ids) {
  return contentRepository.saveCollectionHiddenIds(collectionName, ids)
}

export function hideCollectionItem(collectionName, id) {
  return contentRepository.hideCollectionItem(collectionName, id)
}

export function restoreCollectionItem(collectionName, id) {
  return contentRepository.restoreCollectionItem(collectionName, id)
}

export function mergeCollectionWithLocal(defaultItems, collectionName) {
  return contentRepository.mergeCollectionWithLocal(defaultItems, collectionName)
}

// Legacy letter helpers: centralizan keys historicas sin cambiar comportamiento.
export function getLegacyMonthlyLetters() {
  return contentRepository.getLegacyMonthlyLetters()
}

export function saveLegacyMonthlyLetters(items) {
  return contentRepository.saveLegacyMonthlyLetters(items)
}

export function getLegacyOpenWhenLetters() {
  return contentRepository.getLegacyOpenWhenLetters()
}

export function saveLegacyOpenWhenLetters(items) {
  return contentRepository.saveLegacyOpenWhenLetters(items)
}

export function isMonthlyLetterOpened(id) {
  return contentRepository.isMonthlyLetterOpened(id)
}

export function setMonthlyLetterOpened(id, value = true) {
  return contentRepository.setMonthlyLetterOpened(id, value)
}

export function isOpenWhenLetterOpened(id) {
  return contentRepository.isOpenWhenLetterOpened(id)
}

export function setOpenWhenLetterOpened(id, value = true) {
  return contentRepository.setOpenWhenLetterOpened(id, value)
}

export function getSimulationUnlocked() {
  return contentRepository.getSimulationUnlocked()
}

export function setSimulationUnlocked(value) {
  return contentRepository.setSimulationUnlocked(value)
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

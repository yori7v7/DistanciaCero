import * as contentRepository from '../repositories/contentRepository'

// Sync hooks: fire-and-forget to Supabase on every write.
// These never throw and never block the local flow.
let _syncHooksPromise = null
function getSyncHooks() {
  if (!_syncHooksPromise) {
    _syncHooksPromise = import('./supabaseSyncService').catch(() => null)
  }
  return _syncHooksPromise
}

async function syncCreate(collection, item) {
  const hooks = await getSyncHooks()
  if (hooks) {
    hooks.pushCreateToSupabase(collection, item).catch(() => {})
  }
}

async function syncUpdate(collection, id, patch) {
  const hooks = await getSyncHooks()
  if (hooks) {
    hooks.pushUpdateToSupabase(collection, id, patch).catch(() => {})
  }
}

async function syncDelete(collection, id) {
  const hooks = await getSyncHooks()
  if (hooks) {
    hooks.pushDeleteToSupabase(collection, id).catch(() => {})
  }
}

// Override-specific sync: overrides are stored separately from items
async function syncOverrideUpdate(collection, baseId, patch) {
  const hooks = await getSyncHooks()
  if (hooks) {
    hooks.pushOverrideToSupabase(collection, baseId, patch).catch(() => {})
  }
}

async function syncOverrideDelete(collection, baseId) {
  const hooks = await getSyncHooks()
  if (hooks) {
    hooks.pushDeleteOverrideToSupabase(collection, baseId).catch(() => {})
  }
}

// Fachada sync sobre LocalStorage. Deja el contrato listo para un backend futuro
// sin cambiar todavia el comportamiento local actual.
export function getCollectionItems(collectionName) {
  return contentRepository.getCollectionItems(collectionName)
}

export function saveCollectionItems(collectionName, items) {
  return contentRepository.saveCollectionItems(collectionName, items)
}

export function addCollectionItem(collectionName, item) {
  const result = contentRepository.addCollectionItem(collectionName, item)
  syncCreate(collectionName, item)
  return result
}

export function updateCollectionItem(collectionName, id, patch) {
  const result = contentRepository.updateCollectionItem(collectionName, id, patch)
  syncUpdate(collectionName, id, patch)
  return result
}

export function deleteCollectionItem(collectionName, id) {
  const result = contentRepository.deleteCollectionItem(collectionName, id)
  syncDelete(collectionName, id)
  return result
}

export function getCollectionOverrides(collectionName) {
  return contentRepository.getCollectionOverrides(collectionName)
}

export function saveCollectionOverrides(collectionName, overrides) {
  return contentRepository.saveCollectionOverrides(collectionName, overrides)
}

export function setCollectionOverride(collectionName, id, patch) {
  const result = contentRepository.setCollectionOverride(collectionName, id, patch)
  syncOverrideUpdate(collectionName, id, patch)
  return result
}

export function deleteCollectionOverride(collectionName, id) {
  const result = contentRepository.deleteCollectionOverride(collectionName, id)
  syncOverrideDelete(collectionName, id)
  return result
}

export function getCollectionHiddenIds(collectionName) {
  return contentRepository.getCollectionHiddenIds(collectionName)
}

export function saveCollectionHiddenIds(collectionName, ids) {
  return contentRepository.saveCollectionHiddenIds(collectionName, ids)
}

export async function hideCollectionItem(collectionName, id) {
  const result = contentRepository.hideCollectionItem(collectionName, id)
  const hooks = await getSyncHooks()
  if (hooks) hooks.pushHideToSupabase(collectionName, id).catch(() => {})
  return result
}

export async function restoreCollectionItem(collectionName, id) {
  const result = contentRepository.restoreCollectionItem(collectionName, id)
  const hooks = await getSyncHooks()
  if (hooks) hooks.pushRestoreToSupabase(collectionName, id).catch(() => {})
  return result
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

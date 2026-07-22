import type { ContentItem, OverrideMap } from '../types/content'
import * as contentRepository from '../repositories/contentRepository'

// Sync hooks: fire-and-forget to Supabase on every write.
// These never throw and never block the local flow.
let _syncHooksPromise: Promise<SyncHooks | null> | null = null

interface SyncHooks {
  pushCreateToSupabase: (collection: string, item: ContentItem) => Promise<void>
  pushUpdateToSupabase: (collection: string, id: string, patch: Partial<ContentItem>) => Promise<void>
  pushDeleteToSupabase: (collection: string, id: string) => Promise<void>
  pushOverrideToSupabase: (collection: string, baseId: string, patch: Partial<ContentItem>) => Promise<void>
  pushDeleteOverrideToSupabase: (collection: string, baseId: string) => Promise<void>
  pushHideToSupabase: (collection: string, baseId: string) => Promise<void>
  pushRestoreToSupabase: (collection: string, baseId: string) => Promise<void>
}

function getSyncHooks(): Promise<SyncHooks | null> {
  if (!_syncHooksPromise) {
    _syncHooksPromise = import('./supabaseSyncService').then(m => m as unknown as SyncHooks).catch(() => null)
  }
  return _syncHooksPromise
}

async function syncCreate(collection: string, item: ContentItem): Promise<void> {
  const hooks = await getSyncHooks()
  if (hooks) {
    hooks.pushCreateToSupabase(collection, item).catch(() => {})
  }
}

async function syncUpdate(collection: string, id: string, patch: Partial<ContentItem>): Promise<void> {
  const hooks = await getSyncHooks()
  if (hooks) {
    hooks.pushUpdateToSupabase(collection, id, patch).catch(() => {})
  }
}

async function syncDelete(collection: string, id: string): Promise<void> {
  const hooks = await getSyncHooks()
  if (hooks) {
    hooks.pushDeleteToSupabase(collection, id).catch(() => {})
  }
}

async function syncOverrideUpdate(collection: string, baseId: string, patch: Partial<ContentItem>): Promise<void> {
  const hooks = await getSyncHooks()
  if (hooks) {
    hooks.pushOverrideToSupabase(collection, baseId, patch).catch(() => {})
  }
}

async function syncOverrideDelete(collection: string, baseId: string): Promise<void> {
  const hooks = await getSyncHooks()
  if (hooks) {
    hooks.pushDeleteOverrideToSupabase(collection, baseId).catch(() => {})
  }
}

// Fachada sync sobre LocalStorage. Deja el contrato listo para un backend futuro
// sin cambiar todavia el comportamiento local actual.
export function getCollectionItems(collectionName: string): ContentItem[] {
  return contentRepository.getCollectionItems(collectionName)
}

export function saveCollectionItems(collectionName: string, items: ContentItem[]): ContentItem[] {
  return contentRepository.saveCollectionItems(collectionName, items)
}

export function addCollectionItem(collectionName: string, item: ContentItem): ContentItem[] {
  const result = contentRepository.addCollectionItem(collectionName, item)
  syncCreate(collectionName, item)
  return result
}

export function updateCollectionItem(collectionName: string, id: string, patch: Partial<ContentItem>): ContentItem[] {
  const result = contentRepository.updateCollectionItem(collectionName, id, patch)
  syncUpdate(collectionName, id, patch)
  return result
}

export function deleteCollectionItem(collectionName: string, id: string): ContentItem[] {
  const result = contentRepository.deleteCollectionItem(collectionName, id)
  syncDelete(collectionName, id)
  return result
}

export function getCollectionOverrides(collectionName: string): OverrideMap {
  return contentRepository.getCollectionOverrides(collectionName)
}

export function saveCollectionOverrides(collectionName: string, overrides: OverrideMap): OverrideMap {
  return contentRepository.saveCollectionOverrides(collectionName, overrides)
}

export function setCollectionOverride(collectionName: string, id: string, patch: Partial<ContentItem>): OverrideMap {
  const result = contentRepository.setCollectionOverride(collectionName, id, patch)
  syncOverrideUpdate(collectionName, id, patch)
  return result
}

export function deleteCollectionOverride(collectionName: string, id: string): OverrideMap {
  const result = contentRepository.deleteCollectionOverride(collectionName, id)
  syncOverrideDelete(collectionName, id)
  return result
}

export function getCollectionHiddenIds(collectionName: string): string[] {
  return contentRepository.getCollectionHiddenIds(collectionName)
}

export function saveCollectionHiddenIds(collectionName: string, ids: string[]): string[] {
  return contentRepository.saveCollectionHiddenIds(collectionName, ids)
}

export function hideCollectionItem(collectionName: string, id: string): string[] {
  const result = contentRepository.hideCollectionItem(collectionName, id)
  getSyncHooks().then(hooks => {
    if (hooks) hooks.pushHideToSupabase(collectionName, id).catch(() => {})
  })
  return result
}

export function restoreCollectionItem(collectionName: string, id: string): string[] {
  const result = contentRepository.restoreCollectionItem(collectionName, id)
  getSyncHooks().then(hooks => {
    if (hooks) hooks.pushRestoreToSupabase(collectionName, id).catch(() => {})
  })
  return result
}

export function mergeCollectionWithLocal(defaultItems: ContentItem[], collectionName: string): ContentItem[] {
  return contentRepository.mergeCollectionWithLocal(defaultItems, collectionName)
}

// Legacy letter helpers: centralizan keys historicas sin cambiar comportamiento.
export function getLegacyMonthlyLetters(): ContentItem[] {
  return contentRepository.getLegacyMonthlyLetters()
}

export function saveLegacyMonthlyLetters(items: ContentItem[]): ContentItem[] {
  return contentRepository.saveLegacyMonthlyLetters(items)
}

export function getLegacyOpenWhenLetters(): ContentItem[] {
  return contentRepository.getLegacyOpenWhenLetters()
}

export function saveLegacyOpenWhenLetters(items: ContentItem[]): ContentItem[] {
  return contentRepository.saveLegacyOpenWhenLetters(items)
}

export function isMonthlyLetterOpened(id: string): boolean {
  return contentRepository.isMonthlyLetterOpened(id)
}

export function setMonthlyLetterOpened(id: string, value = true): void {
  return contentRepository.setMonthlyLetterOpened(id, value)
}

export function isOpenWhenLetterOpened(id: string): boolean {
  return contentRepository.isOpenWhenLetterOpened(id)
}

export function setOpenWhenLetterOpened(id: string, value = true): void {
  return contentRepository.setOpenWhenLetterOpened(id, value)
}

export function getSimulationUnlocked(): boolean {
  return contentRepository.getSimulationUnlocked()
}

export function setSimulationUnlocked(value: boolean): void {
  return contentRepository.setSimulationUnlocked(value)
}

export function notifyContentUpdated(collectionName: string): void {
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

export function notifyAllContentUpdated(): void {
  notifyContentUpdated('all')
}

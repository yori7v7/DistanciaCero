import type { ContentItem, OverrideMap, ContentRepository } from '../types/content'
import { assertRepositoryContract } from './contentRepositoryContract'

export const REMOTE_REPOSITORY_IMPLEMENTED = false

export class RemoteRepositoryNotImplementedError extends Error {
  readonly code: string
  readonly operation: string

  constructor(operation: string) {
    super(
      `Remote repository skeleton is inactive. Operation "${operation}" is not implemented and must not be connected to runtime.`
    )

    this.name = 'RemoteRepositoryNotImplementedError'
    this.code = 'REMOTE_REPOSITORY_NOT_IMPLEMENTED'
    this.operation = operation
  }
}

function failNotImplemented(operation: string): never {
  throw new RemoteRepositoryNotImplementedError(operation)
}

export function getCollectionItems(_collectionName: string): ContentItem[] {
  failNotImplemented('getCollectionItems')
}

export function saveCollectionItems(_collectionName: string, _items: ContentItem[]): ContentItem[] {
  failNotImplemented('saveCollectionItems')
}

export function addCollectionItem(_collectionName: string, _item: ContentItem): ContentItem[] {
  failNotImplemented('addCollectionItem')
}

export function updateCollectionItem(_collectionName: string, _id: string, _patch: Partial<ContentItem>): ContentItem[] {
  failNotImplemented('updateCollectionItem')
}

export function deleteCollectionItem(_collectionName: string, _id: string): ContentItem[] {
  failNotImplemented('deleteCollectionItem')
}

export function getCollectionOverrides(_collectionName: string): OverrideMap {
  failNotImplemented('getCollectionOverrides')
}

export function saveCollectionOverrides(_collectionName: string, _overrides: OverrideMap): OverrideMap {
  failNotImplemented('saveCollectionOverrides')
}

export function setCollectionOverride(_collectionName: string, _id: string, _patch: Partial<ContentItem>): OverrideMap {
  failNotImplemented('setCollectionOverride')
}

export function deleteCollectionOverride(_collectionName: string, _id: string): OverrideMap {
  failNotImplemented('deleteCollectionOverride')
}

export function getCollectionHiddenIds(_collectionName: string): string[] {
  failNotImplemented('getCollectionHiddenIds')
}

export function saveCollectionHiddenIds(_collectionName: string, _ids: string[]): string[] {
  failNotImplemented('saveCollectionHiddenIds')
}

export function hideCollectionItem(_collectionName: string, _id: string): string[] {
  failNotImplemented('hideCollectionItem')
}

export function restoreCollectionItem(_collectionName: string, _id: string): string[] {
  failNotImplemented('restoreCollectionItem')
}

export const remoteContentRepository: ContentRepository = Object.freeze({
  getCollectionItems,
  saveCollectionItems,
  addCollectionItem,
  updateCollectionItem,
  deleteCollectionItem,
  getCollectionOverrides,
  saveCollectionOverrides,
  setCollectionOverride,
  deleteCollectionOverride,
  getCollectionHiddenIds,
  saveCollectionHiddenIds,
  hideCollectionItem,
  restoreCollectionItem,
  mergeCollectionWithLocal: (_d: ContentItem[], _c: string): ContentItem[] => failNotImplemented('mergeCollectionWithLocal')
})

// Structural validation only. No repository operation is executed on import.
assertRepositoryContract(remoteContentRepository)

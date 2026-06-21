import { assertRepositoryContract } from './contentRepositoryContract.js'

export const REMOTE_REPOSITORY_IMPLEMENTED = false

export class RemoteRepositoryNotImplementedError extends Error {
  /**
   * @param {string} operation
   */
  constructor(operation) {
    super(
      `Remote repository skeleton is inactive. Operation "${operation}" is not implemented and must not be connected to runtime.`
    )

    this.name = 'RemoteRepositoryNotImplementedError'
    this.code = 'REMOTE_REPOSITORY_NOT_IMPLEMENTED'
    this.operation = operation
  }
}

function failNotImplemented(operation) {
  throw new RemoteRepositoryNotImplementedError(operation)
}

export function getCollectionItems(collectionName) {
  failNotImplemented('getCollectionItems')
}

export function saveCollectionItems(collectionName, items) {
  failNotImplemented('saveCollectionItems')
}

export function addCollectionItem(collectionName, item) {
  failNotImplemented('addCollectionItem')
}

export function updateCollectionItem(collectionName, id, patch) {
  failNotImplemented('updateCollectionItem')
}

export function deleteCollectionItem(collectionName, id) {
  failNotImplemented('deleteCollectionItem')
}

export function getCollectionOverrides(collectionName) {
  failNotImplemented('getCollectionOverrides')
}

export function saveCollectionOverrides(collectionName, overrides) {
  failNotImplemented('saveCollectionOverrides')
}

export function setCollectionOverride(collectionName, id, patch) {
  failNotImplemented('setCollectionOverride')
}

export function deleteCollectionOverride(collectionName, id) {
  failNotImplemented('deleteCollectionOverride')
}

export function getCollectionHiddenIds(collectionName) {
  failNotImplemented('getCollectionHiddenIds')
}

export function saveCollectionHiddenIds(collectionName, ids) {
  failNotImplemented('saveCollectionHiddenIds')
}

export function hideCollectionItem(collectionName, id) {
  failNotImplemented('hideCollectionItem')
}

export function restoreCollectionItem(collectionName, id) {
  failNotImplemented('restoreCollectionItem')
}

export const remoteContentRepository = Object.freeze({
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
  restoreCollectionItem
})

// Structural validation only. No repository operation is executed on import.
assertRepositoryContract(remoteContentRepository)

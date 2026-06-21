/**
 * Generic content operations that a future remote repository must expose.
 * This contract validates structure only; it never executes repository code.
 */
export const REQUIRED_REMOTE_REPOSITORY_FUNCTIONS = Object.freeze([
  'getCollectionItems',
  'saveCollectionItems',
  'addCollectionItem',
  'updateCollectionItem',
  'deleteCollectionItem',
  'getCollectionOverrides',
  'saveCollectionOverrides',
  'setCollectionOverride',
  'deleteCollectionOverride',
  'getCollectionHiddenIds',
  'saveCollectionHiddenIds',
  'hideCollectionItem',
  'restoreCollectionItem'
])

/**
 * Local-only operations intentionally excluded from the generic remote
 * content contract. They require migration adapters or separate domains.
 */
export const LOCAL_ONLY_REPOSITORY_FUNCTIONS = Object.freeze([
  'mergeCollectionWithLocal',
  'getLegacyMonthlyLetters',
  'saveLegacyMonthlyLetters',
  'getLegacyOpenWhenLetters',
  'saveLegacyOpenWhenLetters',
  'isMonthlyLetterOpened',
  'setMonthlyLetterOpened',
  'isOpenWhenLetterOpened',
  'setOpenWhenLetterOpened',
  'getSimulationUnlocked',
  'setSimulationUnlocked'
])

export class ContentRepositoryContractError extends Error {
  /**
   * @param {string[]} missingFunctions
   */
  constructor(missingFunctions) {
    const safeMissingFunctions = Array.isArray(missingFunctions)
      ? [...missingFunctions]
      : []

    super(
      `Repository contract is missing required functions: ${safeMissingFunctions.join(', ')}`
    )

    this.name = 'ContentRepositoryContractError'
    this.code = 'CONTENT_REPOSITORY_CONTRACT_INVALID'
    this.missingFunctions = Object.freeze(safeMissingFunctions)
  }
}

/**
 * Returns required names whose corresponding repository property is not a
 * function. It does not call any repository operation.
 *
 * @param {object|null|undefined} repository
 * @param {readonly string[]} [requiredNames]
 * @returns {string[]}
 */
export function getMissingRepositoryFunctions(
  repository,
  requiredNames = REQUIRED_REMOTE_REPOSITORY_FUNCTIONS
) {
  const safeRepository = repository && typeof repository === 'object'
    ? repository
    : {}
  const safeRequiredNames = Array.isArray(requiredNames)
    ? requiredNames
    : REQUIRED_REMOTE_REPOSITORY_FUNCTIONS

  return safeRequiredNames.filter(
    (functionName) => typeof safeRepository[functionName] !== 'function'
  )
}

/**
 * Asserts that a repository exposes every required function. This is a
 * structural check only and returns the original repository when valid.
 *
 * @template {object} T
 * @param {T} repository
 * @param {{ requiredNames?: readonly string[] }} [options]
 * @returns {T}
 * @throws {ContentRepositoryContractError}
 */
export function assertRepositoryContract(repository, options = {}) {
  const missingFunctions = getMissingRepositoryFunctions(
    repository,
    options.requiredNames
  )

  if (missingFunctions.length > 0) {
    throw new ContentRepositoryContractError(missingFunctions)
  }

  return repository
}

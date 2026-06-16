import { getCurrentUserId } from './authService'
import { getCurrentSpaceId } from './universeService'

export const METADATA_SOURCE = 'local-dev'

function normalizeTimestamp(now) {
  if (typeof now === 'string') return now
  if (now instanceof Date) return now.toISOString()
  return new Date().toISOString()
}

function resolveMetadataContext(options = {}) {
  const timestamp = normalizeTimestamp(options.now)

  return {
    userId: options.userId || getCurrentUserId(),
    spaceId: options.spaceId || getCurrentSpaceId(),
    source: options.source || METADATA_SOURCE,
    timestamp
  }
}

export function buildCreateMetadata(options = {}) {
  const { userId, spaceId, source, timestamp } = resolveMetadataContext(options)

  return {
    createdBy: userId,
    updatedBy: userId,
    createdAt: timestamp,
    updatedAt: timestamp,
    source,
    spaceId
  }
}

export function buildUpdateMetadata(options = {}) {
  const { userId, spaceId, source, timestamp } = resolveMetadataContext(options)

  return {
    updatedBy: userId,
    updatedAt: timestamp,
    source,
    spaceId
  }
}

export function withCreateMetadata(item, options = {}) {
  return {
    ...(item || {}),
    ...buildCreateMetadata(options)
  }
}

export function withUpdateMetadata(item, options = {}) {
  return {
    ...(item || {}),
    ...buildUpdateMetadata(options)
  }
}

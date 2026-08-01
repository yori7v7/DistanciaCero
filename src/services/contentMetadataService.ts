import type { CreateMetadata, UpdateMetadata, MetadataOptions } from '../types/content'
import { getCurrentUserId } from './authService'
import { getCurrentSpaceId } from './universeService'

export const METADATA_SOURCE = 'local-dev'

interface ResolvedContext {
  userId: string
  spaceId: string
  source: string
  timestamp: string
}

function normalizeTimestamp(now?: string | Date): string {
  if (typeof now === 'string') return now
  if (now instanceof Date) return now.toISOString()
  return new Date().toISOString()
}

function resolveMetadataContext(options: MetadataOptions = {}): ResolvedContext {
  const timestamp = normalizeTimestamp(options.now)

  return {
    userId: options.userId || getCurrentUserId(),
    spaceId: options.spaceId || getCurrentSpaceId(),
    source: options.source || METADATA_SOURCE,
    timestamp
  }
}

export function buildCreateMetadata(options: MetadataOptions = {}): CreateMetadata {
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

export function buildUpdateMetadata(options: MetadataOptions = {}): UpdateMetadata {
  const { userId, spaceId, source, timestamp } = resolveMetadataContext(options)

  return {
    updatedBy: userId,
    updatedAt: timestamp,
    source,
    spaceId
  }
}

export function withCreateMetadata<T extends Record<string, unknown>>(item: T, options: MetadataOptions = {}): T & CreateMetadata {
  return {
    ...(item || {}),
    ...buildCreateMetadata(options)
  } as T & CreateMetadata
}

export function withUpdateMetadata<T extends Record<string, unknown>>(item: T, options: MetadataOptions = {}): T & UpdateMetadata {
  return {
    ...(item || {}),
    ...buildUpdateMetadata(options)
  } as T & UpdateMetadata
}

import { describe, it, expect, beforeEach } from 'vitest'
import {
  buildCreateMetadata,
  buildUpdateMetadata,
  withCreateMetadata,
  withUpdateMetadata,
  METADATA_SOURCE
} from '../services/contentMetadataService'

beforeEach(() => {
  localStorage.clear()
})

describe('contentMetadataService', () => {
  describe('buildCreateMetadata', () => {
    it('returns create metadata with all required fields', () => {
      const meta = buildCreateMetadata()
      expect(meta.createdBy).toBeDefined()
      expect(meta.updatedBy).toBeDefined()
      expect(meta.createdAt).toBeDefined()
      expect(meta.updatedAt).toBeDefined()
      expect(meta.source).toBe(METADATA_SOURCE)
      expect(meta.spaceId).toBeDefined()
    })

    it('createdBy equals updatedBy on create', () => {
      const meta = buildCreateMetadata()
      expect(meta.createdBy).toBe(meta.updatedBy)
    })

    it('createdAt equals updatedAt on create', () => {
      const meta = buildCreateMetadata()
      expect(meta.createdAt).toBe(meta.updatedAt)
    })

    it('uses provided userId', () => {
      const meta = buildCreateMetadata({ userId: 'custom-user' })
      expect(meta.createdBy).toBe('custom-user')
    })

    it('uses provided spaceId', () => {
      const meta = buildCreateMetadata({ spaceId: 'custom-space' })
      expect(meta.spaceId).toBe('custom-space')
    })

    it('uses provided source', () => {
      const meta = buildCreateMetadata({ source: 'custom-source' })
      expect(meta.source).toBe('custom-source')
    })
  })

  describe('buildUpdateMetadata', () => {
    it('returns update metadata with all required fields', () => {
      const meta = buildUpdateMetadata()
      expect(meta.updatedBy).toBeDefined()
      expect(meta.updatedAt).toBeDefined()
      expect(meta.source).toBe(METADATA_SOURCE)
      expect(meta.spaceId).toBeDefined()
    })

    it('does NOT include createdBy', () => {
      const meta = buildUpdateMetadata()
      expect((meta as unknown as Record<string, unknown>).createdBy).toBeUndefined()
    })
  })

  describe('withCreateMetadata', () => {
    it('merges metadata into item', () => {
      const item = { id: '1', title: 'Test' }
      const result = withCreateMetadata(item)
      expect(result.id).toBe('1')
      expect(result.title).toBe('Test')
      expect(result.createdBy).toBeDefined()
      expect(result.spaceId).toBeDefined()
    })

    it('does not mutate original item', () => {
      const item = { id: '1' }
      const originalKeys = [...Object.keys(item)]
      withCreateMetadata(item)
      expect(Object.keys(item)).toEqual(originalKeys)
    })
  })

  describe('withUpdateMetadata', () => {
    it('merges update metadata into item', () => {
      const item = { id: '1', title: 'Test' }
      const result = withUpdateMetadata(item)
      expect(result.id).toBe('1')
      expect(result.title).toBe('Test')
      expect(result.updatedBy).toBeDefined()
    })
  })
})

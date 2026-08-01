import { describe, it, expect, beforeEach } from 'vitest'
import {
  getCollectionItems,
  saveCollectionItems,
  addCollectionItem,
  updateCollectionItem,
  deleteCollectionItem,
  getCollectionOverrides,
  setCollectionOverride,
  deleteCollectionOverride,
  getCollectionHiddenIds,
  hideCollectionItem,
  restoreCollectionItem,
  mergeCollectionWithLocal
} from '../services/contentService'
import type { ContentItem } from '../types/content'

beforeEach(() => {
  localStorage.clear()
})

describe('contentService — CRUD operations', () => {
  it('getCollectionItems returns empty array for new collection', () => {
    const items = getCollectionItems('test-collection')
    expect(items).toEqual([])
  })

  it('saveCollectionItems saves and retrieves items', () => {
    const items = [{ id: '1', title: 'Test' }] as ContentItem[]
    saveCollectionItems('reasons', items)
    const result = getCollectionItems('reasons')
    expect(result).toEqual(items)
  })

  it('addCollectionItem adds item with metadata', () => {
    const item = { id: 'local-1', title: 'Nueva razón', text: 'Porque sí' } as ContentItem
    const result = addCollectionItem('reasons', item)
    expect(result.length).toBe(1)
    expect(result[0].title).toBe('Nueva razón')
    expect(result[0].isLocal).toBe(true)
    expect(result[0].createdAt).toBeDefined()
  })

  it('updateCollectionItem updates existing item', () => {
    addCollectionItem('reasons', { id: 'local-1', title: 'Original' } as ContentItem)
    const updated = updateCollectionItem('reasons', 'local-1', { title: 'Actualizado', text: 'Nuevo texto' })
    expect(updated[0].title).toBe('Actualizado')
    expect(updated[0].text).toBe('Nuevo texto')
    expect(updated[0].updatedAt).toBeDefined()
  })

  it('updateCollectionItem does nothing for non-existent item', () => {
    const result = updateCollectionItem('reasons', 'no-existe', { title: 'X' })
    expect(result).toEqual([])
  })

  it('deleteCollectionItem removes item', () => {
    addCollectionItem('reasons', { id: 'local-1', title: 'Borrable' } as ContentItem)
    expect(getCollectionItems('reasons').length).toBe(1)
    deleteCollectionItem('reasons', 'local-1')
    expect(getCollectionItems('reasons').length).toBe(0)
  })

  it('deleteCollectionItem does nothing for non-existent item', () => {
    addCollectionItem('reasons', { id: 'local-1', title: 'X' } as ContentItem)
    const result = deleteCollectionItem('reasons', 'no-existe')
    expect(result.length).toBe(1)
  })
})

describe('contentService — Overrides', () => {
  it('getCollectionOverrides returns empty object initially', () => {
    expect(getCollectionOverrides('reasons')).toEqual({})
  })

  it('setCollectionOverride saves and retrieves override', () => {
    const result = setCollectionOverride('reasons', '1', { title: 'Override', text: 'Nuevo' })
    expect(result['1']).toBeDefined()
    expect(result['1'].title).toBe('Override')
    const overrides = getCollectionOverrides('reasons')
    expect(overrides['1'].title).toBe('Override')
  })

  it('deleteCollectionOverride removes override', () => {
    setCollectionOverride('reasons', '1', { title: 'X' })
    deleteCollectionOverride('reasons', '1')
    const overrides = getCollectionOverrides('reasons')
    expect(overrides['1']).toBeUndefined()
  })
})

describe('contentService — Hide/Restore', () => {
  it('getCollectionHiddenIds returns empty array initially', () => {
    expect(getCollectionHiddenIds('reasons')).toEqual([])
  })

  it('hideCollectionItem adds to hidden ids', () => {
    const result = hideCollectionItem('reasons', '5')
    expect(result).toContain('5')
    expect(getCollectionHiddenIds('reasons')).toContain('5')
  })

  it('restoreCollectionItem removes from hidden ids', () => {
    hideCollectionItem('reasons', '5')
    const result = restoreCollectionItem('reasons', '5')
    expect(result).not.toContain('5')
  })

  it('hideCollectionItem does not duplicate', () => {
    hideCollectionItem('reasons', '5')
    hideCollectionItem('reasons', '5')
    const ids = getCollectionHiddenIds('reasons')
    expect(ids.filter((id: string) => id === '5').length).toBe(1)
  })
})

describe('contentService — mergeCollectionWithLocal', () => {
  it('merges defaults with overrides and local items', () => {
    const defaults: ContentItem[] = [
      { id: 1, title: 'Base 1', text: 'Texto base' },
      { id: 2, title: 'Base 2', text: 'Texto base 2' }
    ]
    // Add local item
    addCollectionItem('reasons', { id: 'local-99', title: 'Local', text: 'Mi razón' } as ContentItem)
    // Add override
    setCollectionOverride('reasons', '1', { title: 'Base 1 editada' })
    // Hide item 2
    hideCollectionItem('reasons', '2')

    const merged = mergeCollectionWithLocal(defaults, 'reasons')
    // Should have: base 1 (overridden), local 99. Base 2 hidden.
    expect(merged.length).toBe(2)
    expect(merged.find((i: ContentItem) => i.id === 1)!.title).toBe('Base 1 editada')
    expect(merged.find((i: ContentItem) => i.id === 'local-99')).toBeDefined()
    expect(merged.find((i: ContentItem) => i.id === 2)).toBeUndefined()
  })
})

describe('contentService — Legacy', () => {
  it('getLegacyMonthlyLetters exists and returns array', async () => {
    const { getLegacyMonthlyLetters } = await import('../services/contentService')
    const result = getLegacyMonthlyLetters()
    expect(Array.isArray(result)).toBe(true)
  })

  it('getSimulationUnlocked returns false initially', async () => {
    const { getSimulationUnlocked } = await import('../services/contentService')
    expect(getSimulationUnlocked()).toBe(false)
  })
})

import { describe, it, expect, beforeEach } from 'vitest'
import {
  getLocalItems,
  saveLocalItems,
  addLocalItem,
  updateLocalItem,
  deleteLocalItem,
  getLocalOverrides,
  setLocalOverride,
  deleteLocalOverride,
  getHiddenItemIds,
  hideDefaultItem,
  restoreHiddenItem,
  mergeWithLocalItems
} from '../utils/localContentStore'

beforeEach(() => {
  localStorage.clear()
})

// ─── Items ───

describe('localContentStore — Items', () => {
  it('returns empty array for unknown collection', () => {
    expect(getLocalItems('nonexistent')).toEqual([])
  })

  it('saves and retrieves items', () => {
    const items = [{ id: '1', title: 'Test' }, { id: '2', title: 'Test 2' }]
    saveLocalItems('reasons', items)
    expect(getLocalItems('reasons')).toEqual(items)
  })

  it('replaces items on save (not append)', () => {
    saveLocalItems('reasons', [{ id: 'a' }])
    saveLocalItems('reasons', [{ id: 'b' }])
    expect(getLocalItems('reasons')).toHaveLength(1)
    expect(getLocalItems('reasons')[0].id).toBe('b')
  })

  it('addLocalItem adds with isLocal flag and displayLabel', () => {
    const item = { id: 'test-1', title: 'Custom' }
    const result = addLocalItem('reasons', item)
    expect(result).toHaveLength(1)
    expect(result[0].isLocal).toBe(true)
    expect(result[0].displayLabel).toMatch(/^Local \d+$/)
  })

  it('addLocalItem preserves existing items', () => {
    addLocalItem('reasons', { id: 'a', title: 'First' })
    addLocalItem('reasons', { id: 'b', title: 'Second' })
    expect(getLocalItems('reasons')).toHaveLength(2)
  })

  it('updateLocalItem updates only matching local item', () => {
    addLocalItem('reasons', { id: 'a', title: 'Original' })
    const updated = updateLocalItem('reasons', 'a', { title: 'Updated' })
    expect(updated[0].title).toBe('Updated')
  })

  it('updateLocalItem does not change non-matching items', () => {
    addLocalItem('reasons', { id: 'a', title: 'A' })
    addLocalItem('reasons', { id: 'b', title: 'B' })
    updateLocalItem('reasons', 'a', { title: 'A-updated' })
    const items = getLocalItems('reasons')
    expect(items.find(i => i.id === 'b')!.title).toBe('B')
  })

  it('deleteLocalItem removes only matching local item', () => {
    addLocalItem('reasons', { id: 'a' })
    addLocalItem('reasons', { id: 'b' })
    deleteLocalItem('reasons', 'a')
    expect(getLocalItems('reasons')).toHaveLength(1)
    expect(getLocalItems('reasons')[0].id).toBe('b')
  })

  it('deleteLocalItem does nothing for non-local items', () => {
    saveLocalItems('reasons', [{ id: 'base-1', isLocal: false }])
    deleteLocalItem('reasons', 'base-1')
    expect(getLocalItems('reasons')).toHaveLength(1)
  })
})

// ─── Overrides ───

describe('localContentStore — Overrides', () => {
  it('returns empty object initially', () => {
    expect(getLocalOverrides('reasons')).toEqual({})
  })

  it('sets and retrieves override', () => {
    setLocalOverride('reasons', '1', { title: 'Overridden' })
    const overrides = getLocalOverrides('reasons')
    expect(overrides['1']).toBeDefined()
    expect(overrides['1'].title).toBe('Overridden')
  })

  it('preserves multiple overrides', () => {
    setLocalOverride('reasons', '1', { title: 'One' })
    setLocalOverride('reasons', '2', { title: 'Two' })
    const overrides = getLocalOverrides('reasons')
    expect(Object.keys(overrides)).toHaveLength(2)
  })

  it('deletes override', () => {
    setLocalOverride('reasons', '1', { title: 'X' })
    deleteLocalOverride('reasons', '1')
    expect(getLocalOverrides('reasons')['1']).toBeUndefined()
  })

  it('updates existing override', () => {
    setLocalOverride('reasons', '1', { title: 'First' })
    setLocalOverride('reasons', '1', { title: 'Second' })
    expect(getLocalOverrides('reasons')['1'].title).toBe('Second')
  })
})

// ─── Hidden ───

describe('localContentStore — Hidden', () => {
  it('returns empty array initially', () => {
    expect(getHiddenItemIds('reasons')).toEqual([])
  })

  it('hides item', () => {
    const ids = hideDefaultItem('reasons', '5')
    expect(ids).toContain('5')
    expect(getHiddenItemIds('reasons')).toContain('5')
  })

  it('does not duplicate hidden items', () => {
    hideDefaultItem('reasons', '5')
    hideDefaultItem('reasons', '5')
    expect(getHiddenItemIds('reasons').filter(id => id === '5')).toHaveLength(1)
  })

  it('restores hidden item', () => {
    hideDefaultItem('reasons', '5')
    const ids = restoreHiddenItem('reasons', '5')
    expect(ids).not.toContain('5')
  })

  it('hides multiple items independently', () => {
    hideDefaultItem('reasons', '1')
    hideDefaultItem('reasons', '2')
    restoreHiddenItem('reasons', '1')
    expect(getHiddenItemIds('reasons')).toEqual(['2'])
  })
})

// ─── Merge ───

describe('localContentStore — mergeWithLocalItems', () => {
  it('returns only defaults when no local data', () => {
    const defaults = [{ id: 1, title: 'Base' }]
    const merged = mergeWithLocalItems(defaults, 'reasons')
    expect(merged).toHaveLength(1)
    expect(merged[0].title).toBe('Base')
  })

  it('applies overrides to base items', () => {
    const defaults = [{ id: 1, title: 'Original' }]
    setLocalOverride('reasons', '1', { title: 'Overridden' })
    const merged = mergeWithLocalItems(defaults, 'reasons')
    expect(merged[0].title).toBe('Overridden')
    expect(merged[0].isOverridden).toBe(true)
  })

  it('filters out hidden items', () => {
    const defaults = [{ id: 1, title: 'A' }, { id: 2, title: 'B' }]
    hideDefaultItem('reasons', '2')
    const merged = mergeWithLocalItems(defaults, 'reasons')
    expect(merged).toHaveLength(1)
    expect(merged[0].id).toBe(1)
  })

  it('includes local items after base items', () => {
    const defaults = [{ id: 1, title: 'Base' }]
    addLocalItem('reasons', { id: 'local-a', title: 'Custom' })
    const merged = mergeWithLocalItems(defaults, 'reasons')
    expect(merged).toHaveLength(2)
    expect(merged[1].isLocal).toBe(true)
    expect(merged[1].title).toBe('Custom')
  })

  it('handles empty defaults gracefully', () => {
    const merged = mergeWithLocalItems([], 'reasons')
    expect(merged).toEqual([])
  })
})

import { describe, it, expect, beforeEach } from 'vitest'
import {
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
  mergeCollectionWithLocal,
  getLegacyMonthlyLetters,
  saveLegacyMonthlyLetters,
  getLegacyOpenWhenLetters,
  saveLegacyOpenWhenLetters,
  isMonthlyLetterOpened,
  setMonthlyLetterOpened,
  isOpenWhenLetterOpened,
  setOpenWhenLetterOpened,
  getSimulationUnlocked,
  setSimulationUnlocked
} from '../repositories/localContentRepository'

beforeEach(() => {
  localStorage.clear()
})

// ─── Helpers ───

function makeItem(id: string, title = 'Test'): any {
  return { id, title, createdAt: new Date().toISOString(), isLocal: true }
}

// ─── Collection items ───

describe('getCollectionItems / saveCollectionItems', () => {
  it('returns empty array for unknown collection', () => {
    expect(getCollectionItems('nonexistent')).toEqual([])
  })

  it('round-trips items', () => {
    const items = [makeItem('a'), makeItem('b')]
    saveCollectionItems('reasons', items)
    expect(getCollectionItems('reasons')).toEqual(items)
  })

  it('saveCollectionItems normalizes non-array to empty array', () => {
    const result = saveCollectionItems('test', null as any)
    expect(result).toEqual([])
    expect(getCollectionItems('test')).toEqual([])
  })
})

// ─── Add / Update / Delete ───

describe('addCollectionItem', () => {
  it('adds an item with metadata', () => {
    const result = addCollectionItem('reasons', makeItem('1'))
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('1')
    expect(result[0].createdBy).toBeDefined()
    expect(result[0].source).toBeDefined()
  })

  it('appends to existing items', () => {
    saveCollectionItems('reasons', [makeItem('a')])
    addCollectionItem('reasons', makeItem('b'))
    expect(getCollectionItems('reasons')).toHaveLength(2)
  })
})

describe('updateCollectionItem', () => {
  it('updates an existing local item', () => {
    saveCollectionItems('reasons', [makeItem('1', 'Original')])
    const updated = updateCollectionItem('reasons', '1', { title: 'Updated' })
    expect(updated[0].title).toBe('Updated')
    expect(updated[0].updatedAt).toBeDefined()
  })

  it('keeps items unchanged if id not found', () => {
    saveCollectionItems('reasons', [makeItem('1')])
    const result = updateCollectionItem('reasons', 'nonexistent', { title: 'X' })
    expect(result).toHaveLength(1)
    expect(result[0].title).toBe('Test')
  })
})

describe('deleteCollectionItem', () => {
  it('removes an item by id', () => {
    saveCollectionItems('reasons', [makeItem('1'), makeItem('2')])
    const result = deleteCollectionItem('reasons', '1')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('2')
  })

  it('does nothing if id not found', () => {
    saveCollectionItems('reasons', [makeItem('1')])
    const result = deleteCollectionItem('reasons', 'nonexistent')
    expect(result).toHaveLength(1)
  })
})

// ─── Overrides ───

describe('collection overrides', () => {
  it('getCollectionOverrides returns empty object for unknown', () => {
    expect(getCollectionOverrides('unknown')).toEqual({})
  })

  it('round-trips overrides', () => {
    const overrides = { a: { id: 'a', title: 'Override' } }
    saveCollectionOverrides('reasons', overrides)
    expect(getCollectionOverrides('reasons')).toEqual(overrides)
  })

  it('setCollectionOverride adds/updates an override', () => {
    const result = setCollectionOverride('reasons', 'item1', { title: 'New' })
    expect(result['item1'].title).toBe('New')
  })

  it('deleteCollectionOverride removes an override', () => {
    saveCollectionOverrides('reasons', { a: { id: 'a' }, b: { id: 'b' } })
    const result = deleteCollectionOverride('reasons', 'a')
    expect(result).not.toHaveProperty('a')
    expect(result).toHaveProperty('b')
  })
})

// ─── Hidden items ───

describe('hidden items', () => {
  it('getCollectionHiddenIds returns empty array for unknown', () => {
    expect(getCollectionHiddenIds('unknown')).toEqual([])
  })

  it('round-trips hidden ids', () => {
    saveCollectionHiddenIds('reasons', ['a', 'b'])
    expect(getCollectionHiddenIds('reasons')).toEqual(['a', 'b'])
  })

  it('hideCollectionItem adds to hidden list', () => {
    saveCollectionHiddenIds('reasons', ['a'])
    const result = hideCollectionItem('reasons', 'b')
    expect(result).toContain('a')
    expect(result).toContain('b')
  })

  it('hideCollectionItem does not duplicate ids', () => {
    const result = hideCollectionItem('reasons', 'a')
    hideCollectionItem('reasons', 'a')
    expect(getCollectionHiddenIds('reasons').filter((id: string) => id === 'a')).toHaveLength(1)
  })

  it('restoreCollectionItem removes from hidden list', () => {
    saveCollectionHiddenIds('reasons', ['a', 'b'])
    const result = restoreCollectionItem('reasons', 'a')
    expect(result).not.toContain('a')
    expect(result).toContain('b')
  })
})

// ─── Merge ───

describe('mergeCollectionWithLocal', () => {
  it('returns defaults augmented with metadata when no local items', () => {
    const defaults = [makeItem('d1')]
    const result = mergeCollectionWithLocal(defaults, 'empty-collection')
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('d1')
    expect(result[0].isOverridden).toBe(false)
    expect(result[0].isLocal).toBe(false)
  })

  it('merges local items after defaults', () => {
    const defaults = [makeItem('d1')]
    saveCollectionItems('test-collection', [makeItem('local1')])
    const result = mergeCollectionWithLocal(defaults, 'test-collection')
    expect(result).toHaveLength(2)
    expect(result[0].id).toBe('d1')
    expect(result[1].id).toBe('local1')
    expect(result[1].isLocal).toBe(true)
  })
})

// ─── Legacy letters ───

describe('legacy monthly letters', () => {
  it('returns empty array by default', () => {
    expect(getLegacyMonthlyLetters()).toEqual([])
  })

  it('round-trips letters', () => {
    const letters = [makeItem('m1'), makeItem('m2')]
    saveLegacyMonthlyLetters(letters)
    expect(getLegacyMonthlyLetters()).toEqual(letters)
  })

  it('saveLegacyMonthlyLetters normalizes non-array', () => {
    const result = saveLegacyMonthlyLetters(null as any)
    expect(result).toEqual([])
  })
})

describe('legacy open-when letters', () => {
  it('returns empty array by default', () => {
    expect(getLegacyOpenWhenLetters()).toEqual([])
  })

  it('round-trips letters', () => {
    const letters = [makeItem('o1'), makeItem('o2')]
    saveLegacyOpenWhenLetters(letters)
    expect(getLegacyOpenWhenLetters()).toEqual(letters)
  })
})

// ─── Letter opened state ───

describe('monthly letter opened state', () => {
  it('returns false by default', () => {
    expect(isMonthlyLetterOpened('letter-1')).toBe(false)
  })

  it('round-trips opened state', () => {
    setMonthlyLetterOpened('letter-1', true)
    expect(isMonthlyLetterOpened('letter-1')).toBe(true)
  })

  it('can clear opened state', () => {
    setMonthlyLetterOpened('letter-1', true)
    setMonthlyLetterOpened('letter-1', false)
    expect(isMonthlyLetterOpened('letter-1')).toBe(false)
  })

  it('handles empty id gracefully', () => {
    expect(isMonthlyLetterOpened('')).toBe(false)
    expect(() => setMonthlyLetterOpened('', true)).not.toThrow()
  })
})

describe('open-when letter opened state', () => {
  it('returns false by default', () => {
    expect(isOpenWhenLetterOpened('card-1')).toBe(false)
  })

  it('round-trips opened state', () => {
    setOpenWhenLetterOpened('card-1', true)
    expect(isOpenWhenLetterOpened('card-1')).toBe(true)
  })
})

// ─── Simulation ───

describe('simulation state', () => {
  it('returns false by default', () => {
    expect(getSimulationUnlocked()).toBe(false)
  })

  it('round-trips unlocked state', () => {
    setSimulationUnlocked(true)
    expect(getSimulationUnlocked()).toBe(true)
  })

  it('can disable simulation', () => {
    setSimulationUnlocked(true)
    setSimulationUnlocked(false)
    expect(getSimulationUnlocked()).toBe(false)
  })
})

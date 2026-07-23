import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import useCrudCollection from '../components/centro-universo/useCrudCollection'
import type { ContentItem } from '../types/content'

const testFields = [
  { name: 'title', label: 'Título', required: true },
  { name: 'text', label: 'Texto', type: 'textarea', rows: 3 }
]

const defaultData: ContentItem[] = [
  { id: 'base-1', title: 'Base 1', text: 'Texto base 1', createdAt: '2024-01-01', isLocal: false },
  { id: 'base-2', title: 'Base 2', text: 'Texto base 2', createdAt: '2024-01-02', isLocal: false }
]

beforeEach(() => {
  localStorage.clear()
})

function setup(overrides = {}) {
  return renderHook(() =>
    useCrudCollection('test-collection', defaultData, {
      fields: testFields,
      idPrefix: 'local-test-'
    }, overrides)
  )
}

// ─── Initial state ───

describe('useCrudCollection — initial state', () => {
  it('starts with empty local items', () => {
    const { result } = setup()
    expect(result.current.localItems).toEqual([])
    expect(result.current.localCount).toBe(0)
  })

  it('starts with empty overrides and hidden ids', () => {
    const { result } = setup()
    expect(result.current.overrides).toEqual({})
    expect(result.current.hiddenIds).toEqual([])
  })

  it('visibleBaseItems merges default data with overrides', () => {
    const { result } = setup()
    expect(result.current.visibleBaseItems).toHaveLength(2)
    expect(result.current.visibleBaseItems[0].title).toBe('Base 1')
    expect(result.current.visibleBaseItems[0].isOverridden).toBe(false)
    expect(result.current.visibleBaseItems[0].isHidden).toBe(false)
  })

  it('totalCount equals default data count when no local items', () => {
    const { result } = setup()
    expect(result.current.totalCount).toBe(2)
  })
})

// ─── Local items CRUD ───

describe('useCrudCollection — local items CRUD', () => {
  it('adds a local item', () => {
    const { result } = setup()
    act(() => {
      result.current.setFormValue('title', 'Mi item')
      result.current.setFormValue('text', 'Mi texto')
    })
    act(() => {
      result.current.handleSubmit({ preventDefault: () => {} } as any)
    })
    expect(result.current.localItems).toHaveLength(1)
    expect(result.current.localItems[0].title).toBe('Mi item')
    expect(result.current.localItems[0].isLocal).toBe(true)
    expect(result.current.localCount).toBe(1)
    expect(result.current.totalCount).toBe(3) // 2 base + 1 local
  })

  it('edits a local item', () => {
    const { result } = setup()
    // Add item first
    act(() => {
      result.current.setFormValue('title', 'Original')
      result.current.setFormValue('text', 'Texto')
    })
    act(() => { result.current.handleSubmit({ preventDefault: () => {} } as any) })

    const item = result.current.localItems[0]
    act(() => { result.current.handleEdit(item) })
    act(() => { result.current.setFormValue('title', 'Editado') })
    act(() => { result.current.handleSubmit({ preventDefault: () => {} } as any) })

    expect(result.current.localItems[0].title).toBe('Editado')
    expect(result.current.localCount).toBe(1)
  })

  it('deletes a local item', () => {
    const { result } = setup()
    act(() => {
      result.current.setFormValue('title', 'A eliminar')
    })
    act(() => { result.current.handleSubmit({ preventDefault: () => {} } as any) })
    expect(result.current.localItems).toHaveLength(1)

    const item = result.current.localItems[0]
    // Override window.confirm to return true
    const origConfirm = window.confirm
    window.confirm = () => true
    act(() => { result.current.handleDelete(item) })
    window.confirm = origConfirm

    expect(result.current.localItems).toHaveLength(0)
    expect(result.current.localCount).toBe(0)
  })

  it('does not delete without confirmation', () => {
    const { result } = setup()
    act(() => { result.current.setFormValue('title', 'Item') })
    act(() => { result.current.handleSubmit({ preventDefault: () => {} } as any) })
    const item = result.current.localItems[0]

    const origConfirm = window.confirm
    window.confirm = () => false
    act(() => { result.current.handleDelete(item) })
    window.confirm = origConfirm

    expect(result.current.localItems).toHaveLength(1)
  })

  it('resets form after submit', () => {
    const { result } = setup()
    act(() => {
      result.current.setFormValue('title', 'Test')
    })
    act(() => { result.current.handleSubmit({ preventDefault: () => {} } as any) })
    expect(result.current.getFormValue('title')).toBe('')
    expect(result.current.editingId).toBeNull()
  })
})

// ─── Base overrides ───

describe('useCrudCollection — base overrides', () => {
  it('sets a base override', () => {
    const { result } = setup()
    act(() => { result.current.handleBaseEdit(defaultData[0]) })
    act(() => { result.current.setBaseFormValue('title', 'Override Title') })
    act(() => { result.current.handleBaseSubmit({ preventDefault: () => {} } as any) })

    expect(result.current.overrides).toHaveProperty('base-1')
    expect(result.current.overrides['base-1'].title).toBe('Override Title')
    expect(result.current.editedBaseCount).toBe(1)
  })

  it('restores a base override', () => {
    const { result } = setup()
    act(() => { result.current.handleBaseEdit(defaultData[0]) })
    act(() => { result.current.setBaseFormValue('title', 'Temporary') })
    act(() => { result.current.handleBaseSubmit({ preventDefault: () => {} } as any) })
    expect(result.current.editedBaseCount).toBe(1)

    act(() => { result.current.handleBaseRestore('base-1') })
    expect(result.current.editedBaseCount).toBe(0)
    expect(result.current.overrides).not.toHaveProperty('base-1')
  })

  it('visibleBaseItems reflects overrides', () => {
    const { result } = setup()
    act(() => { result.current.handleBaseEdit(defaultData[0]) })
    act(() => { result.current.setBaseFormValue('title', 'Modified') })
    act(() => { result.current.handleBaseSubmit({ preventDefault: () => {} } as any) })

    const base1 = result.current.visibleBaseItems.find(i => i.id === 'base-1')
    expect(base1?.title).toBe('Modified')
    expect(base1?.isOverridden).toBe(true)
  })

  it('resets base form after submit', () => {
    const { result } = setup()
    act(() => { result.current.handleBaseEdit(defaultData[0]) })
    act(() => { result.current.setBaseFormValue('title', 'Test') })
    act(() => { result.current.handleBaseSubmit({ preventDefault: () => {} } as any) })

    expect(result.current.getBaseFormValue('title')).toBe('')
    expect(result.current.editingBaseId).toBeNull()
  })
})

// ─── Hidden items ───

describe('useCrudCollection — hide/restore items', () => {
  it('hides a base item', () => {
    const { result } = setup()
    const origConfirm = window.confirm
    window.confirm = () => true
    act(() => { result.current.handleBaseHide(defaultData[0]) })
    window.confirm = origConfirm

    expect(result.current.hiddenIds).toContain('base-1')
    expect(result.current.hiddenBaseCount).toBe(1)
  })

  it('unhides a base item', () => {
    const { result } = setup()
    window.confirm = () => true
    act(() => { result.current.handleBaseHide(defaultData[0]) })
    window.confirm = () => false

    act(() => { result.current.handleBaseUnhide('base-1') })
    expect(result.current.hiddenIds).not.toContain('base-1')
    expect(result.current.hiddenBaseCount).toBe(0)
  })

  it('hidden items are marked in visibleBaseItems', () => {
    const { result } = setup()
    window.confirm = () => true
    act(() => { result.current.handleBaseHide(defaultData[0]) })
    window.confirm = () => false

    const base1 = result.current.visibleBaseItems.find(i => i.id === 'base-1')
    expect(base1?.isHidden).toBe(true)
  })
})

// ─── Transform functions ───

describe('useCrudCollection — transform functions', () => {
  it('transformForStorage is called on submit', () => {
    const { result } = renderHook(() =>
      useCrudCollection('test-transform', defaultData, {
        fields: testFields,
        idPrefix: 'local-t-'
      }, {
        transformForStorage: (item) => ({
          ...item,
          title: (item.title as string).toUpperCase()
        })
      })
    )

    act(() => {
      result.current.setFormValue('title', 'lowercase')
    })
    act(() => { result.current.handleSubmit({ preventDefault: () => {} } as any) })

    expect(result.current.localItems[0].title).toBe('LOWERCASE')
  })

  it('transformForEdit is called on edit', () => {
    const { result } = renderHook(() =>
      useCrudCollection('test-transform2', defaultData, {
        fields: testFields,
        idPrefix: 'local-t2-'
      }, {
        transformForEdit: (item) => ({
          ...item,
          title: 'EDITING: ' + (item.title as string)
        })
      })
    )

    // Add an item
    act(() => {
      result.current.setFormValue('title', 'Original')
    })
    act(() => { result.current.handleSubmit({ preventDefault: () => {} } as any) })

    // Edit it — should apply transformForEdit
    const item = result.current.localItems[0]
    act(() => { result.current.handleEdit(item) })
    expect(result.current.getFormValue('title')).toBe('EDITING: Original')
  })
})

// ─── loadData ───

describe('useCrudCollection — loadData', () => {
  it('loadData reads from localStorage', () => {
    // Pre-populate localStorage via a first hook instance
    const hook1 = renderHook(() =>
      useCrudCollection('test-load', defaultData, {
        fields: testFields,
        idPrefix: 'local-ld-'
      })
    )
    act(() => {
      hook1.result.current.setFormValue('title', 'Saved')
    })
    act(() => { hook1.result.current.handleSubmit({ preventDefault: () => {} } as any) })

    // New hook instance should read the saved data
    const hook2 = renderHook(() =>
      useCrudCollection('test-load', defaultData, {
        fields: testFields,
        idPrefix: 'local-ld-'
      })
    )
    act(() => { hook2.result.current.loadData() })

    expect(hook2.result.current.localItems).toHaveLength(1)
    expect(hook2.result.current.localItems[0].title).toBe('Saved')
  })
})

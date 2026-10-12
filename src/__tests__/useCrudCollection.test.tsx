import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import useCrudCollection, { type CrudField } from '../components/centro-universo/useCrudCollection'
import type { ContentItem } from '../types/content'
import * as contentService from '../services/contentService'

const testFields: CrudField[] = [
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

afterEach(() => {
  vi.restoreAllMocks()
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

describe('useCrudCollection — validation and failed persistence', () => {
  const submitEvent = () => ({ preventDefault: vi.fn() } as any)

  it('rejects required fields containing only whitespace without losing the draft', () => {
    const { result } = setup()
    const save = vi.spyOn(contentService, 'addCollectionItem')
    act(() => result.current.setFormValue('title', '   '))
    act(() => {
      expect(result.current.handleSubmit(submitEvent()).success).toBe(false)
    })
    expect(save).not.toHaveBeenCalled()
    expect(result.current.getFormValue('title')).toBe('   ')
    expect(result.current.notice).toEqual({ type: 'error', message: 'Completa el campo «Título».' })
  })

  it('applies custom validation to trimmed values for local and original forms', () => {
    const validate = vi.fn(() => 'Este título ya existe.')
    const { result } = renderHook(() => useCrudCollection('test-collection', defaultData, {
      fields: testFields, validate
    }))
    act(() => result.current.setFormValue('title', ' Duplicado '))
    act(() => { expect(result.current.handleSubmit(submitEvent()).success).toBe(false) })
    expect(validate).toHaveBeenLastCalledWith({ title: 'Duplicado', text: '' })

    act(() => result.current.handleBaseEdit(defaultData[0]))
    act(() => result.current.setBaseFormValue('title', ' Duplicado '))
    act(() => { expect(result.current.handleBaseSubmit(submitEvent()).success).toBe(false) })
    expect(validate).toHaveBeenLastCalledWith({ title: 'Duplicado', text: 'Texto base 1' })
    expect(result.current.editingBaseId).toBe('base-1')
    expect(result.current.overrides).toEqual({})
  })

  it('keeps a new draft and publishes no update when saving fails, then allows retry', () => {
    const { result } = setup()
    act(() => result.current.setFormValue('title', 'Conservar borrador'))
    const updateListener = vi.fn()
    window.addEventListener('distancia-cero-content-updated', updateListener)
    const save = vi.spyOn(contentService, 'addCollectionItem').mockImplementationOnce(() => {
      throw new Error('Almacenamiento lleno.')
    })
    try {
      act(() => { expect(result.current.handleSubmit(submitEvent()).success).toBe(false) })
      expect(result.current.getFormValue('title')).toBe('Conservar borrador')
      expect(result.current.localItems).toEqual([])
      expect(result.current.notice).toEqual({ type: 'error', message: 'Almacenamiento lleno.' })
      expect(updateListener).not.toHaveBeenCalled()

      save.mockRestore()
      act(() => { expect(result.current.handleSubmit(submitEvent()).success).toBe(true) })
      expect(result.current.localItems[0].title).toBe('Conservar borrador')
      expect(result.current.notice?.type).toBe('success')
      expect(updateListener).toHaveBeenCalledTimes(1)
      expect(updateListener.mock.calls[0][0].detail).toEqual({
        collection: 'test-collection', collectionName: 'test-collection'
      })
    } finally {
      window.removeEventListener('distancia-cero-content-updated', updateListener)
    }
  })

  it('keeps the edited item and unsaved changes when updating fails', () => {
    const { result } = setup()
    act(() => result.current.setFormValue('title', 'Guardado'))
    act(() => { result.current.handleSubmit(submitEvent()) })
    const original = result.current.localItems[0]
    act(() => result.current.handleEdit(original))
    act(() => result.current.setFormValue('title', 'Pendiente'))
    vi.spyOn(contentService, 'updateCollectionItem').mockImplementation(() => {
      throw new Error('No se pudo guardar.')
    })
    act(() => { expect(result.current.handleSubmit(submitEvent()).success).toBe(false) })
    expect(result.current.localItems[0]).toEqual(original)
    expect(result.current.editingId).toBe(String(original.id))
    expect(result.current.getFormValue('title')).toBe('Pendiente')
  })

  it.each(['delete', 'override', 'restore', 'hide', 'show'] as const)(
    'reports a failed %s without changing collection state', action => {
      const { result } = setup()
      act(() => result.current.setFormValue('title', 'Guardado'))
      act(() => { result.current.handleSubmit(submitEvent()) })
      act(() => result.current.handleBaseEdit(defaultData[0]))
      const previous = {
        localItems: result.current.localItems,
        overrides: result.current.overrides,
        hiddenIds: result.current.hiddenIds
      }
      const method = {
        delete: 'deleteCollectionItem', override: 'setCollectionOverride',
        restore: 'deleteCollectionOverride', hide: 'hideCollectionItem', show: 'restoreCollectionItem'
      } as const
      vi.spyOn(contentService, method[action]).mockImplementation(() => { throw new Error('Escritura bloqueada.') })
      vi.spyOn(window, 'confirm').mockReturnValue(true)
      act(() => {
        if (action === 'delete') result.current.handleDelete(result.current.localItems[0])
        if (action === 'override') result.current.handleBaseSubmit(submitEvent())
        if (action === 'restore') result.current.handleBaseRestore('base-1')
        if (action === 'hide') result.current.handleBaseHide(defaultData[0])
        if (action === 'show') result.current.handleBaseUnhide('base-1')
      })
      expect(result.current.localItems).toEqual(previous.localItems)
      expect(result.current.overrides).toEqual(previous.overrides)
      expect(result.current.hiddenIds).toEqual(previous.hiddenIds)
      expect(result.current.editingBaseId).toBe('base-1')
      expect(result.current.notice).toEqual({ type: 'error', message: 'Escritura bloqueada.' })
    }
  )
})

describe('useCrudCollection — updates while the CMS stays open', () => {
  it('reloads its own collection and backup updates, preserving the current draft', () => {
    const { result } = setup()
    act(() => result.current.setFormValue('title', 'Borrador sin guardar'))
    contentService.saveCollectionItems('test-collection', [{ id: 'importado', title: 'Respaldo', isLocal: true }])
    act(() => contentService.notifyContentUpdated('unrelated'))
    expect(result.current.localItems).toEqual([])
    act(() => contentService.notifyContentUpdated('test-collection'))
    expect(result.current.localItems[0].title).toBe('Respaldo')
    expect(result.current.getFormValue('title')).toBe('Borrador sin guardar')

    contentService.saveCollectionItems('test-collection', [])
    act(() => contentService.notifyContentUpdated('all'))
    expect(result.current.localItems).toEqual([])
    expect(result.current.getFormValue('title')).toBe('Borrador sin guardar')
  })

  it('reloads both letter collections for a letters event', () => {
    const monthly = renderHook(() => useCrudCollection('monthlyLetters', [], { fields: testFields }))
    const openWhen = renderHook(() => useCrudCollection('openWhenLetters', [], { fields: testFields }))
    contentService.saveCollectionItems('monthlyLetters', [{ id: 'mes', title: 'Mes', isLocal: true }])
    contentService.saveCollectionItems('openWhenLetters', [{ id: 'cuando', title: 'Cuando', isLocal: true }])
    act(() => contentService.notifyContentUpdated('letters'))
    expect(monthly.result.current.localItems[0].id).toBe('mes')
    expect(openWhen.result.current.localItems[0].id).toBe('cuando')
  })

  it('does not discard an edited draft when a backup removed its item', () => {
    const { result } = setup()
    act(() => result.current.setFormValue('title', 'Creado'))
    act(() => { result.current.handleSubmit({ preventDefault() {} } as any) })
    act(() => result.current.handleEdit(result.current.localItems[0]))
    act(() => result.current.setFormValue('title', 'Edición pendiente'))
    contentService.saveCollectionItems('test-collection', [])
    act(() => contentService.notifyContentUpdated('all'))
    act(() => { expect(result.current.handleSubmit({ preventDefault() {} } as any).success).toBe(false) })
    expect(result.current.getFormValue('title')).toBe('Edición pendiente')
    expect(result.current.notice?.message).toContain('ya no existe')
  })
})

import { useState } from 'react'
import type { ContentItem, OverrideMap } from '../../types/content'
import {
  addCollectionItem,
  deleteCollectionItem,
  deleteCollectionOverride,
  getCollectionHiddenIds,
  getCollectionItems,
  getCollectionOverrides,
  hideCollectionItem,
  restoreCollectionItem,
  saveCollectionHiddenIds,
  saveCollectionItems,
  saveCollectionOverrides,
  setCollectionOverride,
  updateCollectionItem
} from '../../services/contentService'

// ─── Types ───

export interface CrudField {
  name: string
  label: string
  required?: boolean
  type?: string  // 'text' | 'textarea' | 'date' | 'select'
  rows?: number
  placeholder?: string
  options?: { value: string; label: string }[]
}

export interface CrudFieldSchema {
  fields?: CrudField[]
  idPrefix?: string
  validate?: (form: Record<string, string>) => string | null
}

export interface CrudOptions {
  transformForStorage?: (item: ContentItem) => ContentItem
  transformForEdit?: (item: ContentItem) => ContentItem
}

export interface CrudFormSubmitResult {
  success: boolean
  isEdit?: boolean
  error?: string
}

export interface CrudCollectionAPI {
  // Data
  localItems: ContentItem[]
  setLocalItems: (items: ContentItem[]) => void
  overrides: OverrideMap
  setOverrides: (overrides: OverrideMap) => void
  hiddenIds: string[]
  setHiddenIds: (ids: string[]) => void
  visibleBaseItems: ContentItem[]
  // Stats
  editedBaseCount: number
  hiddenBaseCount: number
  localCount: number
  totalCount: number
  // Form state
  form: Record<string, string>
  getFormValue: (fieldName: string) => string
  setFormValue: (fieldName: string, value: string) => void
  editingId: string | null
  baseForm: Record<string, string>
  getBaseFormValue: (fieldName: string) => string
  setBaseFormValue: (fieldName: string, value: string) => void
  editingBaseId: string | null
  // Handlers
  handleSubmit: (event: React.FormEvent) => CrudFormSubmitResult
  handleEdit: (item: ContentItem) => ContentItem | undefined
  handleDelete: (item: ContentItem) => CrudFormSubmitResult | undefined
  handleBaseEdit: (item: ContentItem) => void
  handleBaseSubmit: (event: React.FormEvent) => CrudFormSubmitResult
  handleBaseRestore: (itemId: string) => void
  handleBaseHide: (item: ContentItem) => void
  handleBaseUnhide: (itemId: string) => void
  resetForm: () => void
  resetBaseForm: () => void
  // Lifecycle
  loadData: () => void
  dispatchContentUpdate: (name?: string) => void
}

// ─── Hook ───

/**
 * Generic CRUD hook for a single content collection.
 * Encapsulates all state, handlers, and derived data for one module.
 */
export default function useCrudCollection(
  collectionName: string,
  defaultData: ContentItem[],
  fieldSchema: CrudFieldSchema = {},
  options: CrudOptions = {}
): CrudCollectionAPI {
  const { fields = [], idPrefix = `local-${collectionName}-` } = fieldSchema
  const { transformForStorage, transformForEdit } = options

  // --- Data state ---
  const [localItems, setLocalItems] = useState<ContentItem[]>([])
  const [overrides, setOverrides] = useState<OverrideMap>({})
  const [hiddenIds, setHiddenIds] = useState<string[]>([])

  // --- Local item form ---
  const initialForm: Record<string, string> = Object.fromEntries(fields.map(f => [f.name, '']))
  const [form, setForm] = useState<Record<string, string>>(initialForm)
  const [editingId, setEditingId] = useState<string | null>(null)

  // --- Base override form ---
  const initialBaseForm: Record<string, string> = Object.fromEntries(fields.map(f => [`base_${f.name}`, '']))
  const [baseForm, setBaseForm] = useState<Record<string, string>>(initialBaseForm)
  const [editingBaseId, setEditingBaseId] = useState<string | null>(null)

  // --- Load from localStorage on init ---
  const loadData = () => {
    setLocalItems(getCollectionItems(collectionName))
    setOverrides(getCollectionOverrides(collectionName))
    setHiddenIds(getCollectionHiddenIds(collectionName))
  }

  // --- Derived: visible base items ---
  const visibleBaseItems = defaultData.map((item) => {
    const override = overrides[String(item.id)]
    return {
      ...item,
      ...(override || {}),
      id: item.id,
      isOverridden: Boolean(override),
      isHidden: hiddenIds.includes(String(item.id))
    }
  })

  const editedBaseCount = visibleBaseItems.filter(i => i.isOverridden).length
  const hiddenBaseCount = hiddenIds.length
  const localCount = localItems.length
  const totalCount = visibleBaseItems.filter(i => !i.isHidden).length + localCount

  // --- Helpers ---
  const getFormValue = (fieldName: string): string => form[fieldName] || ''
  const setFormValue = (fieldName: string, value: string): void => {
    setForm(prev => ({ ...prev, [fieldName]: value }))
  }
  const getBaseFormValue = (fieldName: string): string => baseForm[`base_${fieldName}`] || ''
  const setBaseFormValue = (fieldName: string, value: string): void => {
    setBaseForm(prev => ({ ...prev, [`base_${fieldName}`]: value }))
  }

  const dispatchContentUpdate = (name?: string) => {
    window.dispatchEvent(new CustomEvent('distancia-cero-content-updated', {
      detail: { collection: name || collectionName }
    }))
  }

  const buildLocalItem = (): ContentItem => {
    const now = new Date().toISOString()
    const item: ContentItem = { id: `${idPrefix}${Date.now()}`, createdAt: now }
    fields.forEach(f => { item[f.name] = (getFormValue(f.name) || '').trim() })
    return transformForStorage ? transformForStorage(item) : item
  }

  const buildOverridePatch = (): ContentItem => {
    const patch: ContentItem = { updatedAt: new Date().toISOString(), id: '' }
    fields.forEach(f => { patch[f.name] = (getBaseFormValue(f.name) || '').trim() })
    return transformForStorage ? transformForStorage(patch) : patch
  }

  // --- Handlers ---
  const handleSubmit = (event: React.FormEvent): CrudFormSubmitResult => {
    event.preventDefault()
    const item = buildLocalItem()
    const updated = editingId
      ? updateCollectionItem(collectionName, editingId, { ...item, updatedAt: new Date().toISOString() })
      : addCollectionItem(collectionName, item)
    setLocalItems(updated)
    resetForm()
    dispatchContentUpdate()
    return { success: true, isEdit: Boolean(editingId) }
  }

  const handleEdit = (item: ContentItem): ContentItem | undefined => {
    if (!item.isLocal) return
    setEditingId(String(item.id))
    const data = transformForEdit ? transformForEdit(item) : item
    const newForm = { ...initialForm }
    fields.forEach(f => { newForm[f.name] = (data[f.name] as string) || '' })
    setForm(newForm)
    return item
  }

  const handleDelete = (item: ContentItem): CrudFormSubmitResult | undefined => {
    if (!item.isLocal) return
    if (!window.confirm('¿Seguro que quieres eliminar este elemento?')) return
    const updated = deleteCollectionItem(collectionName, String(item.id))
    setLocalItems(updated)
    if (editingId === String(item.id)) resetForm()
    dispatchContentUpdate()
    return { success: true }
  }

  const handleBaseEdit = (item: ContentItem) => {
    setEditingBaseId(String(item.id))
    const data = transformForEdit ? transformForEdit(item) : item
    const newForm = { ...initialBaseForm }
    fields.forEach(f => { newForm[`base_${f.name}`] = (data[f.name] as string) || '' })
    setBaseForm(newForm)
  }

  const handleBaseSubmit = (event: React.FormEvent): CrudFormSubmitResult => {
    event.preventDefault()
    if (!editingBaseId) return { success: false, error: 'No item selected' }
    const patch = buildOverridePatch()
    const updatedOverrides = setCollectionOverride(collectionName, editingBaseId, patch)
    setOverrides(updatedOverrides)
    resetBaseForm()
    dispatchContentUpdate()
    return { success: true }
  }

  const handleBaseRestore = (itemId: string) => {
    const updatedOverrides = deleteCollectionOverride(collectionName, itemId)
    setOverrides(updatedOverrides)
    if (String(editingBaseId) === String(itemId)) resetBaseForm()
    dispatchContentUpdate()
  }

  const handleBaseHide = (item: ContentItem) => {
    if (!window.confirm('¿Seguro que quieres ocultar este elemento?')) return
    const updatedHiddenIds = hideCollectionItem(collectionName, String(item.id))
    setHiddenIds(updatedHiddenIds)
    if (String(editingBaseId) === String(item.id)) resetBaseForm()
    dispatchContentUpdate()
  }

  const handleBaseUnhide = (itemId: string) => {
    const updatedHiddenIds = restoreCollectionItem(collectionName, itemId)
    setHiddenIds(updatedHiddenIds)
    dispatchContentUpdate()
  }

  const resetForm = () => {
    setForm(initialForm)
    setEditingId(null)
  }

  const resetBaseForm = () => {
    setBaseForm(initialBaseForm)
    setEditingBaseId(null)
  }

  return {
    // Data
    localItems, setLocalItems,
    overrides, setOverrides,
    hiddenIds, setHiddenIds,
    visibleBaseItems,
    // Stats
    editedBaseCount, hiddenBaseCount, localCount, totalCount,
    // Form state
    form, getFormValue, setFormValue, editingId,
    baseForm, getBaseFormValue, setBaseFormValue, editingBaseId,
    // Handlers
    handleSubmit, handleEdit, handleDelete,
    handleBaseEdit, handleBaseSubmit, handleBaseRestore, handleBaseHide, handleBaseUnhide,
    resetForm, resetBaseForm,
    // Lifecycle
    loadData, dispatchContentUpdate
  }
}

import { useState } from 'react'
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
import { buildCreateMetadata, buildUpdateMetadata } from '../../services/contentMetadataService'

/**
 * Generic CRUD hook for a single content collection.
 * Encapsulates all state, handlers, and derived data for one module.
 *
 * @param {string} collectionName - e.g. 'reasons', 'promises', 'timeline'
 * @param {Array} defaultData - JSON default items
 * @param {object} fieldSchema - { fields: [{name, label}], idPrefix: string, validate(form) }
 * @param {object} options - { transformForStorage(form), transformForEdit(item) }
 */
export default function useCrudCollection(collectionName, defaultData, fieldSchema = {}, options = {}) {
  const { fields = [], idPrefix = `local-${collectionName}-` } = fieldSchema
  const { transformForStorage, transformForEdit } = options

  // --- Data state ---
  const [localItems, setLocalItems] = useState([])
  const [overrides, setOverrides] = useState({})
  const [hiddenIds, setHiddenIds] = useState([])

  // --- Local item form ---
  const initialForm = Object.fromEntries(fields.map(f => [f.name, '']))
  const [form, setForm] = useState(initialForm)
  const [editingId, setEditingId] = useState(null)

  // --- Base override form ---
  const initialBaseForm = Object.fromEntries(fields.map(f => [`base_${f.name}`, '']))
  const [baseForm, setBaseForm] = useState(initialBaseForm)
  const [editingBaseId, setEditingBaseId] = useState(null)

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
  const getFormValue = (fieldName) => form[fieldName] || ''
  const setFormValue = (fieldName, value) => setForm(prev => ({ ...prev, [fieldName]: value }))
  const getBaseFormValue = (fieldName) => baseForm[`base_${fieldName}`] || ''
  const setBaseFormValue = (fieldName, value) => setBaseForm(prev => ({ ...prev, [`base_${fieldName}`]: value }))

  const dispatchContentUpdate = (name) => {
    window.dispatchEvent(new CustomEvent('distancia-cero-content-updated', { detail: { collection: name || collectionName } }))
  }

  const buildLocalItem = () => {
    const now = new Date().toISOString()
    const item = { id: `${idPrefix}${Date.now()}`, createdAt: now }
    fields.forEach(f => { item[f.name] = (getFormValue(f.name) || '').trim() })
    return transformForStorage ? transformForStorage(item) : item
  }

  const buildOverridePatch = () => {
    const patch = { updatedAt: new Date().toISOString() }
    fields.forEach(f => { patch[f.name] = (getBaseFormValue(f.name) || '').trim() })
    return transformForStorage ? transformForStorage(patch) : patch
  }

  // --- Handlers ---
  const handleSubmit = (event) => {
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

  const handleEdit = (item) => {
    if (!item.isLocal) return
    setEditingId(item.id)
    const data = transformForEdit ? transformForEdit(item) : item
    const newForm = { ...initialForm }
    fields.forEach(f => { newForm[f.name] = data[f.name] || '' })
    setForm(newForm)
    return item
  }

  const handleDelete = (item) => {
    if (!item.isLocal) return
    if (!window.confirm('¿Seguro que quieres eliminar este elemento?')) return
    const updated = deleteCollectionItem(collectionName, item.id)
    setLocalItems(updated)
    if (editingId === item.id) resetForm()
    dispatchContentUpdate()
    return { success: true }
  }

  const handleBaseEdit = (item) => {
    setEditingBaseId(item.id)
    const data = transformForEdit ? transformForEdit(item) : item
    const newForm = { ...initialBaseForm }
    fields.forEach(f => { newForm[`base_${f.name}`] = data[f.name] || '' })
    setBaseForm(newForm)
  }

  const handleBaseSubmit = (event) => {
    event.preventDefault()
    if (!editingBaseId) return { success: false, error: 'No item selected' }
    const patch = buildOverridePatch()
    const updatedOverrides = setCollectionOverride(collectionName, editingBaseId, patch)
    setOverrides(updatedOverrides)
    resetBaseForm()
    dispatchContentUpdate()
    return { success: true }
  }

  const handleBaseRestore = (itemId) => {
    const updatedOverrides = deleteCollectionOverride(collectionName, itemId)
    setOverrides(updatedOverrides)
    if (String(editingBaseId) === String(itemId)) resetBaseForm()
    dispatchContentUpdate()
  }

  const handleBaseHide = (item) => {
    if (!window.confirm('¿Seguro que quieres ocultar este elemento?')) return
    const updatedHiddenIds = hideCollectionItem(collectionName, item.id)
    setHiddenIds(updatedHiddenIds)
    if (String(editingBaseId) === String(item.id)) resetBaseForm()
    dispatchContentUpdate()
  }

  const handleBaseUnhide = (itemId) => {
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
    form, getFormValue, setFormValue,
    editingId,
    baseForm, getBaseFormValue, setBaseFormValue,
    editingBaseId,
    // Handlers
    handleSubmit, handleEdit, handleDelete,
    handleBaseEdit, handleBaseSubmit, handleBaseRestore, handleBaseHide, handleBaseUnhide,
    resetForm, resetBaseForm,
    // Lifecycle
    loadData,
    dispatchContentUpdate
  }
}

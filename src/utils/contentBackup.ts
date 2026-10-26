import { CONTENT_COLLECTIONS, type ContentItem, type ContentSnapshot, type OverrideMap } from '../types/content'
import { isPlainObject } from './helpers'
import { validateSiteSettings } from './siteSettings'

const textFields = new Set([
  'title', 'text', 'description', 'date', 'tag', 'category', 'artist', 'sourceType',
  'src', 'link', 'chapter', 'subtitle', 'quote', 'mood', 'image', 'alt', 'videoUrl',
  'month', 'preview', 'unlockHint', 'availableLabel', 'displayLabel', 'footer', 'caption', 'type',
  'createdBy', 'updatedBy', 'createdAt', 'updatedAt', 'source', 'spaceId'
])
const booleanFields = new Set(['locked', 'isLocal', 'isOverridden'])
const forbiddenKeys = new Set(['__proto__', 'constructor', 'prototype'])
const validId = (id: unknown): id is string | number =>
  (typeof id === 'string' && id.trim().length > 0 && !forbiddenKeys.has(id)) ||
  (typeof id === 'number' && Number.isFinite(id))

function invalid(path: string): never {
  throw new Error(`Respaldo inválido: revisa ${path}. No se cambiaron tus datos.`)
}

function checkSafeKeys(value: unknown, path: string): void {
  if (!value || typeof value !== 'object') return
  for (const [key, child] of Object.entries(value)) {
    if (forbiddenKeys.has(key)) invalid(`${path}.${key}`)
    checkSafeKeys(child, `${path}.${key}`)
  }
}

function checkItem(value: unknown, path: string, overrideId?: string): ContentItem {
  if (!isPlainObject(value)) invalid(path)
  if (overrideId === undefined ? !validId(value.id) :
    ('id' in value && (!validId(value.id) || String(value.id) !== overrideId))) invalid(`${path}.id`)
  for (const [key, field] of Object.entries(value)) {
    if (textFields.has(key) && typeof field !== 'string') invalid(`${path}.${key}`)
    if (booleanFields.has(key) && typeof field !== 'boolean') invalid(`${path}.${key}`)
    if (key === 'year' && typeof field !== 'string' &&
      !(typeof field === 'number' && Number.isFinite(field))) invalid(`${path}.${key}`)
    if ((key === 'content' || key === 'details' || key === 'features') &&
      (!Array.isArray(field) || field.some(part => typeof part !== 'string'))) invalid(`${path}.${key}`)
  }
  return overrideId === undefined
    ? { ...value, isLocal: true } as ContentItem
    : { ...value, id: value.id ?? overrideId } as ContentItem
}

/** Valida el documento completo antes de confirmar o escribir cualquier colección. */
export function validateContentBackup(input: unknown): ContentSnapshot {
  if (!isPlainObject(input) || (input.version !== 1 && input.version !== 2)) invalid('versión (1 o 2)')
  checkSafeKeys(input, 'archivo')
  const snapshot: ContentSnapshot = { content: {}, overrides: {}, hidden: {} }
  const containers: Record<string, unknown> = input.version === 1
    ? { content: Object.fromEntries(['monthlyLetters', 'openWhenLetters']
      .filter(key => Object.hasOwn(input, key)).map(key => [key, input[key]])) }
    : input
  let entries = 0
  for (const section of ['content', 'overrides', 'hidden'] as const) {
    if (!Object.hasOwn(containers, section)) continue
    const container = containers[section]
    if (!isPlainObject(container)) invalid(section)
    for (const name of Object.keys(container)) {
      if (!CONTENT_COLLECTIONS.includes(name as typeof CONTENT_COLLECTIONS[number])) invalid(`${section}.${name}`)
    }
    for (const collection of CONTENT_COLLECTIONS) {
      if (!Object.hasOwn(container, collection)) continue
      entries++
      const value = container[collection]
      const path = `${section}.${collection}`
      if (section === 'content') {
        if (!Array.isArray(value)) invalid(path)
        const seen = new Set<string>()
        snapshot.content[collection] = value.map((item, index) => {
          const checked = checkItem(item, `${path}[${index}]`)
          if (seen.has(String(checked.id))) invalid(`${path}: ID duplicado ${checked.id}`)
          seen.add(String(checked.id))
          return checked
        })
      } else if (section === 'overrides') {
        if (!isPlainObject(value)) invalid(path)
        snapshot.overrides[collection] = Object.fromEntries(Object.entries(value).map(([id, item]) => {
          if (!validId(id)) invalid(`${path}.${id}`)
          return [id, checkItem(item, `${path}.${id}`, id)]
        })) as OverrideMap
      } else {
        if (!Array.isArray(value) || value.some(id => !validId(id))) invalid(path)
        snapshot.hidden[collection] = [...new Set(value.map(String))]
      }
    }
  }
  if (input.version === 2 && Object.hasOwn(input, 'settings')) {
    try { snapshot.settings = validateSiteSettings(input.settings) } catch { invalid('los ajustes generales') }
    entries++
  }
  if (entries === 0) invalid('contenido vacío o colecciones ausentes')
  return snapshot
}

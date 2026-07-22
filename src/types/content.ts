// ─── Tipos base para el sistema de contenido ───

/** Nombre de colección soportada por el CRUD */
export type CollectionName =
  | 'reasons'
  | 'promises'
  | 'importantDates'
  | 'futureDreams'
  | 'timeline'
  | 'blackHoleGallery'
  | 'playlist'
  | 'monthlyLetters'
  | 'openWhenLetters'

/** Item genérico de contenido (antes del merge) */
export interface ContentItem {
  id: string | number
  displayLabel?: string
  isLocal?: boolean
  isOverridden?: boolean
  // Content items are user-editable dictionaries with dynamic fields.
  // Using `any` for the index signature is intentional — fields like title,
  // text, description, date, image, tag, etc. vary by collection.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}

/** Payload de metadata de creación */
export interface CreateMetadata {
  createdBy: string
  updatedBy: string
  createdAt: string
  updatedAt: string
  source: string
  spaceId: string
}

/** Payload de metadata de actualización */
export interface UpdateMetadata {
  updatedBy: string
  updatedAt: string
  source: string
  spaceId: string
}

/** Opciones para construir metadata */
export interface MetadataOptions {
  userId?: string
  spaceId?: string
  source?: string
  now?: string | Date
}

/** Override de un item base */
export interface ItemOverride {
  id: string | number
  [key: string]: unknown
}

/** Mapa de overrides indexado por ID */
export type OverrideMap = Record<string, ItemOverride>

/** Contrato de repositorio de contenido */
export interface ContentRepository {
  getCollectionItems(collectionName: string): ContentItem[]
  saveCollectionItems(collectionName: string, items: ContentItem[]): ContentItem[]
  addCollectionItem(collectionName: string, item: ContentItem): ContentItem[]
  updateCollectionItem(collectionName: string, id: string, patch: Partial<ContentItem>): ContentItem[]
  deleteCollectionItem(collectionName: string, id: string): ContentItem[]
  getCollectionOverrides(collectionName: string): OverrideMap
  setCollectionOverride(collectionName: string, id: string, patch: Partial<ContentItem>): OverrideMap
  deleteCollectionOverride(collectionName: string, id: string): OverrideMap
  getCollectionHiddenIds(collectionName: string): string[]
  hideCollectionItem(collectionName: string, id: string): string[]
  restoreCollectionItem(collectionName: string, id: string): string[]
  mergeCollectionWithLocal(defaultItems: ContentItem[], collectionName: string): ContentItem[]
}

/** Tipo de operación de sincronización con Supabase */
export type SyncOperation = 'create' | 'update' | 'delete' | 'override' | 'delete-override' | 'hide' | 'restore'

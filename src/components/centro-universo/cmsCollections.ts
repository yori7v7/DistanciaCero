import { BookOpen, Calendar, Camera, Heart, Mail, Music, Sparkles, Star } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { CollectionName, ContentItem } from '../../types/content'
import type { CrudField, CrudFieldSchema, CrudOptions } from './useCrudCollection'
import monthlyLettersData from '../../data/monthlyLetters.json'
import openWhenData from '../../data/openWhen.json'
import reasonsData from '../../data/reasons.json'
import promisesData from '../../data/promises.json'
import importantDatesData from '../../data/importantDates.json'
import futureDreamsData from '../../data/futureDreams.json'
import timelineData from '../../data/timeline.json'
import blackHoleGalleryData from '../../data/blackHoleGallery.json'
import playlistData from '../../data/playlist.json'
import {
  detailsToText,
  textToDetails,
  parseTimelineDateForInput,
  normalizeTimelineDateForStorage,
} from '../../utils/helpers'

export type CrudAction = 'originals' | 'local'
export type CrudFilter = 'all' | 'overridden' | 'hidden' | 'visible' | 'local'

interface CmsCollectionConfig extends CrudFieldSchema {
  fields: CrudField[]
  idPrefix: string
  defaultData: ContentItem[]
  selectorLabel: string
  selectorIcon: LucideIcon
  collectionLabel: string
  listFields: string[]
  editorPanelId: string
  baseEditorPanelId: string
  options?: CrudOptions
}

const letterOptions: CrudOptions = {
  transformForStorage: (item) => ({
    ...item,
    content: textToDetails(String(item.content || '')),
    locked: item.locked === 'true' || item.locked === true,
  }),
  transformForEdit: (item) => ({
    ...item,
    content: Array.isArray(item.content) ? item.content.join('\n') : String(item.content || ''),
    locked: item.locked ? 'true' : '',
  }),
}

const timelineOptions: CrudOptions = {
  transformForStorage: (item) => ({
    ...item,
    date: normalizeTimelineDateForStorage(item.date),
    details: textToDetails(String(item.details || '')),
  }),
  transformForEdit: (item) => ({
    ...item,
    date: parseTimelineDateForInput(item.date),
    details: detailsToText(item.details),
  }),
}

/** Static editor definitions; collection state remains in useCrudCollection. */
export const cmsCollections: Record<CollectionName, CmsCollectionConfig> = {
  monthlyLetters: {
    defaultData: monthlyLettersData,
    selectorLabel: 'Cartas', selectorIcon: Mail,
    collectionLabel: 'Cartas Mensuales',
    idPrefix: 'local-monthly-',
    listFields: ['title', 'month', 'tag'],
    editorPanelId: 'local-monthly-editor', baseEditorPanelId: 'base-monthly-editor',
    options: letterOptions,
    fields: [
      { name: 'month', label: 'Mes', placeholder: 'Ej. Enero 2024' },
      { name: 'title', label: 'Título', required: true, placeholder: 'Título de la carta' },
      { name: 'preview', label: 'Vista previa', type: 'textarea', rows: 2, placeholder: 'Un breve adelanto...' },
      { name: 'content', label: 'Contenido', required: true, type: 'textarea', rows: 6, placeholder: 'Escribe la carta (un párrafo por línea)' },
      { name: 'tag', label: 'Etiqueta', placeholder: 'Ej. aniversario, San Valentín' },
      { name: 'locked', label: 'Bloqueada', type: 'select', options: [{ value: '', label: 'Desbloqueada' }, { value: 'true', label: 'Bloqueada' }] },
    ],
  },
  openWhenLetters: {
    defaultData: openWhenData,
    selectorLabel: 'Abrir cuando', selectorIcon: BookOpen,
    collectionLabel: 'Cartas Abrir Cuando',
    idPrefix: 'local-openwhen-',
    listFields: ['title', 'mood', 'tag'],
    editorPanelId: 'local-openwhen-editor', baseEditorPanelId: 'base-openwhen-editor',
    options: letterOptions,
    fields: [
      { name: 'mood', label: 'Mood', placeholder: 'Ej. Cuando extrañes nuestros viajes' },
      { name: 'title', label: 'Título', required: true, placeholder: 'Título de la carta' },
      { name: 'preview', label: 'Vista previa', type: 'textarea', rows: 2, placeholder: 'Un breve adelanto...' },
      { name: 'content', label: 'Contenido', required: true, type: 'textarea', rows: 6, placeholder: 'Escribe la carta (un párrafo por línea)' },
      { name: 'tag', label: 'Etiqueta', placeholder: 'Ej. nostalgia, futuro' },
      { name: 'locked', label: 'Bloqueada', type: 'select', options: [{ value: '', label: 'Desbloqueada' }, { value: 'true', label: 'Bloqueada' }] },
    ],
  },
  reasons: {
    defaultData: reasonsData,
    selectorLabel: 'Razones', selectorIcon: Heart,
    collectionLabel: '100 razones',
    idPrefix: 'local-reason-',
    listFields: ['title', 'text'],
    editorPanelId: 'local-reasons-editor', baseEditorPanelId: 'base-reasons-editor',
    fields: [
      { name: 'title', label: 'Título de la razón', required: true, placeholder: 'Ej. Razón 101' },
      { name: 'text', label: 'Texto de la razón', required: true, type: 'textarea', rows: 4, placeholder: 'Escribe una nueva razón para que flote en la sección.' },
    ],
  },
  promises: {
    defaultData: promisesData,
    selectorLabel: 'Promesas', selectorIcon: Star,
    collectionLabel: 'Promesas',
    idPrefix: 'local-promise-',
    listFields: ['title', 'text'],
    editorPanelId: 'local-promises-editor', baseEditorPanelId: 'base-promises-editor',
    fields: [
      { name: 'title', label: 'Título', required: true, placeholder: 'Ej. Promesa #1' },
      { name: 'text', label: 'Texto', required: true, type: 'textarea', rows: 4, placeholder: 'Escribe la promesa...' },
      { name: 'tag', label: 'Tag', placeholder: 'Ej. eterna, diaria, viaje' },
    ],
  },
  importantDates: {
    defaultData: importantDatesData,
    selectorLabel: 'Fechas', selectorIcon: Calendar,
    collectionLabel: 'Fechas importantes',
    idPrefix: 'local-date-',
    listFields: ['date', 'title', 'description'],
    editorPanelId: 'local-dates-editor', baseEditorPanelId: 'base-dates-editor',
    fields: [
      { name: 'date', label: 'Fecha', type: 'date' },
      { name: 'title', label: 'Título', required: true, placeholder: 'Ej. Primer beso' },
      { name: 'description', label: 'Descripción', type: 'textarea', rows: 3, placeholder: '¿Qué pasó ese día?' },
      { name: 'tag', label: 'Tag', placeholder: 'Ej. aniversario, viaje' },
    ],
  },
  futureDreams: {
    defaultData: futureDreamsData,
    selectorLabel: 'Sueños', selectorIcon: Sparkles,
    collectionLabel: 'Wishlist / Sueños',
    idPrefix: 'local-dream-',
    listFields: ['title', 'category', 'description'],
    editorPanelId: 'local-dreams-editor', baseEditorPanelId: 'base-dreams-editor',
    fields: [
      { name: 'category', label: 'Categoría', placeholder: 'Ej. Viajes, Hogar, Aventuras' },
      { name: 'title', label: 'Título', required: true, placeholder: 'Ej. Viaje a Japón' },
      { name: 'description', label: 'Descripción', type: 'textarea', rows: 3, placeholder: 'Describe el sueño...' },
    ],
  },
  timeline: {
    defaultData: timelineData,
    selectorLabel: 'Historia', selectorIcon: BookOpen,
    collectionLabel: 'Historia',
    idPrefix: 'local-timeline-',
    listFields: ['chapter', 'title', 'date'],
    editorPanelId: 'local-timeline-editor', baseEditorPanelId: 'base-timeline-editor',
    options: timelineOptions,
    fields: [
      { name: 'chapter', label: 'Capítulo', required: true, placeholder: 'Ej. Capítulo I' },
      { name: 'date', label: 'Fecha', required: true, placeholder: 'YYYY-MM-DD o "15 de enero de 2026"' },
      { name: 'title', label: 'Título', required: true, placeholder: 'Nombre del momento' },
      { name: 'subtitle', label: 'Subtítulo', placeholder: 'Una frase que lo acompañe' },
      { name: 'description', label: 'Descripción', required: true, type: 'textarea', rows: 4, placeholder: 'Cuenta la historia...' },
      { name: 'quote', label: 'Cita', type: 'textarea', rows: 2, placeholder: 'Una frase especial' },
      { name: 'details', label: 'Detalles', type: 'textarea', rows: 3, placeholder: 'Uno por línea' },
      { name: 'mood', label: 'Mood', placeholder: 'Ej. romántico, aventura, nostalgia' },
    ],
  },
  blackHoleGallery: {
    defaultData: blackHoleGalleryData,
    selectorLabel: 'Galería', selectorIcon: Camera,
    collectionLabel: 'Galería',
    idPrefix: 'local-blackhole-',
    listFields: ['title', 'date', 'tag'],
    editorPanelId: 'local-blackhole-editor', baseEditorPanelId: 'base-blackhole-editor',
    fields: [
      { name: 'date', label: 'Fecha', placeholder: 'YYYY-MM-DD o "15 de enero de 2026"' },
      { name: 'title', label: 'Título', required: true, placeholder: 'Nombre del recuerdo' },
      { name: 'description', label: 'Descripción', type: 'textarea', rows: 3, placeholder: '¿Qué pasó ese día?' },
      { name: 'image', label: 'Imagen (base64 o URL)', type: 'textarea', rows: 2, placeholder: 'Pega una URL o usa el botón de subir archivo' },
      { name: 'alt', label: 'Texto alternativo', placeholder: 'Describe la imagen' },
      { name: 'tag', label: 'Tag', placeholder: 'Ej. foto, concierto, viaje' },
      { name: 'videoUrl', label: 'Video URL', placeholder: 'https://...' },
    ],
  },
  playlist: {
    defaultData: playlistData,
    selectorLabel: 'Música', selectorIcon: Music,
    collectionLabel: 'Playlist',
    idPrefix: 'local-song-',
    listFields: ['title', 'artist', 'description'],
    editorPanelId: 'local-playlist-editor', baseEditorPanelId: 'base-playlist-editor',
    fields: [
      { name: 'title', label: 'Título', required: true, placeholder: 'Ej. Nuestra canción' },
      { name: 'artist', label: 'Artista', placeholder: 'Nombre del artista' },
      { name: 'description', label: 'Descripción', type: 'textarea', rows: 3, placeholder: '¿Por qué es especial?' },
      { name: 'sourceType', label: 'Tipo', type: 'select', options: [{ value: 'local', label: 'Local' }, { value: 'external', label: 'Enlace externo' }] },
      { name: 'src', label: 'URL o archivo', placeholder: '/audio/cancion.mp3' },
      { name: 'link', label: 'Enlace', placeholder: 'https://...' },
      { name: 'tag', label: 'Tag', placeholder: 'Ej. romántica, bailable' },
    ],
  },
}

export const cmsSelectorOrder: readonly CollectionName[] = [
  'monthlyLetters', 'openWhenLetters', 'reasons', 'promises', 'importantDates',
  'futureDreams', 'timeline', 'blackHoleGallery', 'playlist',
]

// Keep every panel mounted in its previous DOM order, preserving form nodes and IDs.
export const cmsPanelOrder: readonly CollectionName[] = [
  'monthlyLetters', 'openWhenLetters', 'reasons', 'importantDates', 'futureDreams',
  'timeline', 'blackHoleGallery', 'playlist', 'promises',
]

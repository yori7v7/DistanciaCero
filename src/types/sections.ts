import type { ContentItem } from './content'

/** Contenido base de los lectores; el CMS mantiene sus campos dinámicos. */
export interface TimelineContent extends ContentItem {
  chapter?: string
  date?: string
  year?: string | number
  title?: string
  subtitle?: string
  description?: string
  text?: string
  caption?: string
  quote?: string
  details?: string[]
  features?: string[]
  mood?: string
  type?: string
}

export interface ReasonContent extends ContentItem {
  title?: string
  text?: string
}

export interface GalleryContent extends ContentItem {
  date?: string
  title?: string
  description?: string
  caption?: string
  image?: string
  alt?: string
  tag?: string
  type?: string
}

export interface PlaylistContent extends ContentItem {
  title?: string
  artist?: string
  description?: string
  sourceType?: string
  src?: string
  link?: string
  tag?: string
}

export interface UniverseDescription {
  type?: string
  name?: string
  description?: string
  features?: string[]
}

export interface UniversePlanet extends UniverseDescription {
  id: string | number
  size: number
  colorA: string
  colorB?: string
  hasRing?: boolean
  orbit?: number
  duration?: number
  delay?: number
}

export interface UniverseContent {
  center?: UniverseDescription
  planets?: UniversePlanet[]
}

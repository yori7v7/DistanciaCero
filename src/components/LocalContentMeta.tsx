import type { ContentItem } from '../types/content'
import { getDisplayName } from '../services/profileService'

interface LocalContentMetaProps {
  item: ContentItem | null | undefined
}

function LocalContentMeta({ item }: LocalContentMetaProps) {
  if (!item || (!item.createdBy && !item.updatedBy)) return null

  const createdName = item.createdBy ? getDisplayName(String(item.createdBy)) : ''
  const updatedName = item.updatedBy ? getDisplayName(String(item.updatedBy)) : ''
  const shouldShowUpdated = item.updatedBy && item.updatedBy !== item.createdBy && updatedName

  if (!createdName && !shouldShowUpdated) return null

  return (
    <div className="text-xs mt-2 flex flex-wrap gap-3 text-muted" aria-label="Metadata local del contenido">
      {createdName && (
        <span className="inline-flex items-center gap-1">Creado por: {createdName}</span>
      )}
      {shouldShowUpdated && (
        <span className="inline-flex items-center gap-1">Editado por: {updatedName}</span>
      )}
    </div>
  )
}

export default LocalContentMeta

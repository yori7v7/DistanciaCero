import { getDisplayName } from '../services/profileService'

function LocalContentMeta({ item }) {
  if (!item || (!item.createdBy && !item.updatedBy)) return null

  const createdName = item.createdBy ? getDisplayName(item.createdBy) : ''
  const updatedName = item.updatedBy ? getDisplayName(item.updatedBy) : ''
  const shouldShowUpdated = item.updatedBy && item.updatedBy !== item.createdBy && updatedName

  if (!createdName && !shouldShowUpdated) return null

  return (
    <div className="local-content-meta" aria-label="Metadata local del contenido">
      {createdName ? (
        <span className="local-content-meta-item">Creado por: {createdName}</span>
      ) : null}
      {shouldShowUpdated ? (
        <span className="local-content-meta-item">Editado por: {updatedName}</span>
      ) : null}
    </div>
  )
}

export default LocalContentMeta

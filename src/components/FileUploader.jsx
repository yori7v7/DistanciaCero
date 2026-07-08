import { useState, useRef } from 'react'
import { Upload, X, Check, AlertCircle, Loader, Image, Music, Video } from 'lucide-react'
import { uploadFile, deleteFile } from '../services/storageService'

const TYPE_CONFIG = {
  images: {
    label: 'Imagen',
    icon: Image,
    accept: 'image/jpeg,image/png,image/gif,image/webp,image/svg+xml',
    color: '#ff7ac8'
  },
  audio: {
    label: 'Audio',
    icon: Music,
    accept: 'audio/mpeg,audio/wav,audio/ogg,audio/mp3',
    color: '#7ac8ff'
  },
  videos: {
    label: 'Video',
    icon: Video,
    accept: 'video/mp4,video/webm',
    color: '#c87aff'
  }
}

/**
 * FileUploader — reusable drag-and-drop + click file upload.
 *
 * Props:
 *   type        — 'images' | 'audio' | 'videos'
 *   onUploaded  — callback({ path, url, name }) when upload succeeds
 *   onDelete    — callback(path) when user deletes an uploaded file
 *   maxSize     — max file size in bytes (default 50MB)
 *   className   — optional wrapper class
 */
function FileUploader({ type = 'images', onUploaded, onDelete, maxSize = 52428800, className = '' }) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef(null)
  const config = TYPE_CONFIG[type] || TYPE_CONFIG.images
  const Icon = config.icon

  const handleFile = async (file) => {
    setError(null)

    if (file.size > maxSize) {
      setError(`El archivo excede el límite de ${Math.round(maxSize / 1024 / 1024)}MB.`)
      return
    }

    const allowed = config.accept.split(',').map((s) => s.trim())
    const ext = '.' + (file.name.split('.').pop()?.toLowerCase() || '')
    const mimeOk = allowed.some((a) => {
      if (a.endsWith('/*')) return file.type.startsWith(a.replace('/*', '/'))
      return a === file.type || a === ext
    })

    if (!mimeOk) {
      setError(`Formato no soportado. Usa: ${config.accept}`)
      return
    }

    setUploading(true)
    try {
      const result = await uploadFile(file, type)
      if (result.error) {
        setError(result.error)
      } else if (onUploaded) {
        onUploaded({ path: result.path, url: result.url, name: file.name, size: file.size })
      }
    } catch (err) {
      setError(err.message || 'Error al subir archivo.')
    } finally {
      setUploading(false)
    }
  }

  const handleInputChange = (e) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    if (inputRef.current) inputRef.current.value = ''
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer?.files?.[0]
    if (file) handleFile(file)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = () => setDragOver(false)

  return (
    <div className={`file-uploader ${className} ${dragOver ? 'file-uploader--drag-over' : ''}`}>
      <input
        ref={inputRef}
        type="file"
        accept={config.accept}
        onChange={handleInputChange}
        className="file-uploader__input"
        aria-label={`Subir ${config.label.toLowerCase()}`}
      />

      <div
        className="file-uploader__dropzone"
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {uploading ? (
          <>
            <Loader className="file-uploader__icon file-uploader__icon--spinning" size={28} />
            <span>Subiendo...</span>
          </>
        ) : (
          <>
            <Icon className="file-uploader__icon" size={28} style={{ color: config.color }} />
            <span className="file-uploader__label">
              <strong>Click</strong> o arrastra tu {config.label.toLowerCase()} aquí
            </span>
            <span className="file-uploader__hint">
              {config.accept.split(',').slice(0, 3).join(', ')} — máx {Math.round(maxSize / 1024 / 1024)}MB
            </span>
          </>
        )}
      </div>

      {error && (
        <div className="file-uploader__error">
          <AlertCircle size={14} />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="file-uploader__error-close" aria-label="Cerrar">
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  )
}

export default FileUploader

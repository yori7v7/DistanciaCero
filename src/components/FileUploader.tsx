import { useState, useRef } from 'react'
import { Upload, X, AlertCircle, Loader, Image, Music, Video } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { uploadFile } from '../services/storageService'

type FileType = 'images' | 'audio' | 'videos'

interface TypeConfig {
  label: string
  icon: LucideIcon
  accept: string
  color: string
}

interface UploadResult {
  path: string
  url: string | null
  name: string
  size: number
}

interface FileUploaderProps {
  type?: FileType
  onUploaded?: (result: UploadResult) => void
  onDelete?: (path: string) => void
  maxSize?: number
  className?: string
}

const TYPE_CONFIG: Record<FileType, TypeConfig> = {
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

function FileUploader({ type = 'images', onUploaded, maxSize = 52428800, className = '' }: FileUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const config = TYPE_CONFIG[type] || TYPE_CONFIG.images
  const Icon = config.icon

  const handleFile = async (file: File) => {
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
      setError((err as Error).message || 'Error al subir archivo.')
    } finally {
      setUploading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    if (inputRef.current) inputRef.current.value = ''
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer?.files?.[0]
    if (file) handleFile(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = () => setDragOver(false)

  return (
    <div className={`file-uploader ${className} ${dragOver ? 'file-uploader--drag-over' : ''}`.trim()}>
      <input
        ref={inputRef}
        type="file"
        accept={config.accept}
        onChange={handleInputChange}
        className="hidden"
        aria-label={`Subir ${config.label.toLowerCase()}`}
      />

      <div
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer
          transition-all duration-200
          ${dragOver
            ? 'border-[var(--color-pink)] bg-[rgba(255,138,212,0.08)] scale-[1.02]'
            : 'border-[var(--color-border)] hover:border-[var(--color-border-glow)] bg-[rgba(255,255,255,0.02)]'}`}
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader className="animate-spin text-pink" size={28} />
            <span className="text-muted">Subiendo...</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Icon size={28} style={{ color: config.color }} />
            <span className="text-sm text-white-soft">
              <strong>Click</strong> o arrastra tu {config.label.toLowerCase()} aquí
            </span>
            <span className="text-xs text-muted">
              {config.accept.split(',').slice(0, 3).join(', ')} — máx {Math.round(maxSize / 1024 / 1024)}MB
            </span>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 mt-3 p-3 rounded-xl bg-[rgba(255,45,85,0.1)] border border-[rgba(255,45,85,0.25)] text-red text-sm">
          <AlertCircle size={14} />
          <span className="flex-1">{error}</span>
          <button onClick={() => setError(null)} className="text-muted hover:text-white" aria-label="Cerrar">
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  )
}

export default FileUploader

import { useState, useEffect } from 'react'
import SectionTitle from './SectionTitle'
import FileUploader from './FileUploader'
import { Play, Sparkles, Trash2, Loader, Video } from 'lucide-react'
import { listFiles, deleteFile, getFileUrl } from '../services/storageService'
import { isRemoteContentEnabled } from '../integrations/supabase/client'
import { isSupabaseAuthenticated } from '../services/supabaseAuthService'

function VideoMemoriesSection(props) {
  const baseItems = props.items || props.moments || props.memories || props.videos || []
  const [uploads, setUploads] = useState([])
  const [loading, setLoading] = useState(false)
  const [playing, setPlaying] = useState(null)
  const canUpload = isRemoteContentEnabled() && isSupabaseAuthenticated()

  useEffect(() => {
    if (!canUpload) return
    setLoading(true)
    listFiles('videos').then(async (files) => {
      const withUrls = await Promise.all(
        files.map(async (f) => ({
          ...f,
          url: await getFileUrl(f.path, 86400)
        }))
      )
      setUploads(withUrls.filter((f) => f.url))
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [canUpload])

  const handleUploaded = ({ path, url, name }) => {
    setUploads((prev) => [{ path, url, name, createdAt: new Date().toISOString() }, ...prev])
  }

  const handleDelete = async (filePath) => {
    const { error } = await deleteFile(filePath)
    if (!error) {
      setUploads((prev) => prev.filter((f) => f.path !== filePath))
      if (playing === filePath) setPlaying(null)
    }
  }

  const items = [
    ...baseItems,
    ...(baseItems.length === 0 && uploads.length === 0 ? [{
      id: 'soon-moment',
      title: 'Próximamente',
      description: 'Este espacio queda listo para guardar otro momento bonito.',
      date: 'Pendiente',
      label: 'Nuevo recuerdo',
      isPlaceholder: true
    }] : [])
  ]

  return (
    <section className="section" id="momentos">
      <SectionTitle
        eyebrow="Momentos"
        title="Momentos que merecen repetirse"
        text="Sube videítos, recuerdos o detalles que valga la pena volver a mirar."
      />

      {canUpload && (
        <div className="gallery-upload-wrapper">
          <FileUploader type="videos" onUploaded={handleUploaded} />
        </div>
      )}

      {loading && (
        <div className="gallery-loading">
          <Loader className="file-uploader__icon--spinning" size={24} />
          <span>Cargando videos...</span>
        </div>
      )}

      {/* Video player */}
      {playing && (
        <div className="video-player-overlay">
          <div className="video-player-container">
            <button className="video-player__close" onClick={() => setPlaying(null)}>×</button>
            <video src={playing} controls autoPlay className="video-player__video" />
          </div>
        </div>
      )}

      <div className="universe-grid universe-grid-4">
        {/* Uploaded videos */}
        {uploads.map((file) => (
          <article className="universe-card universe-memory-card fade-up" key={file.path}>
            <div className="memory-thumb memory-thumb--video" onClick={() => setPlaying(file.url)}>
              <Play size={28} />
            </div>
            <div className="memory-meta">
              <span>{new Date(file.createdAt).toLocaleDateString('es-MX')}</span>
            </div>
            <h3>{file.name}</h3>
            <button className="ghost-button song-delete-btn" onClick={() => handleDelete(file.path)}
              style={{ marginTop: 8 }}>
              <Trash2 size={14} /> Eliminar
            </button>
          </article>
        ))}

        {/* JSON-based items */}
        {items.map((item) => (
          <article
            className={`universe-card universe-memory-card fade-up ${item.isPlaceholder ? 'coming-soon-card coming-soon-moment' : ''}`}
            key={item.id}
          >
            <div className="memory-thumb">
              {item.isPlaceholder ? <Sparkles size={28} /> : <Play size={28} />}
            </div>
            <div className="memory-meta">
              <span>{item.date || item.label || 'Recuerdo'}</span>
            </div>
            <h3>{item.title || item.name}</h3>
            <p>{item.description || item.text}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

export default VideoMemoriesSection

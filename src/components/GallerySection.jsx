import { useState, useEffect } from 'react'
import SectionTitle from './SectionTitle'
import FileUploader from './FileUploader'
import { Image, Trash2, Loader, Expand } from 'lucide-react'
import { listFiles, deleteFile, getFileUrl } from '../services/storageService'
import { isRemoteContentEnabled } from '../integrations/supabase/client'
import { isSupabaseAuthenticated } from '../services/supabaseAuthService'

function GallerySection({ gallery }) {
  const [uploads, setUploads] = useState([])
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState(null)
  const canUpload = isRemoteContentEnabled() && isSupabaseAuthenticated()

  // Load existing uploads from Storage
  useEffect(() => {
    if (!canUpload) return
    setLoading(true)
    listFiles('images').then(async (files) => {
      // Resolve signed URLs for display
      const withUrls = await Promise.all(
        files.map(async (f) => ({
          ...f,
          url: await getFileUrl(f.path, 86400) // 24h signed URL
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
    }
  }

  const baseItems = Array.isArray(gallery) ? gallery : []

  return (
    <section className="section" id="galeria">
      <SectionTitle
        eyebrow="Galería"
        title="Recuerdos, imágenes y futuros momentos"
        text="Sube tus fotos, dibujos o imágenes favoritas."
      />

      {/* Upload zone — only when authenticated + remote */}
      {canUpload && (
        <div className="gallery-upload-wrapper">
          <FileUploader type="images" onUploaded={handleUploaded} />
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="gallery-loading">
          <Loader className="file-uploader__icon--spinning" size={24} />
          <span>Cargando imágenes...</span>
        </div>
      )}

      {/* Uploaded images grid */}
      {uploads.length > 0 && (
        <div className="gallery-grid">
          {uploads.map((file) => (
            <article
              className="gallery-card gallery-card--uploaded fade-up"
              key={file.path}
              onClick={() => setPreview(file)}
            >
              <div className="gallery-image-wrapper">
                <img src={file.url} alt={file.name} loading="lazy" />
                <div className="gallery-image-actions">
                  <button
                    className="gallery-action-btn"
                    title="Ver"
                    aria-label="Ver imagen"
                    onClick={(e) => { e.stopPropagation(); setPreview(file) }}
                  >
                    <Expand size={16} />
                  </button>
                  <button
                    className="gallery-action-btn gallery-action-btn--delete"
                    title="Eliminar"
                    aria-label="Eliminar imagen"
                    onClick={(e) => { e.stopPropagation(); handleDelete(file.path) }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <h3>{file.name}</h3>
            </article>
          ))}
        </div>
      )}

      {/* Default placeholder cards (fallback) */}
      {baseItems.length > 0 && (
        <div className="gallery-grid" style={uploads.length > 0 ? { marginTop: 0 } : {}}>
          {baseItems.map((item) => (
            <article className="gallery-card fade-up" key={item.id}>
              <div className="gallery-placeholder">
                <Image size={42} />
              </div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      )}

      {/* Lightbox preview */}
      {preview && (
        <div className="gallery-lightbox" onClick={() => setPreview(null)}>
          <button className="gallery-lightbox__close" aria-label="Cerrar">
            ×
          </button>
          <img
            src={preview.url}
            alt={preview.name}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </section>
  )
}

export default GallerySection

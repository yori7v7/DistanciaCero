import { useState, useEffect } from 'react'
import SectionTitle from './SectionTitle'
import FileUploader from './FileUploader'
import { Music, Play, Square, ExternalLink, Trash2, Loader } from 'lucide-react'
import { useAudio } from '../context/AudioContext'
import { listFiles, deleteFile, getFileUrl } from '../services/storageService'
import { isRemoteContentEnabled } from '../integrations/supabase/client'
import { isSupabaseAuthenticated } from '../services/supabaseAuthService'

function SongsSection({ songs }) {
  const { currentTrack, playLocalTrack, stopTrack, openExternalLink } = useAudio()
  const [uploads, setUploads] = useState([])
  const [loadingUploads, setLoadingUploads] = useState(false)
  const canUpload = isRemoteContentEnabled() && isSupabaseAuthenticated()

  useEffect(() => {
    if (!canUpload) return
    setLoadingUploads(true)
    listFiles('audio').then(async (files) => {
      const withUrls = await Promise.all(
        files.map(async (f) => ({
          ...f,
          url: await getFileUrl(f.path, 86400)
        }))
      )
      setUploads(withUrls.filter((f) => f.url))
      setLoadingUploads(false)
    }).catch(() => setLoadingUploads(false))
  }, [canUpload])

  const handleUploaded = ({ path, url, name }) => {
    setUploads((prev) => [{ path, url, name, createdAt: new Date().toISOString() }, ...prev])
  }

  const handleDelete = async (filePath) => {
    const { error } = await deleteFile(filePath)
    if (!error) setUploads((prev) => prev.filter((f) => f.path !== filePath))
  }

  const baseSongs = Array.isArray(songs) ? songs : []

  return (
    <section className="section" id="canciones">
      <SectionTitle
        eyebrow="Canciones"
        title="Música para cuando las palabras no alcanzan"
        text="Sube canciones, o usa links de Spotify y YouTube."
      />

      {canUpload && (
        <div className="gallery-upload-wrapper">
          <FileUploader type="audio" onUploaded={handleUploaded} />
        </div>
      )}

      {loadingUploads && (
        <div className="gallery-loading">
          <Loader className="file-uploader__icon--spinning" size={24} />
          <span>Cargando canciones...</span>
        </div>
      )}

      <div className="card-grid">
        {/* Uploaded songs */}
        {uploads.map((file) => (
          <article className="song-card song-card--uploaded fade-up" key={file.path}>
            <div className="song-icon">
              <Music size={24} />
            </div>
            <h3>{file.name}</h3>
            <span>Subido • {new Date(file.createdAt).toLocaleDateString('es-MX')}</span>
            <div className="song-actions">
              <button
                className="ghost-button"
                onClick={() => {
                  const track = { id: file.path, src: file.url, title: file.name, sourceType: 'local' }
                  currentTrack?.id === file.path ? stopTrack() : playLocalTrack(track)
                }}
              >
                {currentTrack?.id === file.path ? <Square size={16} /> : <Play size={16} />}
                {currentTrack?.id === file.path ? 'Detener' : 'Reproducir'}
              </button>
              <button className="ghost-button song-delete-btn" onClick={() => handleDelete(file.path)}>
                <Trash2 size={14} />
              </button>
            </div>
          </article>
        ))}

        {/* JSON-based songs (fallback) */}
        {baseSongs.map((song) => (
          <article className="song-card fade-up" key={song.id}>
            <div className="song-icon">
              <Music size={24} />
            </div>
            <h3>{song.title}</h3>
            <span>{song.artist}</span>
            <p>{song.dedication}</p>
            <div className="song-meta">
              <strong>Tipo:</strong> {song.sourceType === 'local' ? 'Archivo local' : 'Link externo'}
            </div>
            {song.sourceType === 'local' ? (
              <>
                <div className="song-actions">
                  <button className="ghost-button" onClick={() =>
                    currentTrack?.id === song.id ? stopTrack() : playLocalTrack(song)
                  }>
                    {currentTrack?.id === song.id ? <Square size={16} /> : <Play size={16} />}
                    {currentTrack?.id === song.id ? 'Detener' : 'Reproducir'}
                  </button>
                </div>
                <small className="song-note">Ruta: <code>{song.src}</code></small>
              </>
            ) : (
              <div className="song-actions">
                <button className="ghost-button" onClick={() => openExternalLink(song)}>
                  <ExternalLink size={16} /> Abrir link
                </button>
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  )
}

export default SongsSection

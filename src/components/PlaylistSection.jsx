import { useEffect, useMemo, useState } from 'react'
import SectionTitle from './SectionTitle'
import FileUploader from './FileUploader'
import { ExternalLink, Headphones, Music, Pause, Play, Sparkles, Square, Trash2, Loader } from 'lucide-react'
import { useAudio } from '../context/AudioContext'
import { mergeCollectionWithLocal } from '../services/contentService'
import { listFiles, deleteFile, getFileUrl } from '../services/storageService'
import { isRemoteContentEnabled } from '../integrations/supabase/client'
import { isSupabaseAuthenticated } from '../services/supabaseAuthService'

function PlaylistSection({ playlist = [] }) {
  const {
    backgroundPlaying,
    currentTrack,
    toggleBackground,
    playLocalTrack,
    stopTrack,
    openExternalLink
  } = useAudio()
  const [localVersion, setLocalVersion] = useState(0)
  const [uploads, setUploads] = useState([])
  const [loadingUploads, setLoadingUploads] = useState(false)
  const canUpload = isRemoteContentEnabled() && isSupabaseAuthenticated()

  const visiblePlaylist = useMemo(() => {
    return mergeCollectionWithLocal(Array.isArray(playlist) ? playlist : [], 'playlist').filter(Boolean)
  }, [playlist, localVersion])

  useEffect(() => {
    const handleContentUpdate = (event) => {
      const collection = event.detail?.collection
      if (collection === 'playlist' || collection === 'all') {
        setLocalVersion((v) => v + 1)
      }
    }
    window.addEventListener('distancia-cero-content-updated', handleContentUpdate)
    return () => window.removeEventListener('distancia-cero-content-updated', handleContentUpdate)
  }, [])

  // Load uploaded audio files
  useEffect(() => {
    if (!canUpload) return
    setLoadingUploads(true)
    listFiles('audio').then(async (files) => {
      const withUrls = await Promise.all(
        files.map(async (f) => ({ ...f, url: await getFileUrl(f.path, 86400) }))
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

  // Build playlist: JSON items + uploaded files
  const uploadedItems = uploads.map((f) => ({
    id: f.path,
    title: f.name.replace(/\.[^.]+$/, ''),
    artist: 'Subido',
    description: new Date(f.createdAt).toLocaleDateString('es-MX'),
    sourceType: 'local',
    src: f.url,
    isUpload: true,
    _path: f.path
  }))

  const mainTrack = visiblePlaylist[0]
  const baseItems = [...visiblePlaylist.slice(1), ...uploadedItems]
  const items = baseItems.length > 0 ? baseItems : [{
    id: 'soon-playlist',
    title: 'Próximamente',
    artist: 'Ale & Yori',
    description: 'Sube canciones o agrega links de Spotify.',
    sourceType: 'placeholder',
    tag: 'Pendiente'
  }]

  const isCurrentTrack = (item) => currentTrack?.id === item.id

  const handleItem = (item) => {
    if (item.sourceType === 'placeholder') return
    if (item.sourceType === 'local') {
      isCurrentTrack(item) ? stopTrack() : playLocalTrack(item)
      return
    }
    openExternalLink(item)
  }

  return (
    <section className="section" id="playlist">
      <SectionTitle
        eyebrow="Playlist"
        title="La banda sonora de nuestro universo"
        text="Sube canciones, usa Wonderwall como ambiente o agrega playlists de Spotify."
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

      <div className="playlist-shell fade-up refined-playlist">
        {mainTrack && (
          <div className={`playlist-cover ${backgroundPlaying ? 'audio-card-playing' : ''}`}>
            <Headphones size={46} />
            {backgroundPlaying && (
              <span className="now-playing-pill">
                <Music size={14} /> Ambiente activo
              </span>
            )}
            <h3>{mainTrack.title}</h3>
            <p>{mainTrack.description}</p>
            <button className="main-button playlist-main-button" onClick={toggleBackground}>
              {backgroundPlaying ? <Pause size={18} /> : <Play size={18} />}
              {backgroundPlaying ? 'Pausar ambiente' : 'Reproducir ambiente'}
            </button>
          </div>
        )}

        <div className="playlist-list">
          {items.map((item) => (
            <div key={item.id} className="playlist-row-wrapper">
              <button
                className={`playlist-row playlist-button-row ${item.sourceType === 'placeholder' ? 'coming-soon-card playlist-soon-card' : ''} ${isCurrentTrack(item) ? 'audio-row-playing' : ''}`}
                onClick={() => handleItem(item)}
                type="button"
                disabled={item.sourceType === 'placeholder'}
              >
                {item.sourceType === 'placeholder' ? (
                  <Sparkles size={20} />
                ) : item.sourceType === 'local' ? (
                  isCurrentTrack(item) ? <Square size={20} /> : <Music size={20} />
                ) : (
                  <ExternalLink size={20} />
                )}
                <div>
                  <span>{item.tag || (item.isUpload ? 'Subido' : '')}</span>
                  <h4>{item.title}</h4>
                  <p>{isCurrentTrack(item) ? 'Sonando ahora.' : item.description}</p>
                </div>
              </button>
              {item.isUpload && (
                <button className="playlist-delete-btn" onClick={() => handleDelete(item._path)}
                  title="Eliminar canción" aria-label="Eliminar canción">
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default PlaylistSection

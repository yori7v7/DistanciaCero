import { useEffect, useMemo, useState } from 'react'
import SectionTitle from './SectionTitle'
import FileUploader from './FileUploader'
import { ExternalLink, Headphones, Music, Pause, Play, Sparkles, Square, Trash2, Loader } from 'lucide-react'
import { useAudio } from '../context/AudioContext'
import { mergeCollectionWithLocal } from '../services/contentService'
import { listFiles, deleteFile, getFileUrl } from '../services/storageService'
import { isRemoteContentEnabled } from '../integrations/supabase/client'
import { isSupabaseAuthenticated } from '../services/supabaseAuthService'
import type { PlaylistContent } from '../types/sections'
import { resolveAudioSource } from '../utils/audioSource'
import { resolveExternalUrl } from '../utils/externalUrl'

function hasPlaylistSource(item: PlaylistContent): boolean {
  if (item.sourceType === 'placeholder') return false
  return item.sourceType === 'local' ? Boolean(resolveAudioSource(item.src)) : Boolean(resolveExternalUrl(item.link))
}

function PlaylistSection({ playlist = [] }: { playlist?: PlaylistContent[] }) {
  const {
    backgroundPlaying,
    backgroundTrackPath,
    currentTrack,
    pendingTrack,
    infoMessage,
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

  const baseItems = [...visiblePlaylist, ...uploadedItems]
  const items = baseItems.length > 0 ? baseItems : [{
    id: 'soon-playlist',
    title: 'Próximamente',
    artist: 'Artista',
    description: 'Añade canciones o enlaces desde el Centro del Universo.',
    sourceType: 'placeholder',
    tag: 'Pendiente'
  }]

  const isCurrentTrack = (item) => currentTrack?.id === item.id
  const isPendingTrack = (item) => pendingTrack?.id === item.id

  const handleItem = (item) => {
    if (isCurrentTrack(item) || isPendingTrack(item)) {
      stopTrack()
      return
    }
    if (!hasPlaylistSource(item)) return
    if (item.sourceType === 'local') {
      playLocalTrack(item)
      return
    }
    openExternalLink(item)
  }

  return (
    <section className="section" id="playlist">
      <SectionTitle
        eyebrow="Playlist"
        title="La banda sonora de nuestro universo"
        text="Sube canciones, usa el audio de ambiente o agrega playlists de Spotify."
      />

      {infoMessage && <p role="status" className="text-sm text-center mb-4">{infoMessage}</p>}

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
        <div className={`playlist-cover ${backgroundPlaying ? 'audio-card-playing' : ''}`}>
          <Headphones size={46} />
          {backgroundPlaying && (
            <span className="now-playing-pill">
              <Music size={14} /> Ambiente activo
            </span>
          )}
          <h3>Audio de ambiente</h3>
          <p>{backgroundTrackPath ? 'Una canción de fondo para acompañar este universo.' : 'Añade una canción de fondo para activar el ambiente.'}</p>
          <button className="main-button playlist-main-button" type="button" disabled={!backgroundTrackPath} onClick={toggleBackground}>
            {backgroundPlaying ? <Pause size={18} /> : <Play size={18} />}
            {backgroundPlaying ? 'Pausar ambiente' : 'Reproducir ambiente'}
          </button>
        </div>

        <div className="playlist-list">
          {items.map((item) => {
            const active = isCurrentTrack(item) || isPendingTrack(item)
            const available = active || hasPlaylistSource(item)
            const missingMessage = item.sourceType === 'placeholder' ? item.description
              : item.sourceType === 'local' ? 'Audio pendiente. Añade el audio desde el Centro del Universo.'
                : 'Enlace pendiente. Añade un enlace válido desde el Centro del Universo.'
            const message = isPendingTrack(item) ? 'Cargando canción. Toca para cancelar.'
              : isCurrentTrack(item) ? 'Sonando ahora.'
                : !available ? missingMessage : item.description
            return (
              <div key={item.id} className="playlist-row-wrapper">
                <button
                  className={`playlist-row playlist-button-row ${item.sourceType === 'placeholder' ? 'coming-soon-card playlist-soon-card' : ''} ${isCurrentTrack(item) ? 'audio-row-playing' : ''}`}
                  onClick={() => handleItem(item)}
                  type="button"
                  disabled={!available}
                >
                  {active ? (
                    <Square size={20} />
                  ) : item.sourceType === 'placeholder' ? (
                    <Sparkles size={20} />
                  ) : item.sourceType === 'local' ? (
                    isCurrentTrack(item) || isPendingTrack(item) ? <Square size={20} /> : <Music size={20} />
                  ) : (
                    <ExternalLink size={20} />
                  )}
                  <div>
                    <span>{item.tag || (item.isUpload ? 'Subido' : '')}</span>
                    <h4>{item.title}</h4>
                    <p>{item.description}</p>
                    {message && message !== item.description && <p>{message}</p>}
                  </div>
                </button>
                {item.isUpload && (
                  <button className="playlist-delete-btn" onClick={() => handleDelete(item._path)}
                    title="Eliminar canción" aria-label="Eliminar canción">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default PlaylistSection

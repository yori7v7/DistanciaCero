import SectionTitle from './SectionTitle'
import { ExternalLink, Headphones, Music, Pause, Play, Sparkles, Square } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useAudio } from '../context/AudioContext'
import { mergeWithLocalItems } from '../utils/localContentStore'

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

  const visiblePlaylist = useMemo(() => {
    return mergeWithLocalItems(Array.isArray(playlist) ? playlist : [], 'playlist').filter(Boolean)
  }, [playlist, localVersion])

  useEffect(() => {
    const handleContentUpdate = (event) => {
      const collection = event.detail?.collection
      if (collection === 'playlist' || collection === 'all') {
        setLocalVersion((version) => version + 1)
      }
    }

    window.addEventListener('distancia-cero-content-updated', handleContentUpdate)
    return () => window.removeEventListener('distancia-cero-content-updated', handleContentUpdate)
  }, [])

  const mainTrack = visiblePlaylist[0]
  const items = [
    ...visiblePlaylist.slice(1),
    {
      id: 'soon-playlist',
      title: 'Proximamente',
      artist: 'Ale & Yori',
      description: 'Aqui podra aparecer otra playlist, una fusion o una cancion especial del universo.',
      sourceType: 'placeholder',
      tag: 'Pendiente'
    }
  ]

  const isCurrentTrack = (item) => currentTrack?.id === item.id

  const handleItem = (item) => {
    if (item.sourceType === 'placeholder') return

    if (item.sourceType === 'local') {
      if (isCurrentTrack(item)) {
        stopTrack()
      } else {
        playLocalTrack(item)
      }

      return
    }

    openExternalLink(item)
  }

  return (
    <section className="section" id="playlist">
      <SectionTitle
        eyebrow="Playlist"
        title="La banda sonora de nuestro universo"
        text="Wonderwall abre este espacio. Despues vienen canciones nuestras, una cancion hecha con IA y playlists que viven en Spotify."
      />

      <div className="playlist-shell fade-up refined-playlist">
        {mainTrack && (
          <div className={`playlist-cover ${backgroundPlaying ? 'audio-card-playing' : ''}`}>
            <Headphones size={46} />

            {backgroundPlaying && (
              <span className="now-playing-pill">
                <Music size={14} />
                Ambiente activo
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
            <button
              className={`playlist-row playlist-button-row ${item.sourceType === 'placeholder' ? 'coming-soon-card playlist-soon-card' : ''} ${isCurrentTrack(item) ? 'audio-row-playing' : ''}`}
              onClick={() => handleItem(item)}
              key={item.id}
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
                <span>{item.tag}</span>
                <h4>{item.title}</h4>
                <p>{isCurrentTrack(item) ? 'Sonando ahora.' : item.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

export default PlaylistSection

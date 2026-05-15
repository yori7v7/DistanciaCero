import { Music, Pause, Play, Square, Volume2 } from 'lucide-react'
import { useAudio } from '../context/AudioContext'

function MusicDock() {
  const {
    backgroundPlaying,
    currentTrack,
    infoMessage,
    backgroundVolume,
    setBackgroundVolume,
    toggleBackground,
    stopTrack,
  } = useAudio()

  return (
    <aside className={`floating-music-dock ${backgroundPlaying || currentTrack ? 'music-dock-playing' : ''}`}>
      <div className="music-dock-top">
        <div className="music-dock-title">
          <Music size={18} />
          <div>
            <h4>Audio del universo</h4>
            <p>{currentTrack ? `Sonando: ${currentTrack.title}` : backgroundPlaying ? 'Tema principal sonando' : 'Tema principal'}</p>
          </div>
        </div>
      </div>

      <div className="music-button-group">
        <button className="dock-button" onClick={toggleBackground}>
          {backgroundPlaying ? <Pause size={16} /> : <Play size={16} />}
          {backgroundPlaying ? 'Pausar tema' : 'Tema principal'}
        </button>

        <button className="dock-button secondary" onClick={stopTrack}>
          <Square size={16} />
          Detener
        </button>
      </div>

      <label className="dock-volume">
        <span>
          <Volume2 size={16} />
          Volumen
        </span>

        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={backgroundVolume}
          onChange={(event) => setBackgroundVolume(Number(event.target.value))}
        />
      </label>

      <p className="dock-status">
        {infoMessage}
      </p>
    </aside>
  )
}

export default MusicDock
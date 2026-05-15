import SectionTitle from "./SectionTitle";
import { Music, Play, Square, ExternalLink } from "lucide-react";
import { useAudio } from "../context/AudioContext";

function SongsSection({ songs }) {
  const { currentTrack, playLocalTrack, stopTrack, openExternalLink } =
    useAudio();

  const isCurrentTrack = (song) => currentTrack?.id === song.id;

  return (
    <section className="section" id="canciones">
      <SectionTitle
        eyebrow="Canciones"
        title="Música para cuando las palabras no alcanzan"
        text="Aquí puedes mezclar canciones locales, mp3, mp4 con audio y también links externos como Spotify o YouTube."
      />

      <div className="card-grid">
        {songs.map((song) => (
          <article className="song-card fade-up" key={song.id}>
            <div className="song-icon">
              <Music size={24} />
            </div>

            <h3>{song.title}</h3>
            <span>{song.artist}</span>
            <p>{song.dedication}</p>

            <div className="song-meta">
              <strong>Tipo:</strong>{" "}
              {song.sourceType === "local" ? "Archivo local" : "Link externo"}
            </div>

            {song.sourceType === "local" ? (
              <>
                <div className="song-actions">
                  <button
                    className="ghost-button"
                    onClick={() =>
                      isCurrentTrack(song) ? stopTrack() : playLocalTrack(song)
                    }
                  >
                    {isCurrentTrack(song) ? (
                      <Square size={16} />
                    ) : (
                      <Play size={16} />
                    )}
                    {isCurrentTrack(song) ? "Detener" : "Reproducir"}
                  </button>
                </div>

                <small className="song-note">
                  Ruta esperada: <code>{song.src}</code>
                </small>
              </>
            ) : (
              <div className="song-actions">
                <button
                  className="ghost-button"
                  onClick={() => openExternalLink(song)}
                >
                  <ExternalLink size={16} />
                  Abrir link
                </button>
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

export default SongsSection;

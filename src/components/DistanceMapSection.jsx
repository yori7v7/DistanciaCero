import SectionTitle from './SectionTitle'
import { ExternalLink, Heart, MapPin, Navigation } from 'lucide-react'

const location1 = '#'
const location2 = '#'

function DistanceMapSection() {
  return (
    <section className="section" id="distancia">
      <SectionTitle
        eyebrow="Distancia cero"
        title="Aunque el mapa diga lejos, nosotros decimos cerca"
        text="Dos puntos distintos del mapa, un mismo universo para encontrarnos."
      />

      <article className="distance-card fade-up distance-card-final">
        <a className="map-point point-left portrait-point" href={location1} target="_blank" rel="noreferrer">
          <div className="portrait-placeholder">
            <span>1</span>
          </div>
          <MapPin size={22} />
          <strong>Ubicación 1</strong>
        </a>

        <div className="map-line">
          <Heart size={28} />
        </div>

        <a className="map-point point-right portrait-point" href={location2} target="_blank" rel="noreferrer">
          <div className="portrait-placeholder">
            <span>2</span>
          </div>
          <MapPin size={22} />
          <strong>Ubicación 2</strong>
        </a>

        <div className="distance-message distance-message-final">
          <Navigation size={24} />
          <h3>Kilómetros de distancia</h3>

          <div className="km-counter">
            <span className="km-number">---</span>
            <span className="km-label">km aprox. por carretera</span>
          </div>

          <p>
            Según la ruta mostrada en Maps, entre ustedes hay una distancia que se mide en kilómetros.
            El mapa marca distancia, sí, pero esta página existe justo para que todo se sienta mucho más cerca.
          </p>

          <div className="distance-links">
            <a href={location1} target="_blank" rel="noreferrer">
              <ExternalLink size={16} />
              Ver punto 1
            </a>

            <a href={location2} target="_blank" rel="noreferrer">
              <ExternalLink size={16} />
              Ver punto 2
            </a>
          </div>
        </div>
      </article>
    </section>
  )
}

export default DistanceMapSection
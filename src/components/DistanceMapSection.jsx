import SectionTitle from './SectionTitle'
import { ExternalLink, Heart, MapPin, Navigation } from 'lucide-react'

const yoriLocation = 'https://www.google.com/maps/place/24+de+Febrero+5,+San+Antonio,+43845+Acayuca,+Hgo./@20.0316945,-98.809878,19z/data=!4m16!1m9!3m8!1s0x85d1a193c6c0b351:0x8fc6719f7f078f96!2s24+de+Febrero+5,+San+Antonio,+43845+Acayuca,+Hgo.!3b1!8m2!3d20.0316049!4d-98.8098295!10e5!16s%2Fg%2F11mspd55ym!3m5!1s0x85d1a193c6c0b351:0x8fc6719f7f078f96!8m2!3d20.0316049!4d-98.8098295!16s%2Fg%2F11mspd55ym?entry=ttu'
const aleLocation = 'https://www.google.com/maps/place/Polanco,+Polanco+IV+Secc,+11550+Ciudad+de+M%C3%A9xico,+CDMX/@19.4321962,-99.1939246,16z/data=!4m6!3m5!1s0x85d20201bdd79491:0xc81b498b8d33929!8m2!3d19.4318149!4d-99.1940586!16s%2Fg%2F11b8th4xxg!18m1!1e1?entry=ttu'

function DistanceMapSection() {
  return (
    <section className="section" id="distancia">
      <SectionTitle
        eyebrow="Distancia cero"
        title="Aunque el mapa diga lejos, nosotros decimos cerca"
        text="Dos puntos distintos del mapa, un mismo universo para encontrarnos."
      />

      <article className="distance-card fade-up distance-card-final">
        <a className="map-point point-left portrait-point" href={yoriLocation} target="_blank" rel="noreferrer">
          <div className="portrait-placeholder">
            <span>Y</span>
          </div>
          <MapPin size={22} />
          <strong>Yori</strong>
        </a>

        <div className="map-line">
          <Heart size={28} />
        </div>

        <a className="map-point point-right portrait-point" href={aleLocation} target="_blank" rel="noreferrer">
          <div className="portrait-placeholder">
            <span>A</span>
          </div>
          <MapPin size={22} />
          <strong>Ale</strong>
        </a>

        <div className="distance-message distance-message-final">
          <Navigation size={24} />
          <h3>Kilómetros de distancia</h3>

          <div className="km-counter">
            <span className="km-number">90.3</span>
            <span className="km-label">km aprox. por carretera</span>
          </div>

          <p>
            Según la ruta mostrada en Maps, entre ustedes hay aproximadamente noventa punto tres kilómetros.
            El mapa marca distancia, sí, pero esta página existe justo para que todo se sienta mucho más cerca.
          </p>

          <div className="distance-links">
            <a href={yoriLocation} target="_blank" rel="noreferrer">
              <ExternalLink size={16} />
              Ver punto de Yori
            </a>

            <a href={aleLocation} target="_blank" rel="noreferrer">
              <ExternalLink size={16} />
              Ver punto de Ale
            </a>
          </div>
        </div>
      </article>
    </section>
  )
}

export default DistanceMapSection
import SectionTitle from './SectionTitle'
import { ExternalLink, Heart, MapPin, Navigation } from 'lucide-react'
import siteConfig from '../data/siteConfig.json'
import { resolveExternalUrl } from '../utils/externalUrl'

interface DistanceMapConfig {
  point1: { label: string; link: string }
  point2: { label: string; link: string }
  kilometers: number | null
}

function DistanceMapSection({ config = siteConfig.distanceMap }: { config?: DistanceMapConfig }) {
  const points = [config.point1, config.point2].map(point => ({ ...point, link: resolveExternalUrl(point.link) }))
  const hasDistance = typeof config.kilometers === 'number' && Number.isFinite(config.kilometers) && config.kilometers >= 0
  const renderPoint = (index: number) => {
    const point = points[index]
    const content = <><div className="portrait-placeholder"><span>{index + 1}</span></div><MapPin size={22} aria-hidden="true" /><strong>{point.label}</strong></>
    const className = `map-point point-${index === 0 ? 'left' : 'right'} portrait-point`
    return point.link
      ? <a className={className} href={point.link} target="_blank" rel="noreferrer">{content}</a>
      : <div className={className}>{content}</div>
  }
  return (
    <section className="section" id="distancia">
      <SectionTitle
        eyebrow="Distancia cero"
        title="Aunque el mapa diga lejos, nosotros decimos cerca"
        text="Dos puntos distintos del mapa, un mismo universo para encontrarnos."
      />

      <article className="distance-card fade-up distance-card-final">
        {renderPoint(0)}

        <div className="map-line">
          <Heart size={28} />
        </div>

        {renderPoint(1)}

        <div className="distance-message distance-message-final">
          <Navigation size={24} />
          <h3>Kilómetros de distancia</h3>

          <div className="km-counter">
            <span className="km-number">{hasDistance ? config.kilometers.toLocaleString('es-MX') : '---'}</span>
            <span className="km-label">{hasDistance ? 'km configurados' : 'Distancia pendiente'}</span>
          </div>

          <p>
            {hasDistance ? 'Esta distancia se indicó al configurar la página; no se calcula automáticamente.' : 'Añade sus ubicaciones y una distancia para personalizar este rincón del universo.'}
          </p>
          {points.some(point => !point.link) && <p className="text-xs">Ubicaciones pendientes de configurar.</p>}

          <div className="distance-links">
            {points.map((point, index) => point.link && <a key={index} href={point.link} target="_blank" rel="noreferrer"><ExternalLink size={16} aria-hidden="true" />Ver punto {index + 1}</a>)}
          </div>
        </div>
      </article>
    </section>
  )
}

export default DistanceMapSection

import { useState } from 'react'
import SectionTitle from './SectionTitle'
import { ArrowLeft, Sparkles } from 'lucide-react'

function UniverseSection({ universe }) {
  const [activeWorld, setActiveWorld] = useState(null)

  const planets = universe.planets || []
  const center = universe.center

  const openCenter = () => {
    setActiveWorld({
      ...center,
      isCenter: true,
      colorA: '#ff7ac8',
      colorB: '#ff1744',
      hasRing: false
    })
  }

  return (
    <section className="section" id="universo">
      <SectionTitle
        eyebrow="Universo Ale & Yori"
        title="Nuestro sistema solar romántico"
        text="Cada planeta representa algo que gira alrededor de nuestra relación. El centro no es decoración: es nosotros."
      />

      <div className={`interactive-universe fade-up ${activeWorld ? 'has-active-planet' : ''}`}>
        <div className="solar-system">
          <button className="system-core system-core-button" onClick={openCenter}>
            <Sparkles size={32} />
            <h3>Ale & Yori</h3>
            <p>El centro de este universo</p>
          </button>

          {planets.map((planet) => (
            <div
              key={planet.id}
              className={`orbit-shell ${
                activeWorld?.id === planet.id ? 'active' : activeWorld ? 'dimmed' : ''
              }`}
              style={{
                '--orbit-size': `${planet.orbit}px`,
                '--orbit-duration': `${planet.duration}s`,
                '--orbit-delay': `${planet.delay || 0}s`,
              }}
            >
              <div className="orbit-path"></div>

              <button
                className="planet-anchor"
                type="button"
                onClick={() => setActiveWorld(planet)}
                aria-label={`Abrir ${planet.name}`}
              >
                <span
                  className={`planet-button ${planet.hasRing ? 'has-ring' : ''}`}
                  style={{
                    '--planet-size': `${planet.size}px`,
                    '--planet-a': planet.colorA,
                    '--planet-b': planet.colorB,
                  }}
                >
                  <span className="planet-surface"></span>
                  {planet.hasRing && <span className="planet-ring"></span>}
                </span>

                <span className="planet-label">{planet.name}</span>
              </button>
            </div>
          ))}
        </div>

        {activeWorld && (
          <div className="planet-modal-backdrop" onClick={() => setActiveWorld(null)}>
            <div className="planet-zoom-card" onClick={(event) => event.stopPropagation()}>
              <div className="planet-zoom-visual">
                <div
                  className={`zoom-planet ${activeWorld.hasRing ? 'has-ring' : ''} ${activeWorld.isCenter ? 'zoom-sun' : ''}`}
                  style={{
                    '--planet-a': activeWorld.colorA,
                    '--planet-b': activeWorld.colorB,
                  }}
                >
                  <span className="planet-surface"></span>
                  {activeWorld.hasRing && <span className="planet-ring"></span>}
                </div>
              </div>

              <div className="zoom-panel">
                <span className="zoom-eyebrow">{activeWorld.type}</span>
                <h3>{activeWorld.name}</h3>
                <p>{activeWorld.description}</p>

                <ul className="planet-detail-list">
                  {activeWorld.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>

                <button className="main-button planet-back-button" onClick={() => setActiveWorld(null)}>
                  <ArrowLeft size={18} />
                  Volver al sistema
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default UniverseSection
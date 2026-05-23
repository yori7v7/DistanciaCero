import { useEffect, useMemo, useRef, useState } from 'react'
import SectionTitle from './SectionTitle'
import { Aperture, Heart, Image as ImageIcon, Orbit, Sparkles, X } from 'lucide-react'

function BlackHoleGallerySection({ items = [] }) {
  const visibleItems = useMemo(() => items.filter(Boolean), [items])
  const [isOpen, setIsOpen] = useState(false)
  const [isEntering, setIsEntering] = useState(false)
  const [activeItem, setActiveItem] = useState(visibleItems[0] || null)
  const portalRef = useRef(null)

  const particles = useMemo(
    () =>
      [
        { x: '8%', y: '16%', size: '4px', delay: '0s' },
        { x: '16%', y: '74%', size: '6px', delay: '0.2s' },
        { x: '22%', y: '26%', size: '3px', delay: '0.4s' },
        { x: '28%', y: '62%', size: '5px', delay: '0.7s' },
        { x: '36%', y: '12%', size: '4px', delay: '0.9s' },
        { x: '43%', y: '83%', size: '3px', delay: '1.2s' },
        { x: '51%', y: '22%', size: '6px', delay: '0.5s' },
        { x: '57%', y: '72%', size: '4px', delay: '1.3s' },
        { x: '63%', y: '10%', size: '5px', delay: '1.5s' },
        { x: '69%', y: '54%', size: '3px', delay: '1.7s' },
        { x: '74%', y: '81%', size: '5px', delay: '1.9s' },
        { x: '79%', y: '18%', size: '4px', delay: '2.1s' },
        { x: '84%', y: '67%', size: '6px', delay: '2.4s' },
        { x: '90%', y: '38%', size: '4px', delay: '2.6s' }
      ],
    []
  )

  useEffect(() => {
    if (!activeItem && visibleItems.length > 0) {
      setActiveItem(visibleItems[0])
    }
  }, [activeItem, visibleItems])

  useEffect(() => {
    if (!isEntering) return

    const timer = setTimeout(() => {
      setIsEntering(false)
      setIsOpen(true)
      setActiveItem((current) => current || visibleItems[0] || null)
    }, 1450)

    return () => clearTimeout(timer)
  }, [isEntering, visibleItems])

  useEffect(() => {
    if (!isOpen || isEntering) return

    const timer = setTimeout(() => {
      portalRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      })
    }, 180)

    return () => clearTimeout(timer)
  }, [isOpen, isEntering])

  const enterBlackHole = () => {
    if (isEntering) return
    setActiveItem(visibleItems[0] || null)
    setIsEntering(true)
  }

  const closeGallery = () => {
    setIsOpen(false)
  }

  return (
    <section className={`section blackhole-section ${isEntering ? 'blackhole-entering' : ''}`} id="galeria-agujero-negro">
      <SectionTitle
        eyebrow="Galería"
        title="Ale, aquí guardo todo lo que quiero volver a vivir contigo"
        text="Quiero que nuestros recuerdos no se sientan guardados en una carpeta cualquiera, sino flotando dentro de algo inmenso, oscuro, bonito y totalmente nuestro."
      />

      <div className={`blackhole-shell fade-up ${isEntering ? 'blackhole-shell-entering' : ''}`}>
        <div className="blackhole-copy">
          <span className="blackhole-kicker">
            <Orbit size={16} />
            Momentos que no quiero soltar
          </span>

          <h3>Si algo me hace pensar en ti, termina orbitando aquí.</h3>

          <p>
            Ale, este lugar lo imaginé como un agujero negro hecho de nosotros: de lo que hemos vivido, de lo que me haces sentir y de todo eso que quisiera repetir contigo mil veces.
          </p>

          <p className="blackhole-copy-soft">
            Cada foto, cada captura, cada recuerdo bonito y cada pedacito de ti puede caer aquí y quedarse girando para siempre dentro de nuestro universo.
          </p>

          <div className="blackhole-actions">
            <button className="main-button blackhole-enter-button" type="button" onClick={enterBlackHole}>
              <Aperture size={18} />
              Entrar al agujero negro
            </button>

            <span className="blackhole-count">
              <Heart size={16} />
              {visibleItems.length} recuerdos orbitando por ti
            </span>
          </div>
        </div>

        <div className="blackhole-stage" aria-label="Agujero negro romántico con recuerdos orbitando">
          <div className="blackhole-stage-bg"></div>

          <div className="star-particles">
            {particles.map((particle, index) => (
              <span
                key={index}
                className="star-particle"
                style={{
                  left: particle.x,
                  top: particle.y,
                  width: particle.size,
                  height: particle.size,
                  animationDelay: particle.delay
                }}
              />
            ))}
          </div>

          <div className="blackhole-energy blackhole-energy-1"></div>
          <div className="blackhole-energy blackhole-energy-2"></div>
          <div className="blackhole-energy blackhole-energy-3"></div>
          <div className="blackhole-light-beam"></div>
          <div className="blackhole-lens"></div>

          <div className="blackhole-spiral">
            <div className="blackhole-spiral-inner"></div>
          </div>

          <div className="blackhole-core">
            <span>Ale</span>
            <strong>&</strong>
            <span>Yori</span>
          </div>

          <div className="blackhole-orbit">
            {visibleItems.slice(0, 8).map((item, index) => (
              <button
                className={`orbit-memory orbit-memory-${index + 1} ${activeItem?.id === item.id ? 'orbit-memory-active' : ''}`}
                key={item.id}
                type="button"
                onClick={() => {
                  setIsOpen(true)
                  setActiveItem(item)
                }}
                aria-label={`Abrir recuerdo ${item.title}`}
              >
                {item.image ? (
                  <img src={item.image} alt={item.alt || item.title} onError={(event) => event.currentTarget.classList.add('image-error')} />
                ) : (
                  <Sparkles size={22} />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isEntering && (
        <div className="blackhole-transition">
          <div className="blackhole-transition-ring blackhole-transition-ring-1"></div>
          <div className="blackhole-transition-ring blackhole-transition-ring-2"></div>
          <div className="blackhole-transition-ring blackhole-transition-ring-3"></div>
          <div className="blackhole-transition-core"></div>
          <div className="blackhole-transition-text">
            <span>Entrando al agujero negro</span>
            <h3>Ale, ven conmigo...</h3>
            <p>Quiero enseñarte todo lo que guardo de nosotros aquí adentro.</p>
          </div>
        </div>
      )}

      {isOpen && (
        <div ref={portalRef} className="blackhole-portal fade-up">
          <div className="portal-header">
            <div>
              <span>Dentro del horizonte de sucesos</span>
              <h3>Ale, estos pedacitos de nosotros se quedaron viviendo en mí.</h3>
            </div>

            <button className="portal-close" type="button" onClick={closeGallery} aria-label="Cerrar galería">
              <X size={18} />
            </button>
          </div>

          <div className="portal-layout">
            <div className="portal-preview">
              {activeItem?.image ? (
                <img src={activeItem.image} alt={activeItem.alt || activeItem.title} />
              ) : (
                <div className="portal-placeholder">
                  <ImageIcon size={42} />
                  <span>Aquí quiero seguir guardando más de ti</span>
                </div>
              )}
            </div>

            <div className="portal-info">
              <span>{activeItem?.date || 'Un recuerdo nuestro'}</span>
              <h3>{activeItem?.title || 'Tú y yo, en algún rincón del universo'}</h3>
              <p>
                {activeItem?.description ||
                  activeItem?.caption ||
                  'Aunque este espacio todavía no tenga foto, igual ya existe dentro de mí. Solo está esperando el siguiente momento bonito contigo, Ale.'}
              </p>
              {activeItem?.tag && <strong>{activeItem.tag}</strong>}
            </div>
          </div>

          <div className="blackhole-gallery-grid">
            {visibleItems.map((item) => (
              <button
                className={`blackhole-photo-card ${activeItem?.id === item.id ? 'blackhole-photo-card-active' : ''}`}
                key={item.id}
                type="button"
                onClick={() => setActiveItem(item)}
              >
                <div className="blackhole-photo-thumb">
                  {item.image ? (
                    <img src={item.image} alt={item.alt || item.title} onError={(event) => event.currentTarget.classList.add('image-error')} />
                  ) : (
                    <ImageIcon size={24} />
                  )}
                </div>

                <div className="blackhole-photo-text">
                  <span>{item.date || item.type || 'Recuerdo'}</span>
                  <h4>{item.title}</h4>
                  <p>{item.description || item.caption}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

export default BlackHoleGallerySection


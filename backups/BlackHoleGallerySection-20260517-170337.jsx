import { useState } from 'react'
import SectionTitle from './SectionTitle'
import { Aperture, Image, Images, Orbit, Sparkles, X } from 'lucide-react'

function BlackHoleGallerySection({ items = [] }) {
  const [isOpen, setIsOpen] = useState(false)
  const [activeItem, setActiveItem] = useState(null)
  const visibleItems = items.filter(Boolean)

  const openGallery = () => {
    setIsOpen(true)
    setActiveItem(visibleItems[0] || null)
  }

  return (
    <section className={`section blackhole-section ${isOpen ? 'blackhole-section-open' : ''}`} id="galeria-agujero-negro">
      <SectionTitle
        eyebrow="Galería"
        title="El agujero negro de nuestros recuerdos"
        text="Un lugar para guardar fotos, capturas, imágenes IA y momentos que merecen repetirse, orbitando dentro del universo de Ale & Yori."
      />

      <div className="blackhole-shell fade-up">
        <div className="blackhole-copy">
          <span className="blackhole-kicker">
            <Orbit size={16} />
            Momentos + scrapbook
          </span>

          <h3>Todo lo que caiga aquí se vuelve parte de nuestro universo.</h3>
          <p>
            Fotos reales, screenshots, edits, tonterías privadas y recuerdos bonitos. La idea es que esta sección crezca contigo y con Ale, sin perder la vibra oscura, romántica y dramática de Distancia Cero.
          </p>

          <div className="blackhole-actions">
            <button className="main-button blackhole-enter-button" type="button" onClick={openGallery}>
              <Aperture size={18} />
              Entrar al agujero negro
            </button>

            <span className="blackhole-count">
              <Images size={16} />
              {visibleItems.length} recuerdos listos
            </span>
          </div>
        </div>

        <div className="blackhole-stage" aria-label="Agujero negro con recuerdos orbitando">
          <div className="blackhole-glow"></div>
          <div className="blackhole-ring blackhole-ring-one"></div>
          <div className="blackhole-ring blackhole-ring-two"></div>

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
                  <Sparkles size={24} />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="blackhole-portal fade-up">
          <div className="portal-header">
            <div>
              <span>Horizonte de sucesos</span>
              <h3>Recuerdos atrapados por gravedad emocional</h3>
            </div>

            <button className="portal-close" type="button" onClick={() => setIsOpen(false)} aria-label="Cerrar galería">
              <X size={18} />
            </button>
          </div>

          <div className="portal-layout">
            <div className="portal-preview">
              {activeItem?.image ? (
                <img src={activeItem.image} alt={activeItem.alt || activeItem.title} />
              ) : (
                <div className="portal-placeholder">
                  <Image size={42} />
                  <span>Imagen pendiente</span>
                </div>
              )}
            </div>

            <div className="portal-info">
              <span>{activeItem?.date || 'Recuerdo sin fecha'}</span>
              <h3>{activeItem?.title || 'Elige un recuerdo'}</h3>
              <p>{activeItem?.description || activeItem?.caption || 'Cuando agregues fotos reales, aquí se verá la historia de cada momento.'}</p>
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
                    <Image size={24} />
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

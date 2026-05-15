import SectionTitle from './SectionTitle'
import { Image } from 'lucide-react'

function GallerySection({ gallery }) {
  return (
    <section className="section" id="galeria">
      <SectionTitle
        eyebrow="Galería"
        title="Recuerdos, imágenes y futuros momentos"
        text="Por ahora dejamos espacios bonitos. Después aquí irán fotos, dibujos o imágenes generadas con IA."
      />

      <div className="gallery-grid">
        {gallery.map((item) => (
          <article className="gallery-card fade-up" key={item.id}>
            <div className="gallery-placeholder">
              <Image size={42} />
            </div>

            <h3>{item.title}</h3>
            <p>{item.description}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

export default GallerySection
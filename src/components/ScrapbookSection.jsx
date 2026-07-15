import SectionTitle from './SectionTitle'
import { Image, Paperclip, Sparkles } from 'lucide-react'

function ScrapbookSection({ items = [] }) {
  const finalItems = [
    {
      id: 1,
      date: 'Recuerdo futuro',
      title: 'Primera polaroid oficial',
      caption: 'Aquí después puede ir una foto, una captura o una imagen IA de ustedes.',
      photoLabel: 'Foto / imagen futura'
    },
    {
      id: 2,
      date: 'Llamada bonita',
      title: 'Captura especial',
      caption: 'Espacio para guardar una screenshot de llamada, chat o video que signifique algo.',
      photoLabel: 'Captura pendiente'
    },
    {
      id: 3,
      date: 'Momento especial',
      title: 'Una tontería muy nuestra',
      caption: 'Ideal para bromas internas, stickers, dibujitos o edits.',
      photoLabel: 'Recuerdo pendiente'
    },
    {
      id: 'soon-polaroid',
      date: 'Pendiente',
      title: 'Próximamente',
      caption: 'Aquí podrá caer otra polaroid, una captura linda o un recuerdo nuevo del universo.',
      photoLabel: 'Nuevo recuerdo',
      isPlaceholder: true
    }
  ]

  return (
    <section className="section" id="scrapbook">
      <SectionTitle
        eyebrow="Scrapbook"
        title="Polaroids y recuerdos"
        text="Aquí irán fotos, capturas, imágenes IA y recuerdos bonitos, pero manteniendo la misma vibra oscura del universo."
      />

      <div className="universe-grid universe-grid-4">
        {finalItems.map((item) => (
          <article
            className={`universe-card universe-polaroid-card fade-up ${item.isPlaceholder ? 'coming-soon-card coming-soon-polaroid' : ''}`}
            key={item.id}
          >
            <div className="polaroid-thumb">
              {item.isPlaceholder ? <Sparkles size={28} /> : <Image size={28} />}
              <span>{item.photoLabel}</span>
            </div>

            <div className="polaroid-meta">
              <span>
                <Paperclip size={14} />
                {item.date}
              </span>
            </div>

            <h3>{item.title}</h3>
            <p>{item.caption}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

export default ScrapbookSection
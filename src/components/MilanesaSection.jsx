import SectionTitle from './SectionTitle'
import { Utensils } from 'lucide-react'

function MilanesaSection() {
  return (
    <section className="section" id="milanesas">
      <SectionTitle
        eyebrow="Broma interna"
        title="El santuario de las milanesas"
        text="Porque el amor también se construye con hambre, risas y comida favorita."
      />

      <article className="milanesa-card fade-up">
        <div className="milanesa-icon">
          <Utensils size={34} />
        </div>

        <h3>Restaurante imaginario Ale & Yori</h3>

        <p>
          Especialidad de la casa: milanesas hechas con amor, cero distancia y cantidades peligrosas de ternura.
        </p>

        <p>
          Aquí algún día podemos poner nuestro top de milanesas, lugares que queremos probar,
          o una lista de Ã¢â‚¬Å“citas pendientes con comida ricaÃ¢â‚¬Â.
        </p>
      </article>
    </section>
  )
}

export default MilanesaSection

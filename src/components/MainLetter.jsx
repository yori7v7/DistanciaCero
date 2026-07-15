import SectionTitle from './SectionTitle'
import { Heart } from 'lucide-react'

function MainLetter() {
  return (
    <section className="section" id="carta">
      <SectionTitle
        eyebrow="Carta principal"
        title="Mi primera carta dentro de este universo"
        text="Esta es la primera parte de algo que no quiero que termine aquí."
      />

      <article className="letter-card fade-up">
        <div className="letter-seal">
          <Heart size={30} />
        </div>

        <h3>Para ti</h3>

        <p>
          Hice este espacio pensando en nosotros y en todas esas veces en las que la distancia se siente pesada,
          pero aun así seguimos aquí, encontrándonos en mensajes, llamadas, canciones, bromas y en esas formas bien nuestras de querernos.
        </p>

        <p>
          No quería hacer solo una carta normal. Quería hacer un lugar. Un lugar donde puedas entrar cuando me extrañes,
          cuando estés triste, cuando quieras recordar algo bonito o cuando simplemente quieras sentir que estoy contigo.
        </p>

        <p>
          Este espacio va a ir creciendo. Hoy empieza con esto, pero después tendrá más cartas, más canciones, más recuerdos,
          más tonterías nuestras y más pedacitos de todo lo que somos.
        </p>

        <p>
          Gracias por ser mi persona bonita, y aunque la distancia se ponga intensa, aquí voy a seguir dejando señales de amor para ti.
        </p>

        <p className="signature">
          Con amor,<br />
          Creador
        </p>
      </article>
    </section>
  )
}

export default MainLetter

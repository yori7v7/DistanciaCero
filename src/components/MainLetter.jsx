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

        <h3>Para mi Alecita</h3>

        <p>
          Ale, hice esta página pensando en ti, en nosotros y en todas esas veces en las que la distancia se siente bien pesada,
          pero aun así seguimos aquí, encontrándonos en mensajes, llamadas, canciones, bromas y en esas formas bien nuestras de querernos.
        </p>

        <p>
          No quería hacerte solo una carta normal. Quería hacerte un lugar. Un lugar donde puedas entrar cuando me extrañes,
          cuando estés triste, cuando quieras recordar algo bonito o cuando simplemente quieras sentir que tu Yori está contigo.
        </p>

        <p>
          Esta página va a ir creciendo. Hoy empieza con esto, pero después tendrá más cartas, más canciones, más recuerdos,
          más tonterías nuestras, más milanesas espirituales y más pedacitos de todo lo que somos.
        </p>

        <p>
          Gracias por ser mi Ale, mi alecita bbcita bblin, mi persona bonita. Yo soy tu Yori, tu dieguito bbcito bblin,
          y aunque la distancia se ponga intensa, aquí voy a seguir dejando señales de amor para ti.
        </p>

        <p className="signature">
          Con amor,<br />
          Yori
        </p>
      </article>
    </section>
  )
}

export default MainLetter

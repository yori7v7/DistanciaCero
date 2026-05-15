import { useState } from 'react'
import SectionTitle from './SectionTitle'
import { KeyRound, Sparkles } from 'lucide-react'
import siteConfig from '../data/siteConfig.json'

function SecretSection() {
  const [password, setPassword] = useState('')
  const [unlocked, setUnlocked] = useState(false)
  const [error, setError] = useState('')

  const checkPassword = () => {
    const cleanPassword = password.trim().toLowerCase()
    const validPasswords = siteConfig.secret.passwords.map((item) => item.toLowerCase())

    if (validPasswords.includes(cleanPassword)) {
      setUnlocked(true)
      setError('')
    } else {
      setUnlocked(false)
      setError(`Mmm casi, Ale. ${siteConfig.secret.hint}`)
    }
  }

  return (
    <section className="section" id="secreto">
      <SectionTitle
        eyebrow="Easter egg"
        title="Una sección secreta para Ale"
        text="Porque toda historia bonita merece un rinconcito escondido."
      />

      <article className="secret-card fade-up">
        {!unlocked ? (
          <>
            <div className="secret-icon">
              <KeyRound size={32} />
            </div>

            <h3>Zona secreta</h3>
            <p>
              Solo Ale puede abrir esta parte. Bueno, Ale y cualquiera que sepa demasiado sobre nuestras milanesas.
            </p>

            <div className="secret-form">
              <input
                type="password"
                placeholder="Escribe la contraseña..."
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') checkPassword()
                }}
              />

              <button onClick={checkPassword}>Desbloquear</button>
            </div>

            {error && <p className="error-text">{error}</p>}
          </>
        ) : (
          <div className="secret-unlocked">
            <Sparkles size={36} />

            <h3>{siteConfig.secret.unlockedTitle}</h3>

            <p>
              Sorpresa, mi Ale. Si llegaste hasta aquí, encontraste un pedacito más escondido de mi corazón.
            </p>

            <p>
              Esta sección va a cambiar con el tiempo. Aquí puedo dejarte cartas secretas, pistas,
              regalitos digitales, promesas, recuerdos privados o mensajitos que solo tú vas a entender.
            </p>

            <p className="signature">
              {siteConfig.secret.unlockedSignature}
            </p>
          </div>
        )}
      </article>
    </section>
  )
}

export default SecretSection
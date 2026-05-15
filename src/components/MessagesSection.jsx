import SectionTitle from './SectionTitle'
import { MessageCircleHeart } from 'lucide-react'

function MessagesSection({ messages }) {
  return (
    <section className="section" id="mensajes">
      <SectionTitle
        eyebrow="Mensajes especiales"
        title="Para abrir cuando lo necesites"
        text="Una parte de mí guardada para tus días bonitos, raros o pesados."
      />

      <div className="message-layout">
        <article className="message-box fade-up">
          <div className="message-title">
            <MessageCircleHeart size={24} />
            <h3>Cuando me extrañes</h3>
          </div>

          {messages.whenYouMissMe.map((message) => (
            <p key={message.id}>{message.text}</p>
          ))}
        </article>

        <article className="message-box fade-up">
          <div className="message-title">
            <MessageCircleHeart size={24} />
            <h3>Cuando estés triste</h3>
          </div>

          {messages.whenYouAreSad.map((message) => (
            <p key={message.id}>{message.text}</p>
          ))}
        </article>
      </div>
    </section>
  )
}

export default MessagesSection

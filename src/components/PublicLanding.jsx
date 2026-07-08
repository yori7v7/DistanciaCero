import { Heart, Sparkles, Stars, ArrowRight } from 'lucide-react'
import siteConfig from '../data/siteConfig.json'

function PublicLanding({ onEnter }) {
  return (
    <div className="public-landing">
      {/* Background */}
      <div className="public-landing__bg">
        <div className="public-landing__orb public-landing__orb--pink" />
        <div className="public-landing__orb public-landing__orb--red" />
        <div className="public-landing__stars" />
      </div>

      {/* Content */}
      <div className="public-landing__content">
        <div className="public-landing__badge">
          <Sparkles size={14} />
          <span>Un universo digital</span>
        </div>

        <h1 className="public-landing__title">
          <span className="public-landing__title-line">Distancia</span>
          <span className="public-landing__title-line public-landing__title-line--accent">Cero</span>
        </h1>

        <div className="public-landing__names">
          <span className="public-landing__name">{siteConfig.couple.yourName}</span>
          <Heart size={24} className="public-landing__heart" />
          <span className="public-landing__name">{siteConfig.couple.herName}</span>
        </div>

        <p className="public-landing__subtitle">
          Un espacio privado donde la distancia no existe. <br />
          Cartas, recuerdos, música y secretos que solo nosotros conocemos.
        </p>

        <button className="public-landing__cta" onClick={onEnter}>
          <span>Entrar al universo</span>
          <ArrowRight size={20} />
        </button>

        <p className="public-landing__hint">
          Solo {siteConfig.couple.herName} y {siteConfig.couple.yourName} tienen acceso.
        </p>
      </div>

      {/* Footer decoration */}
      <div className="public-landing__footer">
        <Stars size={14} />
        <span>Desde {siteConfig.dates.metDate?.split('-')[0] || '2026'}</span>
      </div>
    </div>
  )
}

export default PublicLanding

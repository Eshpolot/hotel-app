import { useLanguage } from '../contexts/LanguageContext';

interface HeroProps {
  onBookClick: () => void;
  onExploreClick: () => void;
}

export default function Hero({ onBookClick, onExploreClick }: HeroProps) {
  const { t } = useLanguage();

  return (
    <section className="hero" id="hero">
      <div className="hero-bg"></div>
      <div className="hero-overlay"></div>
      <div className="hero-pattern"></div>
      <div className="hero-orb hero-orb-1"></div>
      <div className="hero-orb hero-orb-2"></div>
      <div className="hero-content">
        <div className="hero-badge">
          <span className="dot"></span>
          <span>{t('hero_badge')}</span>
        </div>
        <h1 className="hero-title">
          {t('welcome')} <span className="gold">ALAY ART</span>
        </h1>
        <p className="hero-subtitle">{t('slogan')}</p>
        <div className="hero-buttons">
          <button className="btn-gold" onClick={onBookClick}>{t('book')}</button>
          <button className="btn-outline" onClick={onExploreClick}>{t('explore')}</button>
        </div>
      </div>
      <button
        type="button"
        className="hero-scroll"
        onClick={onExploreClick}
        aria-label={t('explore')}
      >
        <svg className="hero-scroll-emblem" viewBox="0 0 112 64" fill="none" aria-hidden="true">
          {/* A restrained tunduk-inspired seal framed by paired horn flourishes. */}
          <g className="hero-scroll-flourish" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M34 32H23c-8 0-12-5-12-10 0-5 7-6 9-2 2 4-2 7-5 5M23 32c-7 0-10 5-10 9 0 5 7 6 9 2 2-4-2-7-5-5M11 32H3" />
            <path d="M78 32h11c8 0 12-5 12-10 0-5-7-6-9-2-2 4 2 7 5 5M89 32c7 0 10 5 10 9 0 5-7 6-9 2-2-4 2-7 5-5M101 32h8" />
          </g>
          <g className="hero-scroll-seal" stroke="currentColor" strokeWidth="1.25">
            <circle cx="56" cy="32" r="21" />
            <circle cx="56" cy="32" r="17.5" opacity=".45" />
            <path d="M43 19c16 3 23 10 26 26M41 22c15 2.5 22.5 10 25 25M39 25c14 2 22 10 24 24M69 19C53 22 46 29 43 45M71 22C56 24.5 48.5 32 46 47M73 25C59 27 51 35 49 49" />
          </g>
          <path d="m56 3 2 3-2 3-2-3Z" fill="currentColor" />
        </svg>
        <span className="hero-scroll-trail" aria-hidden="true">
          <svg viewBox="0 0 14 8" fill="none"><path d="m1 1 6 5 6-5" /></svg>
        </span>
      </button>
    </section>
  );
}

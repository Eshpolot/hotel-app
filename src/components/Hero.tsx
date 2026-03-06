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
        <h2 className="hero-title">
          {t('welcome')} <span className="gold">ALAY ART</span>
        </h2>
        <p className="hero-subtitle">{t('slogan')}</p>
        <div className="hero-buttons">
          <button className="btn-gold" onClick={onBookClick}>{t('book')}</button>
          <button className="btn-outline" onClick={onExploreClick}>{t('explore')}</button>
        </div>
      </div>
      <div className="hero-scroll">
        <div className="hero-scroll-inner">
          <div className="hero-scroll-dot"></div>
        </div>
      </div>
    </section>
  );
}

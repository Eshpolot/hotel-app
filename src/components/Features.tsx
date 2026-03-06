import { useEffect, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const features = [
  {
    img: 'https://lh3.googleusercontent.com/d/1dYEs4DzH67x0cEeAclXhF8P8FPbIWXaz',
    titleKey: 'breakfast', textKey: 'breakfast_text',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 8h1a4 4 0 010 8h-1"/><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/>
        <line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/>
      </svg>
    )
  },
  {
    img: 'https://lh3.googleusercontent.com/d/1g55aq5FEets7sv9aotVzJWp43OnfeBEp',
    titleKey: 'wifi', textKey: 'wifi_text',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M5 12.55a11 11 0 0114.08 0"/><path d="M1.42 9a16 16 0 0121.16 0"/>
        <path d="M8.53 16.11a6 6 0 016.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/>
      </svg>
    )
  },
  {
    img: 'https://lh3.googleusercontent.com/d/1iYXmMtHFaf6gI87n932UnBZaCym_Nwy2',
    titleKey: 'comfort', textKey: 'comfort_text',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
        <polyline points="9,22 9,12 15,12 15,22"/>
      </svg>
    )
  },
  {
    img: 'https://lh3.googleusercontent.com/d/13Xnkpvj4j6wzSM1dUTDt-Hif_FmUM5Mb',
    titleKey: 'national_cuisine', textKey: 'national_cuisine_text',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
      </svg>
    )
  },
];

export default function Features() {
  const { t } = useLanguage();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); } }),
      { threshold: 0.1 }
    );
    ref.current?.querySelectorAll('.anim').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section className="features-section section-pad" id="features" ref={ref}>
      <div className="section-header anim">
        <div className="section-label"><span className="line"></span><span>{t('features_label')}</span><span className="line"></span></div>
        <h2 className="section-title">{t('features_title')}</h2>
        <p className="section-desc">{t('features_desc')}</p>
      </div>
      <div className="features-grid">
        {features.map((f, i) => (
          <div className="feature-card anim" key={i} style={{ transitionDelay: `${i * 0.1}s` }}>
            <div className="feature-img"><img src={f.img} alt={t(f.titleKey)} loading="lazy" /></div>
            <div className="feature-body">
              <div className="feature-icon">{f.icon}</div>
              <h3>{t(f.titleKey)}</h3>
              <p>{t(f.textKey)}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

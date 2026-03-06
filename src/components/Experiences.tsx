import { useEffect, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const experiences = [
  { img: 'https://lh3.googleusercontent.com/d/1kvIxu6MY2nkacUNzPOX2ZKdxt7jhimen', titleKey: 'summer_kitchen', textKey: 'summer_kitchen_text' },
  { img: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?w=800&q=80', titleKey: 'conference', textKey: 'conference_text' },
  { img: 'https://lh3.googleusercontent.com/d/1wjwhqcqPHmMk_aFs3lj91c3zD7_ghJtc', titleKey: 'rest_zone', textKey: 'rest_zone_text' },
];

export default function Experiences() {
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
    <section className="exp-section section-pad" id="experiences" ref={ref}>
      <div className="section-header anim">
        <div className="section-label"><span className="line"></span><span>{t('exp_label')}</span><span className="line"></span></div>
        <h2 className="section-title">{t('exp_title')}</h2>
        <p className="section-desc">{t('exp_desc')}</p>
      </div>
      <div className="exp-grid">
        {experiences.map((e, i) => (
          <div className="exp-card anim" key={i} style={{ transitionDelay: `${i * 0.1}s` }}>
            <img src={e.img} alt={t(e.titleKey)} loading="lazy" />
            <div className="exp-card-overlay">
              <h3>{t(e.titleKey)}</h3>
              <p>{t(e.textKey)}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

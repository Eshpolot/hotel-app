import { useEffect, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export default function CTA() {
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
    <section className="cta-section" id="cta" ref={ref}>
      <div className="cta-bg"></div>
      <div className="cta-content anim">
        <h2>{t('cta_title')}</h2>
        <p>{t('cta_desc')}</p>
        <div className="cta-buttons">
          <a href="tel:+996550323070" className="btn-gold">{t('call_us')}</a>
          <button className="btn-outline" onClick={() => document.getElementById('rooms')?.scrollIntoView({ behavior: 'smooth' })}>
            {t('book')}
          </button>
        </div>
      </div>
    </section>
  );
}

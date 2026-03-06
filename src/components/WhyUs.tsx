import { useEffect, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const cards = [
  { titleKey: 'why_location', textKey: 'why_location_text', icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>) },
  { titleKey: 'why_service', textKey: 'why_service_text', icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>) },
  { titleKey: 'why_safety', textKey: 'why_safety_text', icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>) },
  { titleKey: 'why_ethno', textKey: 'why_ethno_text', icon: (<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>) },
];

export default function WhyUs() {
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
    <section className="why-section section-pad" id="why" ref={ref}>
      <div className="section-header anim">
        <div className="section-label"><span className="line"></span><span style={{ color: 'var(--gold-light)' }}>{t('why_label')}</span><span className="line"></span></div>
        <h2 className="section-title" style={{ color: 'white' }}>{t('why_title')}</h2>
        <p className="section-desc" style={{ color: 'rgba(255,255,255,0.6)' }}>{t('why_desc')}</p>
      </div>
      <div className="why-grid">
        {cards.map((c, i) => (
          <div className="why-card anim" key={i} style={{ transitionDelay: `${i * 0.1}s` }}>
            <div className="why-icon">{c.icon}</div>
            <h3>{t(c.titleKey)}</h3>
            <p>{t(c.textKey)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

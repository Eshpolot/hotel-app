import { useEffect, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const StarIcon = () => (
  <svg viewBox="0 0 24 24">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

const reviews = [
  { textKey: 'review1', avatar: 'А', author: 'Айбек К.', fromKey: 'review1_from' },
  { textKey: 'review2', avatar: 'S', author: 'Sarah M.', fromKey: 'review2_from' },
  { textKey: 'review3', avatar: 'Н', author: 'Нуржан Т.', fromKey: 'review3_from' },
];

const reviewTexts: Record<string, Record<string, string>> = {
  ru: {
    review1: '"Потрясающий отель! Этно-стиль номеров впечатлил. Завтрак — лучший, что мы пробовали. Обязательно вернёмся!"',
    review2: '"Amazing experience! The Kyrgyz ethnic design is unique. Staff is incredibly friendly and helpful. Highly recommended!"',
    review3: '"Баардыгы абдан жакшы! Тамак-аш керемет, кызмат мыкты. Бул мейманкана Оштун сыймыгы!"',
    review1_from: 'Бишкек, Кыргызстан', review2_from: 'London, UK', review3_from: 'Ош, Кыргызстан',
  },
  en: {
    review1: '"Amazing hotel! The ethno-style rooms impressed us. Breakfast is the best we have ever tried. We will definitely come back!"',
    review2: '"Amazing experience! The Kyrgyz ethnic design is unique. Staff is incredibly friendly and helpful. Highly recommended!"',
    review3: '"Everything was excellent! The food is amazing, the service is great. This hotel is the pride of Osh!"',
    review1_from: 'Bishkek, Kyrgyzstan', review2_from: 'London, UK', review3_from: 'Osh, Kyrgyzstan',
  },
  kg: {
    review1: '"Укмуш мейманкана! Этно-стиль таасир калтырды. Эртең мененки тамак — эң мыктысы!"',
    review2: '"Amazing experience! The Kyrgyz ethnic design is unique. Highly recommended!"',
    review3: '"Баардыгы абдан жакшы! Тамак-аш керемет, кызмат мыкты. Бул мейманкана Оштун сыймыгы!"',
    review1_from: 'Бишкек, Кыргызстан', review2_from: 'Лондон, Англия', review3_from: 'Ош, Кыргызстан',
  }
};

export default function Testimonials() {
  const { t, lang } = useLanguage();
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
    <section className="testimonials-section section-pad" id="testimonials" ref={ref}>
      <div className="section-header anim">
        <div className="section-label"><span className="line"></span><span>{t('reviews_label')}</span><span className="line"></span></div>
        <h2 className="section-title">{t('reviews_title')}</h2>
      </div>
      <div className="testimonials-grid">
        {reviews.map((r, i) => (
          <div className="testimonial-card anim" key={i} style={{ transitionDelay: `${i * 0.1}s` }}>
            <div className="testimonial-stars">
              {[...Array(5)].map((_, j) => <StarIcon key={j} />)}
            </div>
            <blockquote>{reviewTexts[lang]?.[r.textKey] ?? reviewTexts.ru[r.textKey]}</blockquote>
            <div className="testimonial-author">
              <div className="testimonial-avatar">{r.avatar}</div>
              <div className="testimonial-info">
                <strong>{r.author}</strong>
                <span>{reviewTexts[lang]?.[r.fromKey] ?? reviewTexts.ru[r.fromKey]}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

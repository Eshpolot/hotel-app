import { useLanguage } from '../contexts/LanguageContext';

interface FooterProps {
  onNavClick: (id: string) => void;
}

export default function Footer({ onNavClick }: FooterProps) {
  const { t } = useLanguage();

  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <div className="logo" onClick={() => onNavClick('hero')} style={{ cursor: 'pointer' }}>
            <div className="logo-icon">
              <img src="https://lh3.googleusercontent.com/d/10Zt_FsN9C5SM8C6Xg1EGJ_cBPa7xAAus" alt="ALAY ART Logo" />
            </div>
            <div className="logo-text">
              <h1>ALAY ART</h1>
              <span>Boutique Hotel • Osh</span>
            </div>
          </div>
          <p>{t('footer_about')}</p>
          <div className="footer-social">
            <a href="https://www.instagram.com/alayart.hotel.osh" target="_blank" rel="noreferrer" aria-label="Instagram">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
            </a>
            <a href="https://wa.me/996550323070" target="_blank" rel="noreferrer" aria-label="WhatsApp">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg>
            </a>
          </div>
        </div>
        <div className="footer-col">
          <h4>{t('footer_nav')}</h4>
          <ul>
            <li><a onClick={() => onNavClick('hero')}>{t('home')}</a></li>
            <li><a onClick={() => onNavClick('rooms')}>{t('rooms')}</a></li>
            <li><a onClick={() => onNavClick('experiences')}>{t('conference')}</a></li>
            <li><a onClick={() => onNavClick('contact')}>{t('contacts')}</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>{t('footer_services')}</h4>
          <ul>
            <li><a onClick={() => onNavClick('experiences')}>{t('summer_kitchen')}</a></li>
            <li><a onClick={() => onNavClick('experiences')}>{t('rest_zone')}</a></li>
            <li><a onClick={() => onNavClick('experiences')}>{t('conference')}</a></li>
            <li><a onClick={() => onNavClick('features')}>{t('national_cuisine')}</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>{t('footer_contact')}</h4>
          <ul>
            <li><a href="tel:+996550323070">+996 550 323 070</a></li>
            <li><a href="mailto:info@alayart.kg">info@alayart.kg</a></li>
            <li>
              <a href="https://maps.apple.com/place?map=explore&address=Osh%2C+5+%D1%83%D0%BB%D0%B8%D1%86%D0%B0%2C+Kyrgyzstan&coordinate=40.497668%2C72.818444&name=Alay-Art+Hotel" target="_blank" rel="noreferrer">
                г. Ош, 5 улица
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p>{t('footer')}</p>
      </div>
    </footer>
  );
}

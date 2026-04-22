import { useEffect } from 'react';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';

export default function ContactsPage() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      {/* Hero */}
      <div className="page-hero contacts-hero">
        <div className="page-hero-overlay"></div>
        <div className="page-hero-content">
          <p className="page-hero-label">ALAY ART HOTEL</p>
          <h1 className="page-hero-title">Контакты</h1>
          <p className="page-hero-sub">
            Мы всегда рады помочь вам<br />
            спланировать идеальный отдых
          </p>
        </div>
      </div>

      {/* Контент */}
      <section className="contacts-section section-pad">
        <div className="contacts-grid">

          {/* Контактная информация */}
          <div className="contacts-info">
            <div className="section-label">
              <span className="line"></span>
              <span>КОНТАКТЫ</span>
              <span className="line"></span>
            </div>
            <h2 className="section-title">Свяжитесь с нами</h2>

            <div className="contact-items">
              <div className="contact-item">
                <div className="contact-icon">
                  <MapPin size={20} strokeWidth={1.5} />
                </div>
                <div className="contact-text">
                  <strong>Адрес</strong>
                  <p>г. Ош, 5 улица, Кыргызстан</p>
                  
                    href="https://maps.apple.com/place?map=explore&address=Osh%2C+5+%D1%83%D0%BB%D0%B8%D1%86%D0%B0%2C+Kyrgyzstan&coordinate=40.497668%2C72.818444&name=Alay-Art+Hotel"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Открыть на карте →
                  </a>
                </div>
              </div>

              <div className="contact-item">
                <div className="contact-icon">
                  <Phone size={20} strokeWidth={1.5} />
                </div>
                <div className="contact-text">
                  <strong>Телефон</strong>
                  <p><a href="tel:+996550323070">+996 550 323 070</a></p>
                </div>
              </div>

              <div className="contact-item">
                <div className="contact-icon">
                  <Mail size={20} strokeWidth={1.5} />
                </div>
                <div className="contact-text">
                  <strong>Email</strong>
                  <p><a href="mailto:info@alayart.kg">info@alayart.kg</a></p>
                </div>
              </div>

              <div className="contact-item">
                <div className="contact-icon">
                  <Clock size={20} strokeWidth={1.5} />
                </div>
                <div className="contact-text">
                  <strong>Режим работы</strong>
                  <p>Круглосуточно, 24/7</p>
                </div>
              </div>
            </div>

            {/* Соцсети — как на главной */}
            <div className="contact-social-btns">
              
                href="https://www.instagram.com/alayart.hotel.osh"
                target="_blank"
                rel="noreferrer"
                className="contact-social-btn contact-social-btn--gold"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="2" width="20" height="20" rx="5"/>
                  <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
                Instagram
              </a>
              
                href="https://wa.me/996550323070"
                target="_blank"
                rel="noreferrer"
                className="contact-social-btn contact-social-btn--green"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp
              </a>
            </div>
          </div>

          {/* Карта — тот же src что на главной */}
          <div className="contacts-map">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3046.8!2d72.818444!3d40.497668!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDDCsDI5JzUxLjYiTiA3MsKwNDknMDYuNCJF!5e0!3m2!1sru!2skg!4v1"
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: '420px' }}
              allowFullScreen
              loading="lazy"
              title="ALAY ART Hotel Map"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>

      <Footer onNavClick={(id) => {
        navigate('/');
        setTimeout(() => {
          document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
        }, 300);
      }} />
    </>
  );
}
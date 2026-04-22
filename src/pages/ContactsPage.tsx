import { useEffect } from 'react';
import { MapPin, Phone, Mail, Clock, Instagram, MessageCircle, Send } from 'lucide-react';
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
                  <p>г. Ош, ул. Примерная, 123<br />Кыргызстан</p>
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

            {/* Соцсети */}
            <div className="contact-socials">
              <a href="#" className="social-btn">
                <Instagram size={16} strokeWidth={1.5} />
                Instagram
              </a>
              <a href="#" className="social-btn">
                <MessageCircle size={16} strokeWidth={1.5} />
                WhatsApp
              </a>
              <a href="#" className="social-btn">
                <Send size={16} strokeWidth={1.5} />
                Telegram
              </a>
            </div>
          </div>

          {/* Карта */}
          <div className="contacts-map">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2949.123!2d72.7936!3d40.5283!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38bc9df9e3fc96bd%3A0x8b1f9e8b1e3e3b1e!2sOsh%2C%20Kyrgyzstan!5e0!3m2!1sru!2skg!4v1234567890"
              width="100%"
              height="100%"
              style={{ border: 0, borderRadius: '16px', minHeight: '420px' }}
              allowFullScreen
              loading="lazy"
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
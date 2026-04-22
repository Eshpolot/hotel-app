import { useEffect } from 'react';
import { Users, MonitorPlay, Music2, Wifi, Coffee, ParkingCircle } from 'lucide-react';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';

const features = [
  { icon: Users,       title: 'Вместимость', desc: 'До 50 человек' },
  { icon: MonitorPlay, title: 'Проектор',    desc: 'Full HD оборудование' },
  { icon: Music2,      title: 'Звук',        desc: 'Профессиональная акустика' },
  { icon: Wifi,        title: 'Wi-Fi',       desc: 'Высокоскоростной интернет' },
  { icon: Coffee,      title: 'Кофе-брейк',  desc: 'Кейтеринг под заказ' },
  { icon: ParkingCircle, title: 'Парковка',  desc: 'Бесплатная парковка' },
];

export default function ConferencePage() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      {/* Hero */}
      <div className="page-hero conference-hero">
        <div className="page-hero-overlay"></div>
        <div className="page-hero-content">
          <p className="page-hero-label">ALAY ART HOTEL</p>
          <h1 className="page-hero-title">Конференц-зал</h1>
          <p className="page-hero-sub">
            Современное пространство для деловых встреч<br />
            и торжественных мероприятий
          </p>
        </div>
      </div>

      {/* Контент */}
      <section className="conference-section section-pad">
        <div className="conference-grid">

          {/* Левая часть */}
          <div className="conference-info">
            <div className="section-label">
              <span className="line"></span>
              <span>ВОЗМОЖНОСТИ</span>
              <span className="line"></span>
            </div>
            <h2 className="section-title">Идеально для любых мероприятий</h2>
            <p className="conference-desc">
              Наш конференц-зал оснащён современным оборудованием и вмещает до 50 человек.
              Подходит для бизнес-встреч, семинаров, свадеб и торжественных ужинов.
            </p>

            <div className="conference-features">
              {features.map(({ icon: Icon, title, desc }, i) => (
                <div className="conf-feature-item" key={i}>
                  <div className="conf-feature-icon">
                    <Icon size={20} strokeWidth={1.5} />
                  </div>
                  <div>
                    <strong>{title}</strong>
                    <p>{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <a href="tel:+996XXXXXXXXX" className="btn-gold">
              Забронировать зал
            </a>
          </div>

          {/* Правая часть — фото */}
          <div className="conference-images">
            <div className="conf-img-main">
              <img
                src="https://cf.bstatic.com/xdata/images/hotel/max1024x768/770130070.jpg?k=edcb990e2a117827c69d23dd5199716c60110554e74e313397fad9b88be5fe47&o="
                alt="Conference Hall"
              />
            </div>
            <div className="conf-img-grid">
              <img
                src="https://lh3.googleusercontent.com/d/1rEbP9-tlr4FOmXmkJBz71ADc2m8kAr3w"
                alt="Conference 2"
              />
              <img
                src="https://lh3.googleusercontent.com/d/1g55aq5FEets7sv9aotVzJWp43OnfeBEp"
                alt="Conference 3"
              />
            </div>
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
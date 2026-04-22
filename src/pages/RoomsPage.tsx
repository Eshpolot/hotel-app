import { useEffect } from 'react';
import Rooms from '../components/Rooms';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';

export default function RoomsPage() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      {/* Hero баннер */}
      <div className="page-hero">
        <div className="page-hero-overlay"></div>
        <div className="page-hero-content">
          <p className="page-hero-label">ALAY ART HOTEL</p>
          <h1 className="page-hero-title">Наши Номера</h1>
          <p className="page-hero-sub">
            Каждый номер — это произведение искусства,<br />
            вдохновлённое культурой Кыргызстана
          </p>
        </div>
      </div>

      {/* Номера */}
      <Rooms />

      <Footer onNavClick={(id) => {
        navigate('/');
        setTimeout(() => {
          document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
        }, 300);
      }} />
    </>
  );
}
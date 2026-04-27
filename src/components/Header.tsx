import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import UserMenu from './UserMenu';
import AuthModal from './AuthModal';

export default function Header() {
  const { user } = useAuth();
  const { t, lang, setLang, currency, setCurrency } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isHome = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    setMenuOpen(false);
    if (!isHome) {
      navigate('/');
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <header className={`header ${scrolled ? 'scrolled' : 'transparent'}`} id="header">
        <div className="header-inner">

          {/* Logo */}
          <div className="logo" onClick={() => navigate('/')}>
            <div className="logo-icon">
              <img src="/logo.png" alt="ALAY ART Logo" />
            </div>
            <div className="logo-text">
              <h1>ALAY ART</h1>
              <span>Boutique Hotel • Osh</span>
            </div>
          </div>

          {/* Nav */}
          <nav className={`nav-links ${menuOpen ? 'open' : ''}`}>
            <Link
              to="/"
              className={isActive('/') ? 'active' : ''}
              onClick={() => setMenuOpen(false)}
            >
              {t('home')}
            </Link>
            <Link
              to="/rooms"
              className={isActive('/rooms') ? 'active' : ''}
              onClick={() => setMenuOpen(false)}
            >
              {t('rooms')}
            </Link>
            <Link
              to="/contacts"
              className={isActive('/contacts') ? 'active' : ''}
              onClick={() => setMenuOpen(false)}
            >
              {t('contacts')}
            </Link>
          </nav>

          {/* Controls */}
          <div className="header-controls">
            <select
              className="header-select"
              value={lang}
              onChange={e => setLang(e.target.value as 'ru' | 'en' | 'kg')}
            >
              <option value="ru">Русский</option>
              <option value="en">English</option>
              <option value="kg">Кыргызча</option>
            </select>

            <select
              className="header-select"
              value={currency}
              onChange={e => setCurrency(e.target.value as 'KGS' | 'USD')}
            >
              <option value="KGS">KGS</option>
              <option value="USD">USD</option>
            </select>

            {user ? (
              <UserMenu />
            ) : (
              <button className="btn-primary" onClick={() => setAuthOpen(true)}>
                {t('login')}
              </button>
            )}

            <button
              className={`hamburger ${menuOpen ? 'open' : ''}`}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menu"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>
      </header>

      <ScrollTopButton />
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}

function ScrollTopButton() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const fn = () => setShow(window.scrollY > 500);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);
  return (
    <button
      className={`scroll-top ${show ? 'show' : ''}`}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Scroll to top"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <polyline points="18,15 12,9 6,15" />
      </svg>
    </button>
  );
}
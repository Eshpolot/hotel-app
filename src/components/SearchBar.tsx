import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface SearchBarProps {
  onSearch: (checkIn: string, checkOut: string, guests: string) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const { t } = useLanguage();
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(checkIn, checkOut, guests);
    document.getElementById('rooms')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="search-section">
      <div className="search-inner">
        <form className="search-form" onSubmit={handleSubmit}>
          <div className="search-field">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <input type="text" placeholder={t('search_placeholder')} readOnly value="ALAY ART Hotel, Osh" />
          </div>
          <div className="search-field">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            <input type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)} placeholder={t('check_in')} />
          </div>
          <div className="search-field">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            <input type="date" value={checkOut} onChange={e => setCheckOut(e.target.value)} placeholder={t('check_out')} />
          </div>
          <div className="search-field">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
            <input type="text" placeholder={t('guests_placeholder')} value={guests} onChange={e => setGuests(e.target.value)} />
          </div>
          <button className="search-btn" type="submit">{t('search')}</button>
        </form>
      </div>
    </section>
  );
}

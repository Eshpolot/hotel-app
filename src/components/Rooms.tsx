import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Room } from '../lib/supabase';
import BookingModal from './BookingModal';

interface RoomsProps {
  searchCheckIn?: string;
  searchCheckOut?: string;
}

const staticRooms: Room[] = [
  {
    id: 1, type: 'standard', name_ru: 'Стандарт', name_en: 'Standard', name_kg: 'Стандарт',
    description_ru: 'Уютный номер с этно-декором, всем необходимым для комфортного проживания.',
    description_en: 'Cozy room with ethno decor and everything needed for comfortable stay.',
    description_kg: 'Этно-декор менен ыңгайлуу бөлмө.',
    price_kgs: 3500, capacity: 2, image_url: 'https://lh3.googleusercontent.com/d/1q3z2pxxllqb6mhLW4r_ImUyc3LTmRKZi',
    amenities: [], badge: 'Популярный', badge_type: 'popular', is_active: true
  },
  {
    id: 2, type: 'deluxe', name_ru: 'Делюкс', name_en: 'Deluxe', name_kg: 'Делюкс',
    description_ru: 'Просторный номер премиум-класса с панорамным видом и роскошной отделкой.',
    description_en: 'Spacious premium room with panoramic views and luxurious finishes.',
    description_kg: 'Панорамалык көрүнүшү бар кең бөлмө.',
    price_kgs: 6500, capacity: 2, image_url: 'https://lh3.googleusercontent.com/d/1rEbP9-tlr4FOmXmkJBz71ADc2m8kAr3w',
    amenities: [], badge: 'VIP', badge_type: 'vip', is_active: true
  },
  {
    id: 3, type: 'family', name_ru: 'Семейный', name_en: 'Family', name_kg: 'Үй-бүлөлүк',
    description_ru: 'Идеальный номер для семейного отдыха с двумя зонами и детскими удобствами.',
    description_en: 'Perfect room for family vacation with two zones and children amenities.',
    description_kg: 'Үй-бүлөлүк эс алуу үчүн идеалдуу бөлмө.',
    price_kgs: 5000, capacity: 4, image_url: 'https://lh3.googleusercontent.com/d/1g55aq5FEets7sv9aotVzJWp43OnfeBEp',
    amenities: [], badge: null, badge_type: null, is_active: true
  },
  {
    id: 4, type: 'suite', name_ru: 'Люкс', name_en: 'Suite', name_kg: 'Люкс',
    description_ru: 'Роскошный люкс с гостиной, спальней и потрясающим этническим интерьером.',
    description_en: 'Luxurious suite with living room, bedroom and stunning ethnic interior.',
    description_kg: 'Мейманкана жана уктоо бөлмөсү бар люкс.',
    price_kgs: 9500, capacity: 2, image_url: 'https://lh3.googleusercontent.com/d/1iYXmMtHFaf6gI87n932UnBZaCym_Nwy2',
    amenities: [], badge: 'VIP SUITE', badge_type: 'vip', is_active: true
  },
];

export default function Rooms({ searchCheckIn = '', searchCheckOut = '' }: RoomsProps) {
  const { t, lang, formatPrice } = useLanguage();
  const ref = useRef<HTMLDivElement>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [bookingOpen, setBookingOpen] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); } }),
      { threshold: 0.1 }
    );
    ref.current?.querySelectorAll('.anim').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const getRoomName = (room: Room) => lang === 'en' ? room.name_en : lang === 'kg' ? room.name_kg : room.name_ru;
  const getRoomDesc = (room: Room) => lang === 'en' ? room.description_en : lang === 'kg' ? room.description_kg : room.description_ru;

  const handleBook = (room: Room) => {
    setSelectedRoom(room);
    setBookingOpen(true);
  };

  return (
    <>
      <section className="rooms-section section-pad" id="rooms" ref={ref}>
        <div className="section-header anim">
          <div className="section-label"><span className="line"></span><span>{t('rooms_label')}</span><span className="line"></span></div>
          <h2 className="section-title">{t('rooms_title')}</h2>
          <p className="section-desc">{t('rooms_desc')}</p>
        </div>
        <div className="rooms-grid">
          {staticRooms.map((room, i) => (
            <div className={`room-card anim ${i % 2 === 0 ? 'fade-left' : 'fade-right'}`} key={room.id} style={{ transitionDelay: `${i * 0.1}s` }}>
              {room.badge && (
                <span className={`room-badge ${room.badge_type === 'vip' ? 'vip' : 'popular'}`}>{room.badge}</span>
              )}
              <div className="room-img">
                <img src={room.image_url || ''} alt={getRoomName(room)} loading="lazy" />
                <div className="room-img-overlay"></div>
              </div>
              <div className="room-body">
                <h3>{getRoomName(room)}</h3>
                <p>{getRoomDesc(room)}</p>
                <div className="room-amenities">
                  <span className="room-amenity">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12.55a11 11 0 0114.08 0"/><path d="M8.53 16.11a6 6 0 016.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>
                    Wi-Fi
                  </span>
                  <span className="room-amenity">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="15" rx="2"/><polyline points="17,2 12,7 7,2"/></svg>
                    TV
                  </span>
                  <span className="room-amenity">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8h1a4 4 0 010 8h-1"/><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/></svg>
                    {t('breakfast')}
                  </span>
                  {room.capacity > 2 && (
                    <span className="room-amenity">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                      {t('kids_friendly')}
                    </span>
                  )}
                </div>
                <div className="room-footer">
                  <div className="room-price">
                    {formatPrice(room.price_kgs)} <small>/ {t('per_night')}</small>
                  </div>
                  <button className="room-book" onClick={() => handleBook(room)}>{t('book')}</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <BookingModal
        isOpen={bookingOpen}
        onClose={() => setBookingOpen(false)}
        room={selectedRoom}
        initialCheckIn={searchCheckIn}
        initialCheckOut={searchCheckOut}
      />
    </>
  );
}

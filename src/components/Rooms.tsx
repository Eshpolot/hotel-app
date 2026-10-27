import { roomSnapshot } from '../data/roomSnapshot';
import hotelImages from '../data/hotelImages.json';
import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase, Room } from '../lib/supabase';
import { stayNights } from '../lib/booking';
import BookingModal from './BookingModal';

interface RoomsProps {
  searchCheckIn?: string;
  searchCheckOut?: string;
  searchGuests?: string;
}

export default function Rooms({ searchCheckIn = '', searchCheckOut = '', searchGuests = '1' }: RoomsProps) {
  const { t, lang, formatPrice } = useLanguage();
  const ref = useRef<HTMLDivElement>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [bookingOpen, setBookingOpen] = useState(false);

  const [rooms, setRooms] = useState<Room[]>(roomSnapshot);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [sort, setSort] = useState('recommended');
  const [filter, setFilter] = useState('all');
  const copy = (ru: string, en: string, kg: string) => lang === 'en' ? en : lang === 'kg' ? kg : ru;
  const requestVersion = useRef(0);
  const loadRooms = async () => {
    const version = ++requestVersion.current;
    setLoading(true); setError(false);
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 8000);
    try {
      const { data, error } = await supabase.from('rooms').select('*').eq('is_active', true).order('id').abortSignal(controller.signal);
      if (error) throw error;
      if (version === requestVersion.current) setRooms(data || []);
    } catch {
      if (version === requestVersion.current) { setRooms(roomSnapshot); setError(true); }
    } finally {
      window.clearTimeout(timeout);
      if (version === requestVersion.current) setLoading(false);
    }
  };
  useEffect(() => {
    void loadRooms();
    return () => { requestVersion.current++; };
  }, []);
  const localPhoto = (room: Room) => (hotelImages as Record<string, string>)[room.image_url || ''] || room.image_url || '/room-placeholder.svg';
  const contactLink = (room: Room) => 'https://wa.me/996550323070?text=' + encodeURIComponent(
    `ALAY ART: ${room.name_ru}. ${searchCheckIn || '—'} → ${searchCheckOut || '—'}. ${searchGuests || 1} guests. Уточните, пожалуйста, наличие и стоимость.`
  );
  const visibleRooms = rooms.filter(r => r.capacity >= Number(searchGuests || 1) && (filter === 'all' || r.type === filter))
    .sort((a, b) => sort === 'price' ? a.price_kgs - b.price_kgs : sort === 'capacity' ? b.capacity - a.capacity : a.id - b.id);
  const nights = stayNights(searchCheckIn, searchCheckOut);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); } }),
      { threshold: 0.1 }
    );
    ref.current?.querySelectorAll('.anim').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [rooms, filter, sort, searchGuests]);

  const getRoomName = (room: Room) => lang === 'en' ? room.name_en : lang === 'kg' ? room.name_kg : room.name_ru;
  const getRoomDesc = (room: Room) => lang === 'en' ? room.description_en : lang === 'kg' ? room.description_kg : room.description_ru;

  const handleBook = (room: Room) => {
    if (loading || error) return;
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
        <div className="room-tools">
          <div className="room-tabs" aria-label={copy('Тип номера', 'Room type', 'Бөлмө түрү')}>
            {['all','standard','deluxe','family','suite'].map((type, i) => <button key={type} aria-pressed={filter === type} className={filter === type ? 'active' : ''} onClick={() => setFilter(type)}>{[copy('Все номера','All rooms','Бардык бөлмөлөр'),copy('Стандарт','Standard','Стандарт'),copy('Делюкс','Deluxe','Делюкс'),copy('Семейный','Family','Үй-бүлөлүк'),copy('Люкс','Suite','Люкс')][i]}</button>)}
          </div>
          <select aria-label={copy('Сортировка','Sort rooms','Иреттөө')} value={sort} onChange={e => setSort(e.target.value)}>
            <option value="recommended">{copy('Рекомендуемые','Recommended','Сунушталган')}</option>
            <option value="price">{copy('Сначала дешевле','Price: low to high','Арзаны биринчи')}</option>
            <option value="capacity">{copy('Больше гостей','More guests','Көбүрөөк конок')}</option>
          </select>
        </div>
        <p className="catalog-note">{copy('Выберите свой отдых. Заявку и наличие номера подтверждает отель.', 'Find your stay. Requests and availability are confirmed by the hotel.', 'Эс алууңузду тандаңыз. Өтүнмөнү жана бош бөлмөнү мейманкана ырастайт.')}</p>
        {loading && <p className="catalog-state" role="status">{copy('Обновляем цены. Пока показан сохранённый каталог.','Refreshing prices. Showing saved catalogue.','Баалар жаңыланууда. Сакталган каталог көрсөтүлдү.')}</p>}
        {error && <div className="catalog-state" role="alert"><p>{copy('Нет связи с системой бронирования. Показан сохранённый каталог: цены и наличие уточните у отеля.','Booking service is unavailable. Showing saved catalogue: confirm prices and availability with the hotel.','Брондоо системасы менен байланыш жок. Сакталган каталог көрсөтүлдү: бааларды мейманканадан тактаңыз.')}</p><button className="btn-gold" onClick={loadRooms}>{copy('Повторить','Retry','Кайталоо')}</button> <a href="tel:+996550323070">+996 550 323 070</a></div>}
        {!loading && !error && !visibleRooms.length && <p className="catalog-state">{copy('Нет подходящих номеров. Измените фильтры или число гостей.','No matching rooms. Change filters or guest count.','Ылайыктуу бөлмө жок. Чыпкаларды өзгөртүңүз.')}</p>}
        <div className="rooms-grid">
          {visibleRooms.map((room, i) => (
            <div className="room-card" key={room.id} style={{ transitionDelay: `${i * 0.1}s` }}>
              {room.badge && (
                <span className={`room-badge ${room.badge_type === 'vip' ? 'vip' : 'popular'}`}>{room.badge}</span>
              )}
              <div className="room-img">
                <img src={localPhoto(room)} onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = '/room-placeholder.svg'; }} alt={getRoomName(room)} loading="lazy" />
                <div className="room-img-overlay"></div>
                {localPhoto(room) === '/images/ornament.webp' && <span className="photo-caption">{copy('Орнамент · фото номера уточняется','Ornament · room photo pending','Оймо · бөлмөнүн сүрөтү такталууда')}</span>}
              </div>
              <div className="room-body">
                <h3>{getRoomName(room)}</h3>
                <span className="capacity-label">{copy('До','Up to','Чейин')} {room.capacity} · {t('booking_guests')}</span>
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
                {nights > 0 && <p className="stay-total">{formatPrice(room.price_kgs * nights)} / {nights} {t('booking_nights')}</p>}
                <div className="room-footer">
                  <div className="room-price">
                    {(loading || error) && '≈ '}{formatPrice(room.price_kgs)} <small>/ {t('per_night')}</small>
                  </div>
                  {loading || error
                    ? <a className="room-book" href={contactLink(room)} target="_blank" rel="noopener noreferrer">{copy('Уточнить','Enquire','Тактоо')}</a>
                    : <button className="room-book" onClick={() => handleBook(room)}>{t('book')}</button>}
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
        initialGuests={Number(searchGuests || 1)}
        initialCheckIn={searchCheckIn}
        initialCheckOut={searchCheckOut}
      />
    </>
  );
}

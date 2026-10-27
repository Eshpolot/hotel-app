import { useDialog } from '../hooks/useDialog';
import { useState, useEffect } from 'react';
import { today, nextDay, stayNights, validStay } from '../lib/booking';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase, Room } from '../lib/supabase';
import AuthModal from './AuthModal';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: Room | null;
  initialGuests?: number;
  initialCheckIn?: string;
  initialCheckOut?: string;
}

export default function BookingModal({ isOpen, onClose, room, initialCheckIn = '', initialCheckOut = '', initialGuests = 1 }: BookingModalProps) {
  const { user, profile } = useAuth();
  const { t, lang, formatPrice } = useLanguage();
  const dialogRef = useDialog(isOpen && !!user);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [bookingRef, setBookingRef] = useState('');

  const [notes, setNotes] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [checkIn, setCheckIn] = useState(initialCheckIn);
  const [checkOut, setCheckOut] = useState(initialCheckOut);
  const [guestsCount, setGuestsCount] = useState(1);

  useEffect(() => {
    if (isOpen && user) {
      setGuestName(profile?.full_name || user?.user_metadata?.full_name || '');
      setGuestEmail(user?.email || '');
      setGuestPhone(profile?.phone || '');
    }
  }, [isOpen, profile, user]);

  useEffect(() => {
    if (isOpen) {
      setCheckIn(initialCheckIn || today());
      setGuestsCount(Math.min(initialGuests, room?.capacity || 1));
      setNotes('');
      setCheckOut(initialCheckOut || nextDay(initialCheckIn || today()));
      setError('');
      setSuccess(false);
    }
  }, [isOpen, initialCheckIn, initialCheckOut, initialGuests, room?.id, room?.capacity]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  if (!user) {
    return (
      <AuthModal
        isOpen={true}
        onClose={onClose}
        closeOnSuccess={false}
      />
    );
  }

  if (!room) return null;

  const nights = checkIn && checkOut ? stayNights(checkIn, checkOut) : 0;
  const total = nights > 0 ? room.price_kgs * nights : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim() || !guestEmail || !checkIn || !checkOut) { setError('Заполните все обязательные поля'); return; }
    if (!validStay(checkIn, checkOut)) { setError('Выберите даты: от 1 до 90 ночей, заезд не в прошлом.'); return; }
    if (!Number.isInteger(guestsCount) || guestsCount < 1 || guestsCount > room.capacity) { setError('Проверьте число гостей'); return; }
    if (loading) return;

    setLoading(true);
    setError('');
    try {

      const { data: booking, error: insertError } = await supabase
        .from('bookings')
        .insert({
          room_id: room.id,
          user_id: user.id,
          guest_name: guestName.trim(),
          guest_email: guestEmail.trim(),
          guest_phone: guestPhone || null,
          check_in: checkIn,
          check_out: checkOut,
          guests_count: guestsCount,
          notes: notes.trim() || null
        })
        .select()
        .single();

      if (insertError) throw insertError;
      setBookingRef((booking.id as string).substring(0, 8).toUpperCase());
      setSuccess(true);
    } catch (err) {
      setError('Не удалось отправить заявку. Проверьте данные и соединение. Если уже отправляли заявку, проверьте личный кабинет перед повтором.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="modal-overlay open" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
        <div ref={dialogRef} className="modal-box" role="dialog" aria-modal="true" aria-label={t('booking_title')}>
          <button aria-label="Закрыть / Close" className="modal-close" onClick={onClose}>✕</button>
          <div className="booking-confirmation">
            <div className="booking-confirmation-icon">🎉</div>
            <h2>{t('booking_success_title')}</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>{t('booking_success_text')}</p>
            <div className="booking-ref">
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>{t('booking_ref')}</div>
              <strong>{bookingRef}</strong>
            </div>
            <Link className="btn-gold" style={{ marginTop: 20 }} to="/profile" onClick={onClose}>{t('my_bookings')}</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay open" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div ref={dialogRef} className="modal-box" role="dialog" aria-modal="true" aria-label={t('booking_title')}>
        <button aria-label="Закрыть / Close" className="modal-close" onClick={onClose}>✕</button>
        <h2>{t('booking_title')}</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: 8, fontSize: 14 }}>
          {lang === 'en' ? room.name_en : lang === 'kg' ? room.name_kg : room.name_ru} — <strong style={{ color: 'var(--primary)' }}>{formatPrice(room.price_kgs)}</strong> / {t('per_night')}
        </p>
        <form onSubmit={handleSubmit}>
          <label>{t('booking_guest_name')} *</label>
          <input aria-label={t('booking_guest_name')} minLength={2} maxLength={120} autoComplete="name" type="text" value={guestName} onChange={e => setGuestName(e.target.value)} required />
          <label>{t('booking_email')} *</label>
          <input aria-label={t('booking_email')} maxLength={254} autoComplete="email" type="email" value={guestEmail} onChange={e => setGuestEmail(e.target.value)} required />
          <label>{t('booking_phone')}</label>
          <input aria-label={t('booking_phone')} maxLength={40} autoComplete="tel" type="tel" value={guestPhone} onChange={e => setGuestPhone(e.target.value)} placeholder="+996 XXX XXX XXX" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label>{t('booking_checkin')} *</label>
              <input aria-label={t('booking_checkin')} type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)} required min={today()} />
            </div>
            <div>
              <label>{t('booking_checkout')} *</label>
              <input aria-label={t('booking_checkout')} type="date" value={checkOut} onChange={e => setCheckOut(e.target.value)} required min={nextDay(checkIn)} />
            </div>
          </div>
          <label>{t('booking_guests')}</label>
          <input aria-label={t('booking_guests')} required type="number" value={guestsCount} onChange={e => setGuestsCount(Number(e.target.value))} min={1} max={room.capacity} />

          <label htmlFor="guest-notes">{lang === 'en' ? 'Special requests' : lang === 'kg' ? 'Каалоолор' : 'Пожелания к проживанию'}</label>
          <textarea id="guest-notes" maxLength={1000} rows={3} value={notes} onChange={e => setNotes(e.target.value)} placeholder={lang === 'en' ? 'Arrival time, transfer, travelling with children…' : lang === 'kg' ? 'Келүү убактысы, трансфер…' : 'Время прибытия, трансфер, отдых с детьми…'} />
          <p className="catalog-note">{lang === 'en' ? 'Requests are subject to confirmation. No online payment is taken.' : lang === 'kg' ? 'Өтүнмөнү мейманкана ырастайт. Онлайн төлөм алынбайт.' : 'Заявку и пожелания подтверждает отель. Онлайн-оплата не списывается.'}</p>
          {nights > 0 && (
            <div className="booking-summary">
              <div className="booking-summary-row">
                <span>{formatPrice(room.price_kgs)} × {nights} {t('booking_nights')}</span>
                <span>{formatPrice(total)}</span>
              </div>
              <div className="booking-summary-row total">
                <span>{t('booking_total')}</span>
                <span className="booking-total-price">{formatPrice(total)}</span>
              </div>
            </div>
          )}

          {error && <div role="alert" className="modal-error">{error}</div>}
          <button type="submit" className="modal-submit" disabled={loading}>
            {loading ? t('booking_checking') : t('booking_submit')}
          </button>
        </form>
      </div>
    </div>
  );
}

import { formatBookingReference } from '../lib/bookingReference';
import { bookingError } from '../lib/bookingErrors';
import { bookingRequestKey, forgetBookingRequest } from '../lib/bookingRequest';
import { useDialog } from '../hooks/useDialog';
import { useState, useEffect, useRef } from 'react';
import { today, nextDay, stayNights, validStay } from '../lib/booking';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase, Room, Booking } from '../lib/supabase';
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
  const sending = useRef(false);
  const editedContact = useRef(false);
  const contactUser = useRef<string | null>(null);
  const [quotedPrice, setQuotedPrice] = useState(room?.price_kgs || 0);
  const [priceChanged, setPriceChanged] = useState(false);
  const [savedBooking, setSavedBooking] = useState<Booking | null>(null);
  const [available, setAvailable] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [notes, setNotes] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [checkIn, setCheckIn] = useState(initialCheckIn);
  const [checkOut, setCheckOut] = useState(initialCheckOut);
  const [guestsCount, setGuestsCount] = useState(1);

  useEffect(() => {
    if (isOpen) {
      editedContact.current = false;
      setQuotedPrice(room?.price_kgs || 0);
      setPriceChanged(false);
      setSavedBooking(null);
      setCheckIn(initialCheckIn || today());
      setGuestsCount(Math.min(initialGuests, room?.capacity || 1));
      setNotes('');
      setCheckOut(initialCheckOut || nextDay(initialCheckIn || today()));
      setError('');
      setSuccess(false);
    }
  }, [isOpen, initialCheckIn, initialCheckOut, initialGuests, room?.id, room?.capacity]);

  useEffect(() => {
    if (isOpen && user && (!editedContact.current || contactUser.current !== user.id)) {
      contactUser.current = user.id;
      setGuestName(profile?.full_name || user?.user_metadata?.full_name || '');
      setGuestEmail(user?.email || '');
      setGuestPhone(profile?.phone || '');
    }
  }, [isOpen, profile, user]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape' && !sending.current) onClose(); };
    if (isOpen) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  useEffect(() => {
    setAvailable(null);
    if (!isOpen || !room || !validStay(checkIn, checkOut)) return;
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      const { data, error } = await supabase.rpc('check_hotel_availability', { p_room_id: room.id, p_check_in: checkIn, p_check_out: checkOut }).abortSignal(controller.signal);
      if (!controller.signal.aborted && !error && typeof data === 'number') setAvailable(data);
    }, 300);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [isOpen, room?.id, checkIn, checkOut]);

  const close = () => { if (!sending.current) onClose(); };
  const refreshPrice = async () => {
    if (!room) return;
    const { data, error } = await supabase.from('rooms').select('price_kgs').eq('id', room.id).eq('is_active', true).single();
    if (error || !data) { setError(bookingError(error, lang)); return; }
    setQuotedPrice(data.price_kgs); setPriceChanged(false); setError('');
  };

  if (!isOpen) return null;

  if (!user) {
    return (
      <AuthModal
        isOpen={true}
        onClose={close}
        closeOnSuccess={false}
      />
    );
  }

  if (!room) return null;

  const nights = checkIn && checkOut ? stayNights(checkIn, checkOut) : 0;
  const total = nights > 0 ? quotedPrice * nights : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim() || !guestEmail || !checkIn || !checkOut) { setError('Заполните все обязательные поля'); return; }
    if (!validStay(checkIn, checkOut)) { setError('Выберите даты: от 1 до 90 ночей, заезд не в прошлом.'); return; }
    if (!Number.isInteger(guestsCount) || guestsCount < 1 || guestsCount > room.capacity) { setError('Проверьте число гостей'); return; }
    if (sending.current || priceChanged) return;
    sending.current = true;

    setLoading(true);
    setError('');
    try {

      const payload = {
        p_room_id: room.id, p_check_in: checkIn, p_check_out: checkOut, p_guests: guestsCount,
        p_name: guestName.trim(), p_email: guestEmail.trim(), p_phone: guestPhone.trim() || null,
        p_notes: notes.trim() || null, p_expected_price: quotedPrice
      };
      const request = await bookingRequestKey(user.id, payload);
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 20000);
      let result;
      try {
        result = await supabase.rpc('request_hotel_booking', { ...payload, p_request_key: request.key }).abortSignal(controller.signal).single();
      } finally { window.clearTimeout(timeout); }
      if (result.error) throw result.error;
      const booking = result.data as Booking;
      if (!booking?.id) throw new Error('INVALID_RESPONSE');
      setSavedBooking(booking);
      forgetBookingRequest(request.storageKey);
      setSuccess(true);
    } catch (err) {
      setError(bookingError(err, lang));
      if (String((err as {message?: string})?.message).includes('PRICE_CHANGED')) setPriceChanged(true);
    } finally {
      sending.current = false;
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="modal-overlay open" onClick={e => { if (e.target === e.currentTarget) close(); }}>
        <div ref={dialogRef} className="modal-box" role="dialog" aria-modal="true" aria-label={t('booking_title')}>
          <button aria-label="Закрыть / Close" className="modal-close" onClick={close} disabled={loading}>✕</button>
          <div className="booking-confirmation">
            <div className="booking-confirmation-icon">🎉</div>
            <h2>{savedBooking?.status === 'pending' ? t('booking_success_title') : t('status_' + savedBooking?.status)}</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>{savedBooking?.status === 'pending' ? t('booking_success_text') : t('my_bookings')}</p>
            <p>{t('booking_total')}: {formatPrice(savedBooking?.total_price_kgs || 0)}</p>
            <div className="booking-ref">
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>{t('booking_ref')}</div>
              <code className="booking-reference">{formatBookingReference(savedBooking?.id ?? '')}</code>
            </div>
            <Link className="btn-gold" style={{ marginTop: 20 }} to="/profile" onClick={close}>{t('my_bookings')}</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay open" onClick={e => { if (e.target === e.currentTarget) close(); }}>
      <div ref={dialogRef} className="modal-box" role="dialog" aria-modal="true" aria-label={t('booking_title')}>
        <button aria-label="Закрыть / Close" className="modal-close" onClick={close} disabled={loading}>✕</button>
        <h2>{t('booking_title')}</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: 8, fontSize: 14 }}>
          {lang === 'en' ? room.name_en : lang === 'kg' ? room.name_kg : room.name_ru} — <strong style={{ color: 'var(--primary)' }}>{formatPrice(quotedPrice)}</strong> / {t('per_night')}
        </p>
        <form onSubmit={handleSubmit}>
          <fieldset disabled={loading} style={{ border: 0, minWidth: 0, padding: 0 }}>
          <label>{t('booking_guest_name')} *</label>
          <input aria-label={t('booking_guest_name')} minLength={2} maxLength={120} autoComplete="name" type="text" value={guestName} onChange={e => { editedContact.current = true; setGuestName(e.target.value); }} required />
          <label>{t('booking_email')} *</label>
          <input aria-label={t('booking_email')} maxLength={254} autoComplete="email" type="email" value={guestEmail} onChange={e => { editedContact.current = true; setGuestEmail(e.target.value); }} required />
          <label>{t('booking_phone')}</label>
          <input aria-label={t('booking_phone')} maxLength={40} autoComplete="tel" type="tel" value={guestPhone} onChange={e => { editedContact.current = true; setGuestPhone(e.target.value); }} placeholder="+996 XXX XXX XXX" />
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
                <span>{formatPrice(quotedPrice)} × {nights} {t('booking_nights')}</span>
                <span>{formatPrice(total)}</span>
              </div>
              <div className="booking-summary-row total">
                <span>{t('booking_total')}</span>
                <span className="booking-total-price">{formatPrice(total)}</span>
              </div>
            </div>
          )}

          {available === 0 && <p role="status" className="modal-error">{bookingError({message: 'ROOM_UNAVAILABLE'}, lang)}</p>}
          <p className="catalog-note">{lang === 'en' ? 'A request does not reserve a room. Availability is checked again on confirmation.' : lang === 'kg' ? 'Өтүнмө бөлмөнү ээлебейт. Ырастоодо бош бөлмө кайра текшерилет.' : 'Заявка не закрепляет номер. При подтверждении отель повторно проверяет наличие.'}</p>
          {error && <div role="alert" className="modal-error">{error} <Link to="/profile" onClick={close}>{t('my_bookings')}</Link></div>}
          {priceChanged && <button type="button" className="detail-secondary" onClick={refreshPrice}>{lang === 'en' ? 'Refresh price' : lang === 'kg' ? 'Бааны жаңылоо' : 'Обновить цену'}</button>}
          <button type="submit" className="modal-submit" disabled={loading || priceChanged}>
            {loading ? t('booking_checking') : t('booking_submit')}
          </button>
          </fieldset>
        </form>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { differenceInDays } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase, Room } from '../lib/supabase';
import AuthModal from './AuthModal';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  room: Room | null;
  initialCheckIn?: string;
  initialCheckOut?: string;
}

export default function BookingModal({ isOpen, onClose, room, initialCheckIn = '', initialCheckOut = '' }: BookingModalProps) {
  const { user, profile } = useAuth();
  const { t, formatPrice } = useLanguage();
  const [showAuth, setShowAuth] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [bookingRef, setBookingRef] = useState('');

  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [checkIn, setCheckIn] = useState(initialCheckIn);
  const [checkOut, setCheckOut] = useState(initialCheckOut);
  const [guestsCount, setGuestsCount] = useState(1);

  useEffect(() => {
    if (isOpen && profile) {
      setGuestName(profile.full_name || user?.user_metadata?.full_name || '');
      setGuestEmail(user?.email || '');
      setGuestPhone(profile.phone || '');
    }
    if (isOpen) {
      setCheckIn(initialCheckIn);
      setCheckOut(initialCheckOut);
      setError('');
      setSuccess(false);
    }
  }, [isOpen, profile, user, initialCheckIn, initialCheckOut]);

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
        onSuccess={() => setShowAuth(false)}
      />
    );
  }

  if (showAuth) {
    return <AuthModal isOpen={true} onClose={() => setShowAuth(false)} onSuccess={() => setShowAuth(false)} />;
  }

  if (!room) return null;

  const nights = checkIn && checkOut ? differenceInDays(new Date(checkOut), new Date(checkIn)) : 0;
  const total = nights > 0 ? room.price_kgs * nights : 0;

  const checkAvailability = async (): Promise<boolean> => {
    const { data } = await supabase
      .from('bookings')
      .select('id')
      .eq('room_id', room.id)
      .neq('status', 'cancelled')
      .lte('check_in', checkOut)
      .gte('check_out', checkIn);
    return !data || data.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName || !guestEmail || !checkIn || !checkOut) { setError('Заполните все обязательные поля'); return; }
    if (nights <= 0) { setError('Дата выезда должна быть позже даты заезда'); return; }

    setLoading(true);
    setError('');
    try {
      const available = await checkAvailability();
      if (!available) { setError(t('booking_unavailable')); setLoading(false); return; }

      const { data: booking, error: insertError } = await supabase
        .from('bookings')
        .insert({
          room_id: room.id,
          user_id: user.id,
          guest_name: guestName,
          guest_email: guestEmail,
          guest_phone: guestPhone || null,
          check_in: checkIn,
          check_out: checkOut,
          guests_count: guestsCount,
          total_price_kgs: total
        })
        .select()
        .single();

      if (insertError) throw insertError;
      setBookingRef((booking.id as string).substring(0, 8).toUpperCase());
      setSuccess(true);
    } catch (err) {
      setError('Ошибка при бронировании. Попробуйте снова.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="modal-overlay open" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
        <div className="modal-box">
          <button className="modal-close" onClick={onClose}>✕</button>
          <div className="booking-confirmation">
            <div className="booking-confirmation-icon">🎉</div>
            <h2>{t('booking_success_title')}</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 16 }}>{t('booking_success_text')}</p>
            <div className="booking-ref">
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>{t('booking_ref')}</div>
              <strong>{bookingRef}</strong>
            </div>
            <button className="btn-gold" style={{ marginTop: 20 }} onClick={onClose}>{t('home')}</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay open" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-box">
        <button className="modal-close" onClick={onClose}>✕</button>
        <h2>{t('booking_title')}</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: 8, fontSize: 14 }}>
          {room.name_ru} — <strong style={{ color: 'var(--primary)' }}>{formatPrice(room.price_kgs)}</strong> / {t('per_night')}
        </p>
        <form onSubmit={handleSubmit}>
          <label>{t('booking_guest_name')} *</label>
          <input type="text" value={guestName} onChange={e => setGuestName(e.target.value)} required />
          <label>{t('booking_email')} *</label>
          <input type="email" value={guestEmail} onChange={e => setGuestEmail(e.target.value)} required />
          <label>{t('booking_phone')}</label>
          <input type="tel" value={guestPhone} onChange={e => setGuestPhone(e.target.value)} placeholder="+996 XXX XXX XXX" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label>{t('booking_checkin')} *</label>
              <input type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)} required min={new Date().toISOString().split('T')[0]} />
            </div>
            <div>
              <label>{t('booking_checkout')} *</label>
              <input type="date" value={checkOut} onChange={e => setCheckOut(e.target.value)} required min={checkIn || new Date().toISOString().split('T')[0]} />
            </div>
          </div>
          <label>{t('booking_guests')}</label>
          <input type="number" value={guestsCount} onChange={e => setGuestsCount(Number(e.target.value))} min={1} max={room.capacity} />

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

          {error && <div className="modal-error">{error}</div>}
          <button type="submit" className="modal-submit" disabled={loading}>
            {loading ? t('booking_checking') : t('booking_submit')}
          </button>
        </form>
      </div>
    </div>
  );
}

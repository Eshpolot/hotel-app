import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase, Booking } from '../lib/supabase';

export default function Profile() {
  const { user, profile, isLoading, signOut } = useAuth();
  const { t, formatPrice, lang } = useLanguage();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/');
    }
  }, [user, isLoading, navigate]);

  useEffect(() => {
    if (user) fetchBookings();
  }, [user]);

  const fetchBookings = async () => {
    setLoadingBookings(true);
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*, room:rooms(*)')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });
      if (!error && data) setBookings(data as Booking[]);
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
    } finally {
      setLoadingBookings(false);
    }
  };

  const cancelBooking = async (bookingId: string) => {
    if (!confirm(t('cancel_confirm'))) return;
    try {
      await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId)
        .eq('status', 'pending');
      setBookings(prev =>
        prev.map(b => b.id === bookingId ? { ...b, status: 'cancelled' as const } : b)
      );
    } catch (err) {
      console.error('Failed to cancel booking:', err);
    }
  };

  const getRoomName = (booking: Booking): string => {
    if (!booking.room) return `Room #${booking.room_id}`;
    if (lang === 'en') return booking.room.name_en;
    if (lang === 'kg') return booking.room.name_kg;
    return booking.room.name_ru;
  };

  const getStatusLabel = (status: Booking['status']): string => {
    const map: Record<Booking['status'], string> = {
      pending: t('status_pending'),
      confirmed: t('status_confirmed'),
      cancelled: t('status_cancelled'),
      completed: t('status_completed'),
    };
    return map[status] || status;
  };

  const formatDate = (dateStr: string): string => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(lang === 'en' ? 'en-GB' : 'ru-RU', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  };

  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined;
  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email || '';
  const initials = displayName.slice(0, 2).toUpperCase();

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* Profile Header */}
        <div className="profile-header">
          <div className="profile-avatar">
            {avatarUrl
              ? <img src={avatarUrl} alt="avatar" />
              : <div className="profile-avatar-placeholder">{initials}</div>
            }
          </div>
          <div className="profile-info">
            <h2>{displayName}</h2>
            <p>{user.email}</p>
            <span className={`profile-badge ${profile?.role === 'admin' ? 'admin' : 'guest'}`}>
              {profile?.role === 'admin' ? 'Admin' : 'Guest'}
            </span>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {profile?.role === 'admin' && (
              <button className="btn-gold" style={{ padding: '10px 20px', fontSize: 13 }} onClick={() => navigate('/admin')}>
                {t('admin_panel')}
              </button>
            )}
            <button
              className="btn-outline"
              style={{ padding: '10px 20px', fontSize: 13, borderColor: 'rgba(255,255,255,0.4)' }}
              onClick={async () => { await signOut(); navigate('/'); }}
            >
              {t('sign_out')}
            </button>
          </div>
        </div>

        {/* Bookings */}
        <div className="bookings-section">
          <h3>{t('my_bookings')}</h3>

          {loadingBookings ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <div className="loading-spinner" style={{ margin: '0 auto' }}></div>
            </div>
          ) : bookings.length === 0 ? (
            <div className="no-bookings">
              <div className="no-bookings-icon">🏨</div>
              <p>{t('no_bookings')}</p>
              <p style={{ fontSize: 14, marginTop: 8, marginBottom: 20 }}>{t('no_bookings_sub')}</p>
              <button className="btn-gold" style={{ padding: '12px 28px' }} onClick={() => navigate('/')}>
                {t('book')}
              </button>
            </div>
          ) : (
            bookings.map(booking => (
              <div key={booking.id} className="booking-card">
                <div>
                  <div className="booking-room-name">{getRoomName(booking)}</div>
                  <div className="booking-dates">
                    📅 {formatDate(booking.check_in)} → {formatDate(booking.check_out)}
                  </div>
                  <div className="booking-price-info">
                    🌙 {booking.nights} {t('booking_nights')} &nbsp;•&nbsp;
                    <strong>{formatPrice(booking.total_price_kgs || 0)}</strong>
                  </div>
                  <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
                    {t('booking_ref')}: {booking.id.substring(0, 8).toUpperCase()}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                  <span className={`status-badge ${booking.status}`}>
                    {getStatusLabel(booking.status)}
                  </span>
                  {booking.status === 'pending' && (
                    <button
                      className="cancel-btn"
                      onClick={() => cancelBooking(booking.id)}
                    >
                      {t('cancel_booking')}
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

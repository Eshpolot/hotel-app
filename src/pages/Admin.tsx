import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase, Booking } from '../lib/supabase';

type StatusFilter = 'all' | 'pending' | 'confirmed' | 'cancelled' | 'completed';

export default function Admin() {
  const { user, profile, isLoading } = useAuth();
  const { t, formatPrice, lang } = useLanguage();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filtered, setFiltered] = useState<Booking[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!isLoading) {
      if (!user) { navigate('/'); return; }
      if (profile && profile.role !== 'admin') { navigate('/'); return; }
    }
  }, [user, profile, isLoading, navigate]);

  useEffect(() => {
    if (user && profile?.role === 'admin') fetchAllBookings();
  }, [user, profile]);

  useEffect(() => {
    let list = [...bookings];
    if (statusFilter !== 'all') list = list.filter(b => b.status === statusFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(b =>
        b.guest_name.toLowerCase().includes(q) ||
        b.guest_email.toLowerCase().includes(q)
      );
    }
    setFiltered(list);
  }, [bookings, statusFilter, searchQuery]);

  const fetchAllBookings = async () => {
    setLoadingData(true);
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*, room:rooms(*)')
        .order('created_at', { ascending: false });
      if (!error && data) setBookings(data as Booking[]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingData(false);
    }
  };

  const updateStatus = async (bookingId: string, newStatus: Booking['status']) => {
    try {
      await supabase.from('bookings').update({ status: newStatus }).eq('id', bookingId);
      setBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status: newStatus } : b));
    } catch (err) {
      console.error(err);
    }
  };

  // Stats
  const now = new Date();
  const thisMonth = bookings.filter(b => {
    const d = new Date(b.created_at);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const confirmedMonth = thisMonth.filter(b => b.status === 'confirmed' || b.status === 'completed');
  const revenue = confirmedMonth.reduce((s, b) => s + (b.total_price_kgs || 0), 0);
  const activeGuests = new Set(bookings.filter(b => b.status !== 'cancelled').map(b => b.user_id)).size;

  const getRoomName = (booking: Booking): string => {
    if (!booking.room) return `#${booking.room_id}`;
    if (lang === 'en') return booking.room.name_en;
    if (lang === 'kg') return booking.room.name_kg;
    return booking.room.name_ru;
  };

  const formatDate = (dateStr: string): string =>
    new Date(dateStr).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit' });

  if (isLoading || loadingData) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!user || profile?.role !== 'admin') return null;

  const statuses: StatusFilter[] = ['all', 'pending', 'confirmed', 'cancelled', 'completed'];
  const statusLabels: Record<StatusFilter, string> = {
    all: t('all_statuses'),
    pending: t('status_pending'),
    confirmed: t('status_confirmed'),
    cancelled: t('status_cancelled'),
    completed: t('status_completed'),
  };

  return (
    <div className="admin-page">
      <div className="admin-container">
        {/* Header */}
        <div className="admin-header">
          <h1>{t('admin_title')}</h1>
          <p>{t('admin_subtitle')}</p>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-card-icon gold">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
                <rect x="9" y="3" width="6" height="4" rx="2"/>
              </svg>
            </div>
            <h3>{t('stat_total')}</h3>
            <div className="stat-card-value">{thisMonth.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon green">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20,6 9,17 4,12"/>
              </svg>
            </div>
            <h3>{t('stat_confirmed')}</h3>
            <div className="stat-card-value">{confirmedMonth.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon blue">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="1" x2="12" y2="23"/>
                <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
              </svg>
            </div>
            <h3>{t('stat_revenue')}</h3>
            <div className="stat-card-value">{formatPrice(revenue)}</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon red">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 00-3-3.87"/>
                <path d="M16 3.13a4 4 0 010 7.75"/>
              </svg>
            </div>
            <h3>{t('stat_guests')}</h3>
            <div className="stat-card-value">{activeGuests}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="admin-filters">
          {statuses.map(s => (
            <button
              key={s}
              className={`filter-pill ${statusFilter === s ? 'active' : ''}`}
              onClick={() => setStatusFilter(s)}
            >
              {statusLabels[s]}
            </button>
          ))}
          <input
            className="admin-search"
            placeholder={t('search_bookings')}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Table */}
        <div className="bookings-table-wrapper">
          <table className="bookings-table">
            <thead>
              <tr>
                <th>{t('col_date')}</th>
                <th>{t('col_guest')}</th>
                <th>{t('col_room')}</th>
                <th>{t('col_dates')}</th>
                <th>{t('col_nights')}</th>
                <th>{t('col_total')}</th>
                <th>{t('col_status')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>
                    No bookings found
                  </td>
                </tr>
              ) : (
                filtered.map(booking => (
                  <tr key={booking.id}>
                    <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                      {formatDate(booking.created_at)}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{booking.guest_name}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{booking.guest_email}</div>
                    </td>
                    <td>{getRoomName(booking)}</td>
                    <td style={{ fontSize: 13 }}>
                      {formatDate(booking.check_in)} →<br />{formatDate(booking.check_out)}
                    </td>
                    <td style={{ textAlign: 'center' }}>{booking.nights}</td>
                    <td style={{ fontWeight: 600, color: 'var(--primary)' }}>
                      {formatPrice(booking.total_price_kgs || 0)}
                    </td>
                    <td>
                      <select
                        className={`status-select ${booking.status}`}
                        value={booking.status}
                        onChange={e => updateStatus(booking.id, e.target.value as Booking['status'])}
                      >
                        <option value="pending">{t('status_pending')}</option>
                        <option value="confirmed">{t('status_confirmed')}</option>
                        <option value="completed">{t('status_completed')}</option>
                        <option value="cancelled">{t('status_cancelled')}</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

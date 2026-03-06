import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

export default function UserMenu() {
  const { user, profile, signOut } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!user) return null;

  const avatarUrl = profile?.avatar_url || (user.user_metadata?.avatar_url as string | undefined);
  const displayName = profile?.full_name || (user.user_metadata?.full_name as string | undefined) || user.email || '';
  const initials = displayName.slice(0, 2).toUpperCase();

  const handleSignOut = async () => {
    setOpen(false);
    await signOut();
    navigate('/');
  };

  return (
    <div className="user-menu-wrapper" ref={ref}>
      <button className="user-avatar-btn" onClick={() => setOpen(!open)} aria-label="User menu">
        {avatarUrl ? (
          <img src={avatarUrl} alt="avatar" />
        ) : (
          <div className="user-initials">{initials}</div>
        )}
      </button>

      {open && (
        <div className="user-dropdown">
          <div className="user-dropdown-name">
            <strong>{displayName}</strong>
            <span>{user.email}</span>
          </div>

          <button className="user-dropdown-item" onClick={() => { setOpen(false); navigate('/profile'); }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            {t('my_profile')}
          </button>

          {profile?.role === 'admin' && (
            <button className="user-dropdown-item" onClick={() => { setOpen(false); navigate('/admin'); }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
              {t('admin_panel')}
            </button>
          )}

          <div className="user-dropdown-divider"></div>

          <button className="user-dropdown-item danger" onClick={handleSignOut}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            {t('sign_out')}
          </button>
        </div>
      )}
    </div>
  );
}

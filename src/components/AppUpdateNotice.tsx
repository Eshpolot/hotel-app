import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

export const buildId: string = import.meta.env.VITE_APP_BUILD_ID || 'development';

export function BuildInfo() {
  return <small className="build-info" title={buildId}>ALAY ART · {buildId}</small>;
}

/** Never reload a guest's open form automatically. Offer an explicit update. */
export default function AppUpdateNotice() {
  const { pathname } = useLocation();
  const { lang } = useLanguage();
  const [updateAvailable, setUpdateAvailable] = useState(false);
  useEffect(() => {
    let active = true;
    let checking = false;
    let controller: AbortController | undefined;
    const check = async () => {
      if (document.visibilityState !== 'visible' || checking) return;
      checking = true;
      const request = new AbortController();
      controller = request;
      const timeout = window.setTimeout(() => request.abort(), 8000);
      try {
        const result = await fetch(`/version.json?current=${encodeURIComponent(buildId)}`, { cache: 'no-store', signal: request.signal });
        if (!result.ok) return;
        const version = await result.json();
        if (active && typeof version.id === 'string') setUpdateAvailable(version.id !== buildId);
      } catch { /* Offline: keep the existing page and form intact. */ }
      finally { window.clearTimeout(timeout); checking = false; }
    };
    void check();
    const timer = window.setInterval(check, 90000);
    document.addEventListener('visibilitychange', check);
    return () => { active = false; controller?.abort(); window.clearInterval(timer); document.removeEventListener('visibilitychange', check); };
  }, [pathname]);
  if (!updateAvailable) return null;
  const text = lang === 'en'
    ? ['A new version is available. Finish your current action before updating.', 'Update website']
    : lang === 'kg'
      ? ['Жаңы версия бар. Жаңылоодон мурун учурдагы аракетти бүтүрүңүз.', 'Сайтты жаңылоо']
      : ['Доступна новая версия. Перед обновлением завершите текущее действие.', 'Обновить сайт'];
  return <aside className="app-update-notice" role="status">
    <span>{text[0]}</span>
    <button onClick={() => {
      const url = new URL(window.location.href);
      url.searchParams.set('app-refresh', Date.now().toString(36));
      window.location.assign(url.href);
    }}>{text[1]}</button>
  </aside>;
}

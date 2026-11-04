import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, Check, ChevronRight, Expand, MessageCircle, Share2, ShieldCheck, Users, X } from 'lucide-react';
import { useRooms } from '../hooks/useRooms';
import { useDialog } from '../hooks/useDialog';
import { useLanguage } from '../contexts/LanguageContext';
import { roomPhoto } from '../lib/roomMedia';
import { isCalendarDate, nextDay, stayNights, today, validStay } from '../lib/booking';
import BookingModal from '../components/BookingModal';
import Footer from '../components/Footer';

export default function RoomDetail() {
  const { roomId } = useParams();
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const { rooms, loading, error, loadRooms } = useRooms();
  const { lang, t, currency, formatPrice } = useLanguage();
  const copy = (ru: string, en: string, kg: string) => lang === 'en' ? en : lang === 'kg' ? kg : ru;
  const room = rooms.find(r => String(r.id) === roomId);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [photoOpen, setPhotoOpen] = useState(false);
  const [shareState, setShareState] = useState<'idle' | 'copied' | 'manual'>('idle');
  const [sharedUrl, setSharedUrl] = useState('');
  const [photoFailed, setPhotoFailed] = useState(false);
  const dialogRef = useDialog(photoOpen);
  const checkIn = isCalendarDate(params.get('checkIn') || '') ? params.get('checkIn')! : today();
  const checkOut = isCalendarDate(params.get('checkOut') || '') ? params.get('checkOut')! : nextDay(checkIn);
  const requestedGuests = Number(params.get('guests') || 1);
  const guests = Number.isInteger(requestedGuests) && requestedGuests > 0 ? Math.min(requestedGuests, room?.capacity || 1) : 1;
  const valid = validStay(checkIn, checkOut);
  const nights = valid ? stayNights(checkIn, checkOut) : 0;
  const name = room ? (lang === 'en' ? room.name_en : lang === 'kg' ? room.name_kg : room.name_ru) : '';
  const description = room ? (lang === 'en' ? room.description_en : lang === 'kg' ? room.description_kg : room.description_ru) : '';

  useEffect(() => {
    window.scrollTo(0, 0); setPhotoOpen(false); setPhotoFailed(false); setBookingOpen(false); setShareState('idle');
  }, [roomId]);
  useEffect(() => {
    const previous = document.title;
    document.title = name ? `${name} — ALAY ART Hotel, Osh` : 'ALAY ART Hotel';
    return () => { document.title = previous; };
  }, [name]);
  useEffect(() => {
    if (!photoOpen) return;
    const close = (e: KeyboardEvent) => { if (e.key === 'Escape') setPhotoOpen(false); };
    document.addEventListener('keydown', close);
    return () => document.removeEventListener('keydown', close);
  }, [photoOpen]);

  const updateDates = (changes: Record<string, string>) => {
    setShareState('idle');
    setParams({ checkIn, checkOut, guests: String(guests), ...changes }, { replace: true });
  };
  const share = async () => {
    const url = new URL(window.location.href);
    url.search = new URLSearchParams({ checkIn, checkOut, guests: String(guests) }).toString();
    setSharedUrl(url.href);
    try { await navigator.clipboard.writeText(url.href); setShareState('copied'); }
    catch { setShareState('manual'); }
  };

  if (!room) return <main className="room-detail detail-empty">
    <span className="detail-eyebrow">ALAY ART HOTEL</span>
    <h1>{loading ? copy('Ищем ваш номер…', 'Finding your room…', 'Бөлмө изделүүдө…') : error ? copy('Не удалось проверить номер', 'Unable to check this room', 'Бөлмөнү текшерүү мүмкүн эмес') : copy('Номер не найден', 'Room not found', 'Бөлмө табылган жок')}</h1>
    <p>{copy('Посмотрите другие номера или свяжитесь с отелем.', 'Explore other rooms or contact the hotel.', 'Башка бөлмөлөрдү көрүңүз же мейманканага кайрылыңыз.')}</p>
    {error && <button className="detail-secondary" onClick={loadRooms}>{copy('Повторить', 'Retry', 'Кайталоо')}</button>}
    <Link className="detail-primary" to="/rooms">{copy('Все номера', 'All rooms', 'Бардык бөлмөлөр')}</Link>
  </main>;

  const photo = roomPhoto(room);
  const decorative = photo === '/images/ornament.webp' || photo === '/room-placeholder.svg';
  const photoLabel = decorative ? copy('Орнамент · фото номера уточняется', 'Ornament · room photo pending', 'Оймо · бөлмөнүн сүрөтү такталууда') : copy('Фотография из каталога отеля', 'Image from the hotel catalogue', 'Мейманкананын каталогундагы сүрөт');
  const contactUrl = 'https://wa.me/996550323070?text=' + encodeURIComponent(`ALAY ART: ${name}. ${checkIn} → ${checkOut}. ${guests} guests. Уточните наличие и условия проживания.`);
  const amenities = Array.isArray(room.amenities) ? room.amenities.filter(a => typeof a === 'string') : [];

  return <>
    <main className="room-detail">
      <nav className="detail-breadcrumb" aria-label={copy('Навигация', 'Breadcrumb', 'Багыт')}>
        <Link to="/">ALAY ART</Link><ChevronRight size={13}/><Link to="/rooms">{t('rooms')}</Link><ChevronRight size={13}/><span aria-current="page">{name}</span>
      </nav>
      <div className="detail-heading">
        <div><span className="detail-eyebrow">OSH, KYRGYZSTAN · ALAY ART HOTEL</span><h1>{name}</h1><p>{copy('Кыргызский характер. Ваше личное пространство.', 'Kyrgyz character. Your own space to unwind.', 'Кыргыз мүнөзү. Сиздин жеке эс алуу жайыңыз.')}</p></div>
        <button className="detail-share" onClick={share}><Share2 size={17}/>{shareState === 'copied' ? copy('Ссылка скопирована', 'Link copied', 'Шилтеме көчүрүлдү') : copy('Поделиться', 'Share this stay', 'Бөлүшүү')}</button>
      </div>
      <div role="status" className="detail-share-status">{shareState === 'manual' && <label>{copy('Скопируйте ссылку с датами', 'Copy the link with your dates', 'Күндөрү бар шилтемени көчүрүңүз')}<input readOnly value={sharedUrl} onFocus={e => e.target.select()}/></label>}</div>
      <div className="detail-layout">
        <div className="detail-main">
          <figure className="detail-photo">
            <button onClick={() => setPhotoOpen(true)} aria-label={copy('Открыть фотографию', 'Open photograph', 'Сүрөттү ачуу')}>
              <img src={photoFailed ? '/room-placeholder.svg' : photo} onError={() => setPhotoFailed(true)} alt={decorative ? photoLabel : name} fetchPriority="high"/>
              <span className="detail-expand"><Expand size={17}/>{copy('Рассмотреть фото', 'View full image', 'Сүрөттү көрүү')}</span>
            </button>
            <figcaption>{photoFailed ? copy('Фото временно недоступно', 'Image temporarily unavailable', 'Сүрөт убактылуу жеткиликсиз') : photoLabel}</figcaption>
          </figure>
          <div className="detail-facts"><span><Users size={21}/>{copy('До', 'Up to', 'Эң көп')} {room.capacity} {copy('гостей', 'guests', 'конок')}</span><span><ShieldCheck size={21}/>{copy('Прямое бронирование', 'Book with the hotel', 'Түз брондоо')}</span></div>
          <section className="detail-section" aria-labelledby="about-room"><span className="detail-eyebrow">01 / {copy('ВАШ ОТДЫХ', 'YOUR STAY', 'ЭС АЛУУ')}</span><h2 id="about-room">{copy('Место для вашей истории', 'Make yourself at home', 'Өз үйүңүздөй болуңуз')}</h2><p>{description}</p>
            {amenities.length > 0 && <ul className="detail-amenities">{amenities.map((a, i) => <li key={`${a}-${i}`}><Check size={16}/>{a}</li>)}</ul>}
            <p className="detail-muted">{copy('Площадь, тип кроватей, комплектацию ванной и включённое питание уточните у отеля перед подтверждением.', 'Please confirm floor area, bed configuration, bathroom facilities and included meals with the hotel before confirmation.', 'Бөлмөнүн аянтын, керебеттерди, жуунучу бөлмөнү жана тамактанууну мейманканадан тактаңыз.')}</p>
          </section>
          <section className="detail-section" aria-labelledby="stay-terms"><span className="detail-eyebrow">02 / {copy('ПОЛЕЗНО ЗНАТЬ', 'GOOD TO KNOW', 'БИЛҮҮ ПАЙДАЛУУ')}</span><h2 id="stay-terms">{copy('Спокойствие — в деталях', 'A clear plan for your stay', 'Эс алуунун чоо-жайы')}</h2>
            <div className="detail-terms"><article><span>01</span><h3>{copy('Заявка, затем подтверждение', 'Request, then confirmation', 'Өтүнмө жана ырастоо')}</h3><p>{copy('Отель проверит наличие и свяжется с вами. Отправка заявки не гарантирует свободный номер.', 'The hotel checks availability and contacts you. Sending a request does not guarantee a room.', 'Мейманкана бош бөлмөнү текшерип, сиз менен байланышат. Өтүнмө бош бөлмөгө кепилдик бербейт.')}</p></article>
            <article><span>02</span><h3>{copy('Без онлайн-списания', 'No online charge', 'Онлайн төлөм жок')}</h3><p>{copy('Данные карты не нужны. Оплату, время заезда и правила отмены согласуйте с отелем.', 'No card details required. Agree payment, arrival time and cancellation terms with the hotel.', 'Карта маалыматы керек эмес. Төлөм, келүү убактысы жана жокко чыгаруу шарттарын тактаңыз.')}</p></article></div>
          </section>
          <div className="detail-help"><MessageCircle size={26}/><div><h3>{copy('Особенные пожелания?', 'Something special in mind?', 'Өзгөчө каалоолор барбы?')}</h3><p>{copy('Путешествуете с ребёнком или планируете поздний заезд? Обсудим детали.', 'Travelling with children or arriving late? Let’s discuss the details.', 'Балдар менен келесизби же кеч келесизби? Чоо-жайын талкуулайлы.')}</p></div><a href={contactUrl} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"><ArrowUpRight/></a></div>
        </div>
        <aside className="detail-reservation" aria-label={copy('Ваше проживание', 'Your stay', 'Сиздин эс алууңуз')}>
          <span className="detail-eyebrow">{copy('ВАШЕ ПРОЖИВАНИЕ', 'YOUR STAY', 'СИЗДИН ЭС АЛУУҢУЗ')}</span>
          <div className="detail-price">{(loading || error) && currency === 'KGS' && '≈ '}{formatPrice(room.price_kgs)}<small>/ {t('per_night')}</small></div>
          <p className="detail-rate-note">{copy('Расчёт в KGS. USD — ориентировочно.', 'Priced in KGS. USD is indicative.', 'Эсеп KGS менен. USD — болжолдуу.')}</p>
          <form onSubmit={e => { e.preventDefault(); if (valid && !loading && !error) setBookingOpen(true); }}>
            <div className="detail-date-grid">
              <label>{t('booking_checkin')}<input type="date" required min={today()} value={checkIn} onChange={e => { if (isCalendarDate(e.target.value)) updateDates({ checkIn: e.target.value, ...(checkOut <= e.target.value ? {checkOut: nextDay(e.target.value)} : {}) }); }}/></label>
              <label>{t('booking_checkout')}<input type="date" required min={nextDay(checkIn)} value={checkOut} onChange={e => { if (isCalendarDate(e.target.value)) updateDates({ checkOut: e.target.value }); }}/></label>
            </div>
            <label htmlFor="detail-guests">{t('booking_guests')}</label><select id="detail-guests" value={guests} onChange={e => updateDates({guests: e.target.value})}>{Array.from({length: room.capacity}, (_, i) => <option key={i + 1} value={i + 1}>{i + 1}</option>)}</select>
            {!valid && <p className="detail-validation" role="alert">{copy('Выберите от 1 до 90 ночей. Заезд — не раньше сегодня.', 'Choose 1–90 nights, arriving today or later.', '1–90 түн тандаңыз. Кирүү бүгүн же кийин болсун.')}</p>}
            {valid && <div className="detail-calculation"><div><span>{formatPrice(room.price_kgs)} × {nights} {t('booking_nights')}</span><span>{formatPrice(room.price_kgs * nights)}</span></div><div className="detail-total"><span>{t('booking_total')}</span><strong>{(loading || error) && currency === 'KGS' && '≈ '}{formatPrice(room.price_kgs * nights)}</strong></div></div>}
            <button className="detail-primary" type="submit" disabled={!valid || loading || error}>{loading ? copy('Обновляем цены…', 'Refreshing prices…', 'Баалар жаңыланууда…') : copy('Оставить заявку', 'Request this room', 'Өтүнмө жөнөтүү')}<ArrowUpRight size={18}/></button>
          </form>
          {error && <div className="detail-offline" role="alert"><p>{copy('Показан сохранённый каталог. Актуальную цену и наличие уточните у отеля.', 'Showing saved catalogue. Confirm current price and availability with the hotel.', 'Сакталган каталог көрсөтүлдү. Бааны жана бош бөлмөнү мейманканадан тактаңыз.')}</p><button onClick={loadRooms}>{copy('Повторить загрузку', 'Try again', 'Кайра жүктөө')}</button></div>}
          <a className="detail-secondary" href={contactUrl} target="_blank" rel="noopener noreferrer"><MessageCircle size={17}/>{copy('Обсудить в WhatsApp', 'Ask on WhatsApp', 'WhatsApp аркылуу суроо')}</a>
          <p className="detail-reassurance"><ShieldCheck size={15}/>{copy('Без карты. Подтверждение от отеля.', 'No card. Confirmed by the hotel.', 'Картасыз. Мейманкана ырастайт.')}</p>
        </aside>
      </div>
      <Link className="detail-back" to="/rooms"><ArrowLeft size={17}/>{copy('Посмотреть другие номера', 'Explore other rooms', 'Башка бөлмөлөрдү көрүү')}</Link>
    </main>
    <Footer onNavClick={id => navigate(`/#${id}`)}/>
    <BookingModal isOpen={bookingOpen && !error && !loading} onClose={() => setBookingOpen(false)} room={room} initialCheckIn={checkIn} initialCheckOut={checkOut} initialGuests={guests}/>
    {photoOpen && <div className="photo-viewer" onClick={e => { if (e.target === e.currentTarget) setPhotoOpen(false); }}><div className="photo-viewer-dialog" role="dialog" aria-modal="true" aria-label={photoLabel} ref={dialogRef}><button className="photo-viewer-close" onClick={() => setPhotoOpen(false)} aria-label={copy('Закрыть фото', 'Close photograph', 'Сүрөттү жабуу')}><X/></button><img src={photoFailed ? '/room-placeholder.svg' : photo} onError={() => setPhotoFailed(true)} alt={decorative ? photoLabel : name}/><p>{photoLabel}</p></div></div>}
  </>;
}

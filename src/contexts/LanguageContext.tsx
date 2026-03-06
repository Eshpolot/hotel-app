import { createContext, useContext, useState, ReactNode } from 'react';

type Lang = 'ru' | 'en' | 'kg';
type Currency = 'KGS' | 'USD';

const KGS_TO_USD = 0.011;

const translations: Record<Lang, Record<string, string>> = {
  ru: {
    home: 'Главная', rooms: 'Номера', national_cuisine: 'Национальная кухня',
    conference: 'Конференц-зал', contacts: 'Контакты', login: 'Войти',
    welcome: 'Добро пожаловать в', slogan: 'Этно-стиль, комфорт и незабываемые впечатления в сердце Кыргызстана.',
    book: 'Забронировать', explore: 'Узнать больше', hero_badge: 'Этно-стиль & Комфорт',
    breakfast: 'Завтрак', breakfast_text: 'Свежие блюда каждое утро, приготовленные из местных продуктов.',
    wifi: 'Wi-Fi', wifi_text: 'Высокоскоростной бесплатный интернет во всех номерах и зонах отеля.',
    comfort: 'Комфорт', comfort_text: 'Современные номера с уникальным этно-дизайном и премиум удобствами.',
    national_cuisine_text: 'Лучшие блюда кыргызской кухни от наших шеф-поваров.',
    features_label: 'Наши преимущества', features_title: 'Всё для вашего комфорта',
    features_desc: 'Мы позаботились о каждой детали, чтобы сделать ваш отдых незабываемым.',
    rooms_label: 'Номера', rooms_title: 'Выберите ваш идеальный номер',
    rooms_desc: 'Каждый номер оформлен в уникальном кыргызском этно-стиле с современными удобствами.',
    popular: 'Популярный', per_night: 'ночь', kids_friendly: 'Для детей',
    why_label: 'Почему мы', why_title: 'Почему гости выбирают нас',
    why_desc: 'Мы создаём незабываемые впечатления, сочетая традиции и современность.',
    why_location: 'Идеальная локация', why_location_text: 'В самом центре города Ош — исторического сердца Кыргызстана.',
    why_service: 'Сервис 5 звёзд', why_service_text: 'Индивидуальный подход к каждому гостю и круглосуточное обслуживание.',
    why_safety: 'Безопасность', why_safety_text: 'Круглосуточная охрана и видеонаблюдение для вашего спокойствия.',
    why_ethno: 'Этно-стиль', why_ethno_text: 'Уникальный кыргызский дизайн — шырдаки, войлок и национальные орнаменты.',
    exp_label: 'Услуги', exp_title: 'Наши услуги', exp_desc: 'Дополнительные удобства для идеального пребывания.',
    summer_kitchen: 'Летняя кухня', summer_kitchen_text: 'Блюда на мангале на свежем воздухе',
    rest_zone: 'Зона отдыха', rest_zone_text: 'Уютное место для расслабления и тишины',
    conference_text: 'Современное оборудование для мероприятий',
    reviews_label: 'Отзывы', reviews_title: 'Что говорят наши гости',
    cta_title: 'Забронируйте незабываемый отдых',
    cta_desc: 'Позвоните нам или забронируйте онлайн. Лучшие цены — только на нашем сайте.',
    call_us: 'Позвонить: +996 550 323 070',
    contact_label: 'Контакты', contact_title: 'Свяжитесь с нами',
    address_label: 'Адрес', phone_label: 'Телефон', hours_label: 'Режим работы',
    hours_text: 'Круглосуточно, 24/7', view_map: 'Открыть на карте →',
    footer_about: 'Этно-стиль, комфорт и незабываемые впечатления в самом сердце Кыргызстана.',
    footer_nav: 'Навигация', footer_services: 'Услуги', footer_contact: 'Контакты',
    footer: '© 2026 ALAY ART Hotel. Все права защищены.',
    search: 'Поиск', search_placeholder: 'Найти...', guests_placeholder: '1 номер, 2 взрослых...',
    no_account: 'Нет аккаунта? ', register: 'Зарегистрироваться', or: 'или',
    password_label: 'Пароль', google_login: 'Войти через Google',
    register_title: 'Регистрация', has_account: 'Уже есть аккаунт? ', login_link: 'Войти',
    full_name_label: 'Имя и фамилия',
    booking_title: 'Бронирование номера', booking_guest_name: 'Имя гостя',
    booking_email: 'Email', booking_phone: 'Телефон', booking_checkin: 'Дата заезда',
    booking_checkout: 'Дата выезда', booking_guests: 'Количество гостей',
    booking_nights: 'Ночей', booking_total: 'Итого',
    booking_submit: 'Подтвердить бронирование', booking_checking: 'Проверяем доступность...',
    booking_unavailable: 'К сожалению, номер недоступен на выбранные даты.',
    booking_success_title: 'Бронирование подтверждено!',
    booking_success_text: 'Ваш номер забронирован. Мы свяжемся с вами для подтверждения.',
    booking_ref: 'Номер брони',
    profile_title: 'Личный кабинет', my_bookings: 'Мои бронирования',
    no_bookings: 'У вас пока нет бронирований', no_bookings_sub: 'Забронируйте номер и начните своё путешествие',
    cancel_booking: 'Отменить', cancel_confirm: 'Вы уверены, что хотите отменить бронирование?',
    status_pending: 'Ожидает', status_confirmed: 'Подтверждено', status_cancelled: 'Отменено', status_completed: 'Завершено',
    admin_title: 'Панель администратора', admin_subtitle: 'Управление бронированиями и гостями',
    stat_total: 'Всего броней', stat_confirmed: 'Подтверждено', stat_revenue: 'Выручка (месяц)', stat_guests: 'Активных гостей',
    all_statuses: 'Все', search_bookings: 'Поиск по гостю или email...',
    col_date: 'Дата', col_guest: 'Гость', col_room: 'Номер', col_dates: 'Даты',
    col_nights: 'Ночей', col_total: 'Сумма', col_status: 'Статус',
    sign_out: 'Выйти', my_profile: 'Мой профиль', admin_panel: 'Панель админа',
    need_auth: 'Необходима авторизация', need_auth_text: 'Войдите, чтобы забронировать номер',
    login_to_book: 'Войти и забронировать',
    check_in: 'Заезд', check_out: 'Выезд',
  },
  en: {
    home: 'Home', rooms: 'Rooms', national_cuisine: 'National Cuisine',
    conference: 'Conference Hall', contacts: 'Contacts', login: 'Login',
    welcome: 'Welcome to', slogan: 'Ethno-style, comfort and unforgettable impressions in the heart of Kyrgyzstan.',
    book: 'Book Now', explore: 'Learn More', hero_badge: 'Ethno-style & Comfort',
    breakfast: 'Breakfast', breakfast_text: 'Fresh dishes every morning prepared from local ingredients.',
    wifi: 'Wi-Fi', wifi_text: 'High-speed free internet in all rooms and hotel areas.',
    comfort: 'Comfort', comfort_text: 'Modern rooms with unique ethno design and premium amenities.',
    national_cuisine_text: 'The best Kyrgyz cuisine dishes from our chefs.',
    features_label: 'Our Advantages', features_title: 'Everything for Your Comfort',
    features_desc: 'We have taken care of every detail to make your stay unforgettable.',
    rooms_label: 'Rooms', rooms_title: 'Choose Your Perfect Room',
    rooms_desc: 'Each room is decorated in a unique Kyrgyz ethno-style with modern amenities.',
    popular: 'Popular', per_night: 'night', kids_friendly: 'Kid-friendly',
    why_label: 'Why Us', why_title: 'Why Guests Choose Us',
    why_desc: 'We create unforgettable experiences combining traditions and modernity.',
    why_location: 'Perfect Location', why_location_text: 'In the very center of Osh — the historic heart of Kyrgyzstan.',
    why_service: '5-Star Service', why_service_text: 'Individual approach to each guest and 24/7 service.',
    why_safety: 'Security', why_safety_text: '24/7 security and video surveillance for your peace of mind.',
    why_ethno: 'Ethno Style', why_ethno_text: 'Unique Kyrgyz design — shyrdaks, felt and national ornaments.',
    exp_label: 'Services', exp_title: 'Our Services', exp_desc: 'Additional amenities for a perfect stay.',
    summer_kitchen: 'Summer Kitchen', summer_kitchen_text: 'Grilled dishes in the open air',
    rest_zone: 'Rest Zone', rest_zone_text: 'A cozy place for relaxation and tranquility',
    conference_text: 'Modern equipment for events',
    reviews_label: 'Reviews', reviews_title: 'What Our Guests Say',
    cta_title: 'Book an Unforgettable Vacation',
    cta_desc: 'Call us or book online. Best prices — only on our website.',
    call_us: 'Call: +996 550 323 070',
    contact_label: 'Contacts', contact_title: 'Get in Touch',
    address_label: 'Address', phone_label: 'Phone', hours_label: 'Working Hours',
    hours_text: '24/7, Round the clock', view_map: 'View on Map →',
    footer_about: 'Ethno-style, comfort and unforgettable experiences in the very heart of Kyrgyzstan.',
    footer_nav: 'Navigation', footer_services: 'Services', footer_contact: 'Contacts',
    footer: '© 2026 ALAY ART Hotel. All rights reserved.',
    search: 'Search', search_placeholder: 'Find...', guests_placeholder: '1 room, 2 adults...',
    no_account: 'No account? ', register: 'Register', or: 'or',
    password_label: 'Password', google_login: 'Sign in with Google',
    register_title: 'Register', has_account: 'Already have an account? ', login_link: 'Login',
    full_name_label: 'Full Name',
    booking_title: 'Book a Room', booking_guest_name: 'Guest Name',
    booking_email: 'Email', booking_phone: 'Phone', booking_checkin: 'Check-in Date',
    booking_checkout: 'Check-out Date', booking_guests: 'Number of Guests',
    booking_nights: 'Nights', booking_total: 'Total',
    booking_submit: 'Confirm Booking', booking_checking: 'Checking availability...',
    booking_unavailable: 'Sorry, the room is not available for the selected dates.',
    booking_success_title: 'Booking Confirmed!',
    booking_success_text: 'Your room is booked. We will contact you to confirm.',
    booking_ref: 'Booking Reference',
    profile_title: 'My Profile', my_bookings: 'My Bookings',
    no_bookings: 'No bookings yet', no_bookings_sub: 'Book a room and start your journey',
    cancel_booking: 'Cancel', cancel_confirm: 'Are you sure you want to cancel this booking?',
    status_pending: 'Pending', status_confirmed: 'Confirmed', status_cancelled: 'Cancelled', status_completed: 'Completed',
    admin_title: 'Admin Panel', admin_subtitle: 'Manage bookings and guests',
    stat_total: 'Total Bookings', stat_confirmed: 'Confirmed', stat_revenue: 'Revenue (month)', stat_guests: 'Active Guests',
    all_statuses: 'All', search_bookings: 'Search by guest or email...',
    col_date: 'Date', col_guest: 'Guest', col_room: 'Room', col_dates: 'Dates',
    col_nights: 'Nights', col_total: 'Total', col_status: 'Status',
    sign_out: 'Sign Out', my_profile: 'My Profile', admin_panel: 'Admin Panel',
    need_auth: 'Authentication Required', need_auth_text: 'Please login to book a room',
    login_to_book: 'Login & Book',
    check_in: 'Check-in', check_out: 'Check-out',
  },
  kg: {
    home: 'Башкы бет', rooms: 'Бөлмөлөр', national_cuisine: 'Улуттук тамак-аш',
    conference: 'Конференц-зал', contacts: 'Байланыштар', login: 'Кирүү',
    welcome: 'Кош келиңиз', slogan: 'Этно-стиль, ыңгайлуулук жана Кыргызстандын жүрөгүндө унутулгус таасирлер.',
    book: 'Брондоо', explore: 'Көбүрөөк билүү', hero_badge: 'Этно-стиль & Ыңгайлуулук',
    breakfast: 'Эртең мененки тамак', breakfast_text: 'Ар күнү жергиликтүү азыктардан жаңы тамактар.',
    wifi: 'Wi-Fi', wifi_text: 'Бардык бөлмөлөрдө жана аймактарда ылдам акысыз интернет.',
    comfort: 'Ыңгайлуулук', comfort_text: 'Уникалдуу этно-дизайндагы заманбап бөлмөлөр.',
    national_cuisine_text: 'Биздин ашпозчулардан кыргыз ашканасынын мыкты тамактары.',
    features_label: 'Артыкчылыктар', features_title: 'Ыңгайлуулук үчүн баары бар',
    features_desc: 'Эс алууңузду унутулгус кылуу үчүн ар бир деталды ойлондук.',
    rooms_label: 'Бөлмөлөр', rooms_title: 'Идеалдуу бөлмөңүздү тандаңыз',
    rooms_desc: 'Ар бир бөлмө кыргыз этно-стилинде жасалгаланган.',
    popular: 'Популярдуу', per_night: 'түн', kids_friendly: 'Балдар үчүн',
    why_label: 'Эмне үчүн биз', why_title: 'Коноктор эмне үчүн бизди тандашат',
    why_desc: 'Салттарды жана заманбаптыкты айкалыштырган таасирлер.',
    why_location: 'Идеалдуу жайгашуу', why_location_text: 'Ош шаарынын борборунда.',
    why_service: '5 жылдыздуу сервис', why_service_text: 'Ар бир конокко жекече мамиле.',
    why_safety: 'Коопсуздук', why_safety_text: 'Тынчтыгыңыз үчүн 24/7 коопсуздук.',
    why_ethno: 'Этно-стиль', why_ethno_text: 'Уникалдуу кыргыз дизайны — шырдактар жана орнаменттер.',
    exp_label: 'Кызматтар', exp_title: 'Биздин кызматтар', exp_desc: 'Идеалдуу болуу үчүн кошумча ыңгайлуулуктар.',
    summer_kitchen: 'Жайкы ашкана', summer_kitchen_text: 'Ачык абада мангалда тамактар',
    rest_zone: 'Эс алуу аймагы', rest_zone_text: 'Тынчтык жана эс алуу үчүн жай',
    conference_text: 'Иш-чаралар үчүн заманбап жабдуулар',
    reviews_label: 'Пикирлер', reviews_title: 'Коноктор эмне дейт',
    cta_title: 'Унутулгус эс алуу брондоңуз',
    cta_desc: 'Бизге чалыңыз же онлайн брондоңуз.',
    call_us: 'Чалуу: +996 550 323 070',
    contact_label: 'Байланыштар', contact_title: 'Биз менен байланышыңыз',
    address_label: 'Дарек', phone_label: 'Телефон', hours_label: 'Иш убактысы',
    hours_text: 'Тегерегинде, 24/7', view_map: 'Картадан көрүү →',
    footer_about: 'Кыргызстандын жүрөгүндө этно-стиль жана ыңгайлуулук.',
    footer_nav: 'Навигация', footer_services: 'Кызматтар', footer_contact: 'Байланыштар',
    footer: '© 2026 ALAY ART мейманканасы. Бардык укуктар корголгон.',
    search: 'Издөө', search_placeholder: 'Издөө...', guests_placeholder: '1 бөлмө, 2 чоң киши...',
    no_account: 'Аккаунт жокпу? ', register: 'Катталуу', or: 'же',
    password_label: 'Сыр сөз', google_login: 'Google менен кирүү',
    register_title: 'Катталуу', has_account: 'Аккаунт барбы? ', login_link: 'Кирүү',
    full_name_label: 'Аты-жөнү',
    booking_title: 'Бөлмө брондоо', booking_guest_name: 'Конок аты',
    booking_email: 'Email', booking_phone: 'Телефон', booking_checkin: 'Кирүү датасы',
    booking_checkout: 'Чыгуу датасы', booking_guests: 'Коноктор саны',
    booking_nights: 'Түн', booking_total: 'Баары',
    booking_submit: 'Брондоону ырастоо', booking_checking: 'Жеткиликтүүлүктү текшерүү...',
    booking_unavailable: 'Тилекке каршы, тандалган күндөрдө бөлмө жеткиликтүү эмес.',
    booking_success_title: 'Бронирование ырасталды!',
    booking_success_text: 'Бөлмөңүз брондолду. Ырастоо үчүн биз сиз менен байланышабыз.',
    booking_ref: 'Бронирование номери',
    profile_title: 'Жеке кабинет', my_bookings: 'Менин брондорум',
    no_bookings: 'Бронированиелер жок', no_bookings_sub: 'Бөлмө брондоп, жолуңузду баштаңыз',
    cancel_booking: 'Жокко чыгаруу', cancel_confirm: 'Брондоону жокко чыгарыңызды ырасташыңызды суранабыз?',
    status_pending: 'Күтүлүүдө', status_confirmed: 'Ырасталды', status_cancelled: 'Жокко чыгарылды', status_completed: 'Аяктады',
    admin_title: 'Администратор панели', admin_subtitle: 'Брондоолорду жана коноктарды башкаруу',
    stat_total: 'Бардык брондоолор', stat_confirmed: 'Ырасталган', stat_revenue: 'Киреше (ай)', stat_guests: 'Активдүү коноктор',
    all_statuses: 'Бардыгы', search_bookings: 'Конок же email боюнча издөө...',
    col_date: 'Дата', col_guest: 'Конок', col_room: 'Бөлмө', col_dates: 'Даталар',
    col_nights: 'Түн', col_total: 'Сумма', col_status: 'Статус',
    sign_out: 'Чыгуу', my_profile: 'Менин профилим', admin_panel: 'Админ панели',
    need_auth: 'Авторизация талап кылынат', need_auth_text: 'Бөлмө брондоо үчүн кириңиз',
    login_to_book: 'Кирүү жана брондоо',
    check_in: 'Кирүү', check_out: 'Чыгуу',
  }
};

interface LanguageContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  currency: Currency;
  setCurrency: (c: Currency) => void;
  t: (key: string) => string;
  formatPrice: (kgs: number) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('ru');
  const [currency, setCurrency] = useState<Currency>('KGS');

  const t = (key: string): string => {
    return translations[lang][key] ?? translations['ru'][key] ?? key;
  };

  const formatPrice = (kgs: number): string => {
    if (currency === 'USD') {
      return `$${Math.round(kgs * KGS_TO_USD)}`;
    }
    return `${kgs.toLocaleString('ru')} KGS`;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, currency, setCurrency, t, formatPrice }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
};

import { ArrowUpRight, MessageCircle, MapPin, CalendarCheck, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function GuestGuide() {
  const { lang } = useLanguage();
  const text = (ru: string, en: string, kg: string) => lang === 'en' ? en : lang === 'kg' ? kg : ru;
  const questions = [
    [text('Как забронировать номер?', 'How do I book?', 'Кантип брондойм?'), text('Выберите даты и номер, войдите в аккаунт и отправьте заявку. Отель проверит наличие и свяжется с вами. Подтверждённая бронь появится в личном кабинете.', 'Choose dates and a room, sign in and send a request. The hotel will check availability and contact you. Follow confirmation in your account.', 'Күндөрдү жана бөлмөнү тандап, аккаунтка кирип өтүнмө жөнөтүңүз. Мейманкана бош бөлмөнү текшерип, сиз менен байланышат.')],
    [text('Можно ли заказать трансфер?', 'Can I request a transfer?', 'Трансфер сурасам болобу?'), text('Укажите время прибытия и пожелания в заявке или напишите в WhatsApp. Наличие и стоимость трансфера нужно согласовать с отелем отдельно.', 'Add your arrival time and requests to your booking or contact us on WhatsApp. Transfer availability and cost must be agreed with the hotel.', 'Келүү убактысын өтүнмөгө жазыңыз же WhatsApp аркылуу байланышыңыз. Трансфердин баасын мейманкана менен тактаңыз.')],
    [text('Как изменить или отменить заявку?', 'How can I change or cancel?', 'Кантип өзгөртөм же жокко чыгарам?'), text('Заявку в статусе «Ожидает» можно отменить в личном кабинете. Для изменения дат или отмены подтверждённой брони свяжитесь с отелем и сообщите номер заявки.', 'Pending requests can be cancelled in your account. To change dates or cancel a confirmed booking, contact the hotel with your booking reference.', 'Күтүлүүдө турган өтүнмөнү жеке кабинеттен жокко чыгара аласыз. Ырасталган бронду өзгөртүү үчүн мейманканага кайрылыңыз.')],
    [text('Нужно ли платить на сайте?', 'Do I pay online?', 'Сайттан төлөш керекпи?'), text('Сайт не принимает оплату и не запрашивает данные карты. Условия оплаты, заезда и выезда уточняйте у отеля до подтверждения.', 'This website does not take payments or ask for card details. Agree payment and check-in/out terms with the hotel before confirmation.', 'Сайт төлөм албайт жана карта маалыматын сурабайт. Төлөм жана кирүү-чыгуу шарттарын алдын ала тактаңыз.')],
  ];
  return <section className="guest-guide section-pad" id="guest-guide">
    <div className="guide-layout">
      <div className="guide-intro">
        <span className="guide-eyebrow">ALAY ART · {text('ЗАБОТА О ГОСТЯХ','GUEST CARE','КОНOКТОР ҮЧҮН')}</span>
        <h2>{text('Всё для спокойного путешествия','A little help. A better stay.','Саякатыңыз жайлуу болсун')}</h2>
        <p>{text('Планируйте отдых без лишних вопросов. Мы поможем с деталями вашего приезда в Ош.', 'Plan your trip with confidence. We can help with the details of your visit to Osh.', 'Эс алууну оңой пландаңыз. Ошко келүүңүздүн чоо-жайы боюнча жардам беребиз.')}</p>
        <a className="guide-contact" href="https://wa.me/996550323070" target="_blank" rel="noopener noreferrer"><MessageCircle size={22}/><span>{text('Спросить в WhatsApp','Ask on WhatsApp','WhatsApp аркылуу суроо')}<small>+996 550 323 070</small></span><ArrowUpRight size={20}/></a>
        <a className="guide-map" href="https://www.google.com/maps/search/?api=1&query=40.497668,72.818444" target="_blank" rel="noopener noreferrer"><MapPin size={18}/>{text('Как добраться до отеля','Directions to the hotel','Мейманканага жол')}</a>
      </div>
      <div className="guide-questions">{questions.map(([question, answer], i) => <details key={question} open={i === 0}><summary><span className="question-number">0{i + 1}</span>{question}<span className="question-plus">+</span></summary><p>{answer}</p></details>)}</div>
    </div>
    <div className="care-strip"><span><CalendarCheck size={20}/>{text('Статус заявки в личном кабинете','Track requests in your account','Өтүнмө абалы жеке кабинетте')}</span><span><ShieldCheck size={20}/>{text('Без ввода банковской карты','No card details required','Банк картасы талап кылынбайт')}</span><span><MessageCircle size={20}/>{text('Прямая связь с отелем','Direct contact with the hotel','Мейманкана менен түз байланыш')}</span></div>
  </section>;
}

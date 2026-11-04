export function bookingError(error: unknown, lang = 'ru'): string {
  const code = typeof error === 'object' && error !== null ? String((error as {message?: string}).message || '') : '';
  const messages: Record<string, [string,string,string]> = {
    ROOM_UNAVAILABLE: ['На эти даты свободных номеров уже нет. Выберите другие даты или свяжитесь с отелем.', 'No rooms remain for these dates. Choose other dates or contact the hotel.', 'Бул күндөргө бош бөлмө жок. Башка күндөрдү тандаңыз.'],
    DUPLICATE_BOOKING: ['У вас уже есть заявка на этот номер и даты. Проверьте личный кабинет.', 'You already have a request for this room and dates. Check your account.', 'Бул бөлмөгө жана күндөргө өтүнмөңүз бар. Жеке кабинетти текшериңиз.'],
    REQUEST_LIMIT: ['Слишком много новых заявок за час. Проверьте личный кабинет или свяжитесь с отелем.', 'Too many new requests this hour. Check your account or contact the hotel.', 'Бир саатта өтүнмөлөр өтө көп. Мейманканага кайрылыңыз.'],
    PRICE_CHANGED: ['Тариф изменился. Обновите цену, проверьте сумму и отправьте заявку ещё раз.', 'The rate changed. Refresh the price, review the total and submit again.', 'Баа өзгөрдү. Бааны жаңылап, сумманы текшерип, кайра жөнөтүңүз.'],
    INVALID_DATES: ['Проверьте даты: от 1 до 90 ночей, заезд не в прошлом.', 'Check dates: 1–90 nights, arrival cannot be in the past.', 'Күндөрдү текшериңиз: 1–90 түн, кирүү өткөн күндө болбосун.'],
    INVALID_GUESTS: ['Число гостей превышает вместимость номера.', 'The guest count exceeds room capacity.', 'Коноктордун саны бөлмөнүн сыйымдуулугунан ашты.'],
    INVALID_CONTACT: ['Проверьте имя, email и длину пожеланий.', 'Check your name, email and request length.', 'Аты-жөнүңүздү, email жана каалоолорду текшериңиз.'],
    INVALID_STATUS: ['Этот переход статуса недоступен. Обновите список бронирований.', 'This status change is not allowed. Refresh bookings.', 'Бул абалды өзгөртүү мүмкүн эмес. Брондорду жаңылаңыз.'],
    AUTH_REQUIRED: ['Войдите в аккаунт, чтобы отправить заявку.', 'Sign in to send a request.', 'Өтүнмө жөнөтүү үчүн кириңиз.'],
    STALE_STATUS: ['Статус уже изменился в другом окне. Обновите список перед повторным действием.', 'The status changed in another window. Refresh before trying again.', 'Абал башка терезеде өзгөрдү. Тизмени жаңылаңыз.'],
  };
  const key = Object.keys(messages).find(k => code.includes(k));
  const text = key ? messages[key] : ['Не удалось подтвердить результат операции. Проверьте личный кабинет. Повторная отправка тех же данных безопасна.', 'Unable to verify the result. Check your account. Retrying the same request is safe.', 'Жыйынтыкты текшерүү мүмкүн болгон жок. Жеке кабинетти текшериңиз. Ошол эле өтүнмөнү кайра жөнөтүү коопсуз.'];
  return text[lang === 'en' ? 1 : lang === 'kg' ? 2 : 0];
}

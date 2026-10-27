# ALAY ART Hotel
React 19 + TypeScript + Vite + Supabase. RU / EN / KG.

## Локальный запуск
```sh
npm ci
# Необязательно: скопируйте .env.example в .env.local и задайте свой проект
npm run dev -- --host 0.0.0.0
```
В отсутствие env используется существующий публичный проект из кода. Секретные/service-role ключи в frontend запрещены.

## Проверка и production
```sh
npm run typecheck
npm test
npm run build
npm start
```
Node-сервер слушает `0.0.0.0:3000` (или `PORT`). Vercel/Netlify собирают `dist` самостоятельно; сгенерированные файлы больше не хранятся в Git.

## База данных — важно
**До публикации нового frontend примените `supabase/migrations/20261027_security.sql` к существующей БД.** Для новой БД используйте `supabase/schema.sql`. Установите реальное количество физических номеров каждой категории в `rooms.inventory_count` (по умолчанию 1). Администратор назначается владельцем базы через SQL, не через клиент.

Подробный аудит, порядок внедрения и оставшиеся ограничения: [SECURITY_REVIEW.md](SECURITY_REVIEW.md).

## Проверка страниц номеров в браузере
Нужен Node.js 22.18+ (или 24 LTS).
```sh
npx playwright install chromium
npm run build
npm start
# В другом терминале:
npm run test:browser
```
Браузерный тест использует локальный сервер :3000 и подменённые ответы каталога/Auth; внешние запросы блокируются. Рабочие брони не создаются. Можно задать `TEST_BASE_URL`, `CHROMIUM_EXECUTABLE_PATH` и `SCREENSHOT_PATH`.

Страницы `/rooms/:id` поддерживают `checkIn`, `checkOut`, `guests` в URL. Личные данные гостя в ссылку не включаются. При недоступном API бронирование отключено, сохранённый каталог и связь с отелем остаются доступны.

# План имплементации: миграция авторизации на better-auth

Спека: `docs/superpowers/specs/2026-07-02-auth-security-redesign-design.md`

Затрагиваемые файлы (найдены по grep next-auth/auth-actions): `app/auth.ts`, `middleware.ts`, `app/api/auth/[...nextauth]/route.ts`, `app/api/auth/check/route.ts`, `app/api/register/route.ts`, `app/api/lk/me/route.ts`, `app/api/users/route.ts`, `app/api/settings/route.ts`, `app/actions/auth-actions.ts`, `app/login/loginForm.tsx`, `app/register/registerForm.tsx`, `app/lk/page.tsx`, `app/lk/LkClient.tsx`, `app/utils/settings.ts`, `app/utils/user.ts`, `app/types/next-auth.d.ts`.

Каждый этап заканчивается проверкой; коммит на этап.

## Этап 1. Установка и конфиг better-auth (рядом с next-auth, ничего не ломаем)

1. `npm install better-auth`.
2. `.env`: добавить `BETTER_AUTH_SECRET` (сгенерировать `openssl rand -base64 32`) и `BETTER_AUTH_URL=http://localhost:3000`.
3. Создать `app/lib/auth.ts` (новый конфиг, чтобы не конфликтовать со старым `app/auth.ts`):
   - `betterAuth({ database: mongodbAdapter(db, { client }), ... })` — клиент Mongo взять из `lib/mongodb`;
   - `emailAndPassword: { enabled: true, minPasswordLength: 8, password: { hash, verify } }`:
     - `hash` — дефолтный scrypt из `better-auth/crypto` (`hashPassword`);
     - `verify({ password, hash })` — если `hash.startsWith('$2')` → `bcryptjs.compare`; иначе scrypt (`verifyPassword` из `better-auth/crypto`). При успешной bcrypt-проверке — обновить хэш в коллекции `account` на scrypt (ленивая миграция);
   - `user: { additionalFields: { role: { type: 'string', defaultValue: 'user', input: false } } }`;
   - `session`: дефолт (7 дней, updateAge 1 день);
   - `rateLimit: { enabled: true, storage: 'database', customRules: { '/sign-in/email': { window: 60, max: 5 }, '/sign-up/email': { window: 60, max: 3 } } }` (enabled: true явно — по умолчанию rate-limit работает только в production);
   - плагин `nextCookies()` (`better-auth/next-js`) — последним в списке plugins.
4. Создать `app/api/auth/[...all]/route.ts`: `toNextJsHandler(auth)`.
5. Создать `lib/auth-client.ts`: `createAuthClient()` c `inferAdditionalFields` для role.

Проверка: `npm run build` проходит; `curl POST /api/auth/sign-up/email` создаёт пользователя в `user` + `account`; старый логин через next-auth всё ещё работает.

## Этап 2. Миграция существующих пользователей

1. Новая миграция в `migrations/` (migrate-mongo):
   - up: для каждого документа `user` с полем `password`: привести `createdAt`/`updatedAt` к Date (из ISO-строк), добавить `emailVerified: false`, `email` — в lowercase/trim; создать в `account` документ `{ userId: <_id в строке/формате better-auth>, accountId: <тот же>, providerId: 'credential', password: <bcrypt-хэш>, createdAt, updatedAt }`; удалить поле `password` из `user`. Поля `role`, `settings`, `name` не трогать.
   - down: обратная операция (вернуть password из account).
   - Внимание: better-auth по умолчанию генерирует строковые id; существующие `_id` — ObjectId. Использовать `advanced.database.generateId: false` в конфиге либо убедиться, что mongodb-адаптер корректно работает с ObjectId (проверить на тестовой записи ДО прогона миграции).
2. Прогнать на копии БД, затем на dev-базе: `npx migrate-mongo up`.

Проверка: логин мигрированного пользователя со старым паролем через `/api/auth/sign-in/email` успешен; после логина хэш в `account` начинается не с `$2` (перехэшировано в scrypt); в `user` нет поля `password`.

## Этап 3. Переключение UI и middleware

1. `app/login/loginForm.tsx`: заменить вызов `singInFunc` на `authClient.signIn.email({ email, password })`; клиентская zod-валидация (`loginSchema`) остаётся; обработка ошибки — единое сообщение «Неверный email или пароль»; redirect на `next`-параметр после успеха.
2. `app/register/registerForm.tsx`: `registerUserFunc` → `authClient.signUp.email({ name, email, password })`; валидация `registerSchema` остаётся; обработка 422 «уже существует».
3. Выход (`app/lk/LkClient.tsx` и где ещё используется `singOutFunc`): → `authClient.signOut()`.
4. `middleware.ts`: заменить `auth(...)` на проверку `getSessionCookie(request)` (`better-auth/cookies`); matcher: убрать исключение `api`, оставить исключения `_next/static`, `_next/image`, `favicon.ico`, `/api/auth` (роуты better-auth защищают себя сами); логика редиректов `/edit` ↔ `/login` и `x-pdf-route` без изменений.
5. `app/lk/page.tsx`, `app/utils/settings.ts` (`getCurrentUser`): заменить `auth()` из next-auth на `auth.api.getSession({ headers: await headers() })`.

Проверка: ручной прогон — регистрация, вход, выход, редирект `/edit` → `/login` без сессии, `/login` → `/edit` с сессией; личный кабинет отображает имя/email.

## Этап 4. Защита API-роутов

1. Создать `app/utils/auth-guards.ts`:
   - `requireSession()` → session или `NextResponse 401`;
   - `requireAdmin()` → session с `user.role === 'admin'` или 401/403.
2. `app/api/users/route.ts`: `requireAdmin()`; проекция `{ password: 0 }` на всякий случай (после миграции поля нет, но страховка); вернуть только безопасные поля.
3. `app/api/lk/me/route.ts`: `requireSession()`; заменить импорт `auth` со старого конфига на новый.
4. `app/api/settings/route.ts`: привести `getCurrentUser` к `requireSession()`/`requireAdmin()` (админ-ветки — только под admin).
5. `app/api/calculate/route.ts`: остаётся публичным; добавить простой in-memory rate-limiter (`app/utils/rate-limit.ts`, Map по IP, окно 60 сек) — общий модуль, чтобы переиспользовать.

Проверка: скрипты этапа 6 (частично) + ручные curl: без cookie → 401, обычный юзер на `/api/users` → 403.

## Этап 5. Удаление старого кода

1. Удалить: `app/auth.ts`, `app/api/auth/[...nextauth]/`, `app/api/auth/check/`, `app/api/register/`, `app/actions/auth-actions.ts`, `app/types/next-auth.d.ts`.
2. `app/utils/user.ts`: удалить `getUserFromDb` (с паролем), оставить `getUserSafe`; тип `DbUser` — без `password`.
3. `package.json`: удалить `next-auth`, `bcrypt`, `@types/bcrypt`; `bcryptjs` оставить (верификация старых хэшей).
4. `.env`: удалить `NEXTAUTH_SECRET`.
5. `npm run build` + `npm run lint` — убедиться, что ссылок на удалённое не осталось (grep `next-auth`, `auth-actions`).

## Этап 6. Тесты

Скрипты в `scripts/` по образцу `check-calculate-*` (fetch против `http://localhost:3000`, тестовые пользователи создаются и удаляются самим скриптом):

1. `check-auth-flow.mjs`: sign-up → sign-in → `/api/auth/get-session` → sign-out; логин юзера с bcrypt-хэшем (вставить фикстуру напрямую в БД); ответы на «неверный пароль» и «несуществующий email» идентичны (статус и тело).
2. `check-api-protection.mjs`: `/api/users`, `/api/settings`, `/api/lk/me` без cookie → 401; `/api/users` под user → 403, под admin → 200 и без хэшей в теле.
3. `check-rate-limit.mjs`: 6 подряд sign-in с неверным паролем → шестой ответ 429.
4. Добавить в `package.json`: `test:auth-flow`, `test:api-protection`, `test:rate-limit`.
5. Регрессия: `npm run test:calculate-validation` и `test:calculate-regression` проходят (rate-limit калькулятора не ломает их — при необходимости поднять порог).

## Риски

- **ObjectId vs строковые id** — главный технический риск; проверяется в начале этапа 2 до миграции.
- Better-auth ожидает коллекции `user`, `session`, `account`, `verification` — имена совпадают с нашей `user`, конфликтов нет.
- Rate-limit `storage: 'database'` создаёт коллекцию `rateLimit` — миграция не нужна.
- Если формы шлют запросы через server actions где-то ещё — grep перед этапом 5.

# Редизайн авторизации: миграция на better-auth

Дата: 2026-07-02
Статус: утверждён

## Контекст и цель

Текущая авторизация построена на next-auth v5 (beta) с Credentials-провайдером и имеет серьёзные проблемы безопасности:

1. `GET /api/users` отдаёт всех пользователей вместе с password-хэшами без авторизации (критично).
2. Middleware matcher исключает `/api` — API-роуты не защищены вовсе.
3. `POST /api/auth/check` — открытый «оракул паролей»: без rate-limit, с разными кодами ответа для «нет пользователя» и «неверный пароль» (энумерация email + перебор).
4. Rate-limiting отсутствует полностью.
5. Роль не попадает в сессию (нет jwt/session callbacks); fallback `name === 'administrator' → admin`.
6. Проверка пароля продублирована в `singInFunc` и `authorize`; сообщения ошибок раскрывают существование пользователя.
7. Регистрация не использует `registerSchema`; в зависимостях и `bcrypt`, и `bcryptjs`.

Цель: заменить auth-слой на better-auth, закрыв все перечисленные проблемы, с сохранением существующих пользователей и их паролей.

Решения, принятые при обсуждении: приложение на dev-стадии; способ входа — только email+пароль (OAuth возможен позже); email-флоу (подтверждение почты, восстановление пароля) — отдельным этапом позже; хостинг — один VPS; существующие пользователи сохраняются; срок сессии — дефолтный (7 дней, скользящее продление).

## Архитектура

Better-auth полностью заменяет next-auth.

- `app/auth.ts` — конфиг `betterAuth()`: `mongodbAdapter(db, { client })`, `emailAndPassword: { enabled: true }`, встроенный rate-limit, сессии в MongoDB (httpOnly cookie + коллекция `session`, ревокация из коробки, срок 7 дней / updateAge 1 день — дефолт).
- `app/api/auth/[...all]/route.ts` — единственный auth-эндпоинт (заменяет `[...nextauth]`).
- `lib/auth-client.ts` — `createAuthClient()`; формы логина/регистрации вызывают `authClient.signIn.email()` / `authClient.signUp.email()` вместо server actions. Клиентская валидация форм остаётся на zod-схемах из `app/lib/auth-schemas.ts`.
- Роль пользователя — поле `role` через `user.additionalFields` в конфиге; попадает в сессию автоматически. Плагин admin не используется (YAGNI).
- Пароли: better-auth хэширует scrypt; для старых bcrypt-хэшей — кастомный `verify` (см. «Миграция»).
- Секрет: переменная `BETTER_AUTH_SECRET` в `.env` (заменяет `NEXTAUTH_SECRET`).

Удаляется: `app/actions/auth-actions.ts` (логика signIn/signOut), `app/api/auth/check/`, `app/api/register/` (регистрация идёт через better-auth), зависимости `next-auth` и `bcrypt` (нативный; `bcryptjs` остаётся для верификации старых хэшей).

## Миграция пользователей

Better-auth хранит пользователя в коллекции `user`, а credential-пароль — в коллекции `account` (`providerId: 'credential'`). Сейчас пароль лежит полем `password` в `user`.

1. Одноразовый скрипт в `migrations/` (migrate-mongo, как принято в проекте): для каждого пользователя дополнить обязательные поля better-auth (`emailVerified: false`, `createdAt`/`updatedAt` как Date), создать документ в `account` с bcrypt-хэшем, удалить поле `password` из `user`. Поля `role` и `settings` остаются без изменений.
2. Совместимость хэшей: переопределяем `emailAndPassword.password.verify` — если хэш начинается с `$2`, проверка через `bcryptjs.compare`, иначе стандартный scrypt. При успешном bcrypt-входе хэш перезаписывается scrypt-версией (ленивая миграция).
3. Активные next-auth-сессии пропадают (другая cookie) — пользователи входят заново со старыми паролями, сброс не требуется.

## Защита API и rate-limiting

Middleware (`middleware.ts`): убрать `api` из исключений matcher; редиректы `/edit` ↔ `/login` по session-cookie (`getSessionCookie` — без похода в БД). Middleware — только UX-слой, не граница безопасности.

Настоящая проверка — в каждом API-роуте через `auth.api.getSession()`. Общие хелперы `requireSession()` / `requireAdmin()` в `app/utils/auth-guards.ts`.

- `GET /api/users` — только `role === 'admin'`; проекция без чувствительных полей (хэши не отдаются никогда).
- `/api/settings`, `/api/lk/me` — требуют сессию; админ-операции в settings — через `requireAdmin()` (текущий `getCurrentUser` привести к единым хелперам).
- `/api/calculate` — остаётся публичным (ядро публичного калькулятора), защищается in-memory rate-limit.
- `/api/auth/check`, `/api/register` — удаляются.

Rate-limiting: встроенный в better-auth, `storage: "database"` (MongoDB — переживает рестарт, подходит для VPS). Правила: `/sign-in/email` — 5 попыток / 60 сек; `/sign-up/email` — 3 / 60 сек; остальные auth-роуты — дефолт. Для не-auth API (`/api/calculate`) — простой in-memory лимитер (один процесс Node).

Сообщения об ошибках: единый ответ «Неверный email или пароль» для несуществующего пользователя и неверного пароля (поведение better-auth по умолчанию). На регистрации сообщение «пользователь уже существует» сохраняется — без email-верификации скрыть существование аккаунта невозможно, UX важнее.

## Порядок имплементации

1. Установить better-auth, создать конфиг и `[...all]`-роут рядом с работающим next-auth (ничего не ломается).
2. Миграционный скрипт; проверка на копии данных.
3. Переключить формы логина/регистрации и middleware на better-auth.
4. Защитить API-роуты хелперами.
5. Удалить next-auth и мёртвый код (`auth-actions`, `/api/auth/check`, `/api/register`, `bcrypt`).

## Тестирование

Скрипты в `scripts/` (по образцу `check-calculate-*`), запуск против dev-сервера:

- `check-auth-flow.mjs`: регистрация → логин → getSession → logout; логин мигрированного пользователя со старым bcrypt-паролем; одинаковый ответ на неверный пароль и несуществующий email.
- `check-api-protection.mjs`: `/api/users`, `/api/settings`, `/api/lk/me` без сессии → 401; `/api/users` под обычным пользователем → 403; в ответах нет password-хэшей.
- `check-rate-limit.mjs`: шестая подряд попытка логина → 429.

## Вне скоупа (позже, отдельными этапами)

Подтверждение email, восстановление пароля, OAuth-провайдеры (Google/Yandex/VK), плагин admin, 2FA.

# Дизайн: персональные настройки на `/edit` (`/api/settings`)

Дата: 2026-06-25. Подход: **C — настройки встроены в документ `user`**.

Заменяет/уточняет `PLAN-per-user-settings.md` (там был выбран вариант с отдельной
коллекцией `userSettings`; здесь сознательно выбран вариант со встраиванием).

---

## 1. Цель

Каждый авторизованный пользователь редактирует значения на `/edit` и сохраняет
**свои**. У пользователя есть сохраняемый режим источника:

- `own` — калькулятор и офферы считают по личным значениям пользователя;
- `global` — считают по **живому** глобальному шаблону (правки админа видны сразу).

Переключение `own ↔ global` **не затирает** личные значения. Глобальный шаблон
(дефолты для гостей и стартовая копия для новых пользователей) ведёт пользователь
с ролью `admin` через тот же `/edit`. Неавторизованный гость всегда считает по
живому глобальному шаблону.

### Решения, зафиксированные при брейншторме

1. Первый заход на `/edit` → ленивый клон шаблона в личные настройки. Дальше
   правятся только личные.
2. Режим `global` = **живой** шаблон (не замороженная копия): поздние правки
   админа видны пользователю в режиме `global` сразу.
3. Режим — **сохраняемый** (в БД), влияет на расчёт, а не временный просмотр.
4. Admin-UI редактирования глобального шаблона — **в объёме** этой задачи.
5. Отдельной кнопки «скопировать шаблон в свои» (reset) **нет** — достаточно
   переключателя режима.
6. Переключатель режима показывается **и на `/edit`, и на калькуляторе `/`**
   (только авторизованному; гость его не видит).

---

## 2. Текущее состояние (что уже есть)

- **Стек:** Next.js 15 (App Router), MongoDB (нативный драйвер `mongodb`),
  NextAuth v5 (Credentials, JWT-сессии). `mongoose` в зависимостях, но не
  используется.
- **Коллекции:** `user`, `settings`.
- **`settings` — один общий документ на всех.** Создан миграцией
  `migrations/20250606124153-settings.js`. Полей `scope`/`version`/`updatedAt`
  может не быть.
  - Чтение: `db.collection('settings').findOne({})` в
    `app/api/settings/route.ts` и `app/api/calculate/route.ts`.
  - `PUT`: `updateOne({ _id }, { $set }, { upsert: true })` — меняет только
    числовые поля (`updateNumericOnly`) у уже существующих строк
    `pay/materials/exp` и `general`; **новые строки создавать не умеет**.
- **`/edit`** (`app/edit/page.tsx`) — серверный компонент: `fetch` на
  `GET /api/settings` и рендер формы `ChoiceType → ConcreteType`. PUT шлёт
  `concreteType.tsx`.
- **`middleware.ts`** защищает `/edit` (гостя редиректит на `/login`), но
  `matcher` исключает `/api/*` → `/api/settings` middleware **не покрывает**.
- **`app/auth.ts`** — колбэков `jwt`/`session` НЕТ. `authorize()` возвращает
  `{ id, name, email, role }`, но без колбэков `session.user.id`/`role`
  фактически `undefined` в рантайме (типы в `next-auth.d.ts` это обещают, но это
  тихий баг). Надёжно есть только `session.user.email`/`name`.
- **`app/utils/user.ts`**: `getUserFromDb(email)` → документ
  `{ _id, email, password, role?, name? }` (читается **целиком, включая
  `password`**).
- Рабочий паттерн резолва уже применён в `app/api/lk/me/route.ts`:
  `auth()` → `email` → `getUserFromDb(email)`.

### Ключевые ограничения, влияющие на дизайн

1. `updateNumericOnly` меняет только числа в **существующих** строках → у нового
   пользователя справочники обязаны быть непустыми ⇒ при первом заходе настройки
   **клонируются из шаблона** (пустой документ не подойдёт — PUT упадёт на
   проверке «справочники пустые»).
2. Серверный `fetch` из `/edit/page.tsx` на собственный `/api/settings`
   **не передаёт cookie** ⇒ `auth()` внутри роута не увидит сессию. Исправляется
   прямым вызовом серверного хелпера вместо HTTP-запроса.
3. `id`/`role` в сессии фактически нет ⇒ пользователя и роль резолвим из БД по
   email, не доверяя `session.user.id`/`role`.
4. `/api/settings` не закрыт middleware ⇒ авторизация проверяется **inline**
   через `auth()` в начале `GET` и `PUT`.

---

## 3. Модель данных (подход C)

Глобальный шаблон остаётся в коллекции `settings`; личные настройки **встроены в
документ `user`**.

### `settings` — глобальный шаблон (дефолты), ведёт админ
- Существующий единственный документ + явный маркер `scope: 'global'` (разовая
  миграция проставит маркер).
- Чтение шаблона: `findOne({ scope: 'global' })` с фолбэком `findOne({})` (на
  период до прогона миграции) и далее на `DEFAULT_SETTINGS`.
- Используется: для гостей, для режима `global` у залогиненного пользователя и как
  источник при ленивом клоне личных настроек.

### `user.settings` — встроенный под-документ, по одному на пользователя

```
user {
  _id, email, password, role?, name?,            // как сейчас
  settings?: {
    general:   { rate, overheads, profit },
    pay:       [{ id, name, price, increase }],
    materials: [{ id, name, price, increase }],
    exp:       [{ id, name, price, increase }],
    formula?:  FormulaSettings,
    mode:      'own' | 'global',                  // сохраняемый режим источника
    version:   number,                            // персональная версия, старт 0
    createdAt: string,
    updatedAt: string,
  }
}
```

- `settings` отсутствует, пока пользователь ни разу не заходил на `/edit`
  (и не делал расчёт залогиненным) — создаётся лениво.
- `version` персональная, независимая от шаблона; при клоне стартует с 0.
- После клона `mode: 'own'` (личные значения = снимок шаблона на момент клона).

### Почему встраивание (C), а не отдельная коллекция

Документ пользователя уже существует ⇒ **нет гонки на создание** и не нужен
уникальный индекс: ленивый клон делается условным апдейтом (см. §4). Минус —
настройки лежат рядом с `password`; компенсируется проекциями (см. §7).
Бэкфилл не нужен — наполняется лениво.

### Миграция / индексы
- Единственный шаг: проставить `scope: 'global'` текущему документу `settings`.
- Новой коллекции и новых индексов **не требуется**.

---

## 4. Серверные хелперы

Новый модуль `app/utils/settings.ts` (рядом с `api-routes.ts`, `user.ts`):

- **`getCurrentUser()`** — `auth()` → `session.user.email` →
  `getUserFromDb(email)`. Возвращает документ пользователя (источник `_id`,
  `role`, `settings`) или `null`.
- **`getGlobalTemplate(db): Promise<SettingsType>`** —
  `settings.findOne({ scope: 'global' })` → фолбэк `findOne({})` → фолбэк
  `DEFAULT_SETTINGS`.
- **`getOrCreateUserSettings(db, user): Promise<UserSettings>`** — если
  `user.settings` есть, вернуть его. Если нет — клонировать шаблон (включая
  `formula`) **условным апдейтом** без гонки:

  ```
  db.collection('user').updateOne(
    { _id: user._id, settings: { $exists: false } },
    { $set: { settings: { ...clonedTemplate, mode: 'own', version: 0,
                          createdAt: now, updatedAt: now } } }
  );
  // затем перечитать user.settings проекцией { settings: 1 }
  ```

  Два параллельных первых захода безопасны: второй апдейт не находит документ по
  фильтру (`settings.$exists` уже true) и ничего не портит.
- **`resolveSettingsForCalc(db, user | null): Promise<SettingsType>`** — гость
  (`user === null`) или `user.settings.mode === 'global'` → `getGlobalTemplate`;
  иначе `getOrCreateUserSettings(...).` Используется в `/api/calculate`.

---

## 5. Изменения в API

### `GET /api/settings`
- В начале — `getCurrentUser()`; нет пользователя → `401`.
- `?scope=global`:
  - только при `role === 'admin'` (роль из БД) → вернуть глобальный шаблон
    (`getGlobalTemplate`);
  - не админ с `scope=global` → `403` (или молча отдать личные — выбрать `403`).
- Без `scope` → `getOrCreateUserSettings(db, user)` (ленивый клон при первом
  заходе) → вернуть данные **+ `mode`**.
- Сохранить фолбэк на `DEFAULT_SETTINGS`, если БД недоступна.

### `PUT /api/settings`
- В начале — `getCurrentUser()`; нет пользователя → `401`.
- Определить цель записи:
  - **админ + `?scope=global`** → пишем в коллекцию `settings` (глобальный
    шаблон); `version`-проверка против документа `settings`; запись как сейчас.
  - **иначе** → пишем в `user.settings`; `version`-проверка против
    `user.settings.version`; запись через
    `updateOne({ _id: user._id }, { $set: { 'settings.pay': ...,
    'settings.materials': ..., 'settings.exp': ..., 'settings.general': ...,
    'settings.formula': ..., 'settings.version': next, 'settings.mode': mode,
    'settings.updatedAt': now } })`.
- Логика `updateNumericOnly` и проверка «справочники пустые» **не меняются**:
  после клона справочники непустые ⇒ проверка проходит.
- Если в payload пришёл новый `mode` — обновить `settings.mode` (отдельный
  допустимый к изменению флаг помимо числовых полей).

### `POST /api/calculate`
- Вызвать `auth()` (браузерный `fetch` с клиента шлёт cookie сам — проблемы куки
  здесь нет). Гость → `user = null`.
- `settings = resolveSettingsForCalc(db, user)`.
- Далее `calculateConcreteOffer(normalized, settings)` — без изменений.

### Смена режима с калькулятора `/`
- Отдельного действия достаточно: `PUT /api/settings` с телом `{ mode }`
  (без правок чисел) обновляет только `settings.mode`. Тот же роут.

---

## 6. Изменения во фронтенде

- **`app/edit/page.tsx`:** убрать серверный `fetch` (cookie не передаётся) и
  вызвать `getCurrentUser` + `getOrCreateUserSettings`/`getGlobalTemplate`
  напрямую в компоненте. Прокинуть в форму `isAdmin` (для режима правки шаблона)
  и текущий `mode`.
- **`ChoiceType` / `ConcreteType`:**
  - Селектор источника «Мои значения / Шаблон администратора»:
    - обычный юзер: вкладка «Шаблон» — read-only просмотр; её выбор ставит
      `mode: 'global'`, «Мои значения» — `mode: 'own'` (поля редактируемы);
    - админ: вкладка «Шаблон» — **редактируемая** (правка глобального шаблона);
      сохранение шлёт `PUT ?scope=global`.
  - PUT личных настроек шлёт `mode` вместе с числами.
  - Структура payload и `updateNumericOnly` не меняются.
- **Калькулятор `/`:** добавить тот же переключатель `own/global` (только для
  авторизованного; гость не видит). Смена шлёт `PUT { mode }` и пересчитывает.
  `POST /api/calculate` сам определяет источник по `mode`.

---

## 7. Краевые случаи и риски

- **Соседство с паролем:** `user.settings` лежит рядом с `password`. Все чтения
  «наружу» — с проекцией `{ password: 0 }`; пароль никогда не уходит во фронт.
  Для записи использовать точечные `$set` по `settings.*`, не перезаписывать
  документ целиком.
- **Гонка первого клона:** условный апдейт `{ settings: { $exists: false } }`
  идемпотентен; уникальный индекс и обработка 11000 не нужны.
- **`id`/`role` в сессии отсутствуют** (типы обещают, рантайм — нет): резолвить
  пользователя и роль из БД. Admin-проверка `scope=global` — строго по `role`
  из документа `user`.
- **Серверный `fetch` без cookie** в `/edit` — устранён прямым вызовом хелпера.
- **`/api/settings` не закрыт middleware** — обязательна inline-проверка `auth()`
  в `GET` и `PUT`.
- **Гость без шаблона** в калькуляторе → фолбэк `DEFAULT_SETTINGS`.
- **`formula`** — обязательно копируется при клоне шаблона.
- **`updateNumericOnly` не добавляет строки** — поэтому клон обязателен до
  первого `PUT`.
- **`mode: 'global'` живой** — пользователь видит текущий шаблон; это ожидаемо и
  есть требование.

---

## 8. Порядок работ (чек-лист)

1. **БД:** скрипт миграции (`scripts/` или migrate-mongo) — проставить
   `scope: 'global'` существующему документу `settings`.
2. **Типы:** в `app/models/adminDataTypes.ts` — тип `UserSettings`
   (`SettingsType` + `mode`, `createdAt`); при необходимости расширить `DbUser`
   в `app/utils/user.ts` полем `settings?`.
3. **Хелперы:** `app/utils/settings.ts` — `getCurrentUser`, `getGlobalTemplate`,
   `getOrCreateUserSettings`, `resolveSettingsForCalc`. Чтение пользователя — с
   проекцией без `password`.
4. **`GET /api/settings`** — inline `auth()` + личные настройки + ленивый клон;
   `?scope=global` только для админа.
5. **`PUT /api/settings`** — inline `auth()`; запись в `user.settings` (version
   против личной версии) либо в `settings` при `scope=global` + admin; поддержка
   обновления `mode`.
6. **`POST /api/calculate`** — `resolveSettingsForCalc` (свои / шаблон / гость).
7. **`app/edit/page.tsx`** — прямой вызов хелпера вместо `fetch`; прокинуть
   `isAdmin`, `mode`.
8. **`ConcreteType`/`ChoiceType`** — селектор источника, режим правки шаблона для
   админа, отправка `mode` и `scope=global`.
9. **Калькулятор `/`** — переключатель `own/global` для авторизованного.
10. **Тесты:** обновить `scripts/check-calculate-*.mjs` под персональные
    настройки; ручная проверка — два юзера с разными значениями + изоляция,
    переключение `own/global` меняет расчёт, правка админом шаблона видна юзеру в
    `global`, гость считает по шаблону.

---

## 9. Затрагиваемые файлы

| Файл | Изменение |
|------|-----------|
| `app/api/settings/route.ts` | inline `auth()`; GET/PUT → `user.settings`; admin `scope=global` → `settings`; `mode` |
| `app/api/calculate/route.ts` | выбор источника через `resolveSettingsForCalc` |
| `app/edit/page.tsx` | прямой вызов хелпера вместо `fetch`; прокинуть `isAdmin`, `mode` |
| `app/components/concreteType/concreteType.tsx` | селектор источника, режим правки шаблона (admin), отправка `mode`/`scope` |
| `app/components/choiceType/choiceType.tsx` | проброс `isAdmin`/`mode` в форму |
| `app/components/calculator/*` (`/` страница) | переключатель `own/global` для авторизованного |
| `app/utils/settings.ts` | **новый** — серверные хелперы |
| `app/utils/user.ts` | проекция без `password`; тип `settings?` в `DbUser` |
| `app/models/adminDataTypes.ts` | тип `UserSettings` + `mode` |
| `scripts/migrate-global-scope.mjs` | **новый** — маркер `scope: 'global'` |
| `middleware.ts` | без изменений — `/edit` уже защищён |
| `app/auth.ts` | без изменений (колбэки `jwt`/`session` — опц., вне объёма) |

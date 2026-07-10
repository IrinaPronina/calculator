# План реализации: персональные настройки (подход C)

Спека: `2026-06-25-per-user-settings-design.md`. Порядок шагов — снизу вверх
(типы → хелперы → API → фронт → миграция → тесты), чтобы каждый шаг был
проверяем и компилировался.

Условные обозначения проверки: ✅ — как убедиться, что шаг готов.

---

## Шаг 0. Ветка и бэкап

```
git checkout -b feature/per-user-settings
```

Снять дамп коллекций `user` и `settings` (на случай отката миграции):
```
mongodump --uri "$MONGODB_URI" --db "$DB_NAME" -c settings -c user -o ./_backup
```
✅ Папка `_backup` создана, в ней есть `settings.bson` и `user.bson`.

---

## Шаг 1. Типы

**`app/models/adminDataTypes.ts`** — добавить тип личных настроек:

```ts
export type SettingsMode = 'own' | 'global';

export interface UserSettings extends SettingsType {
    mode: SettingsMode;
    createdAt?: string;
    // version, updatedAt уже есть в SettingsType
}
```

**`app/utils/user.ts`** — расширить `DbUser`:
```ts
export type DbUser = {
    _id: { toString(): string };
    email: string;
    password: string;
    role?: string;
    name?: string;
    settings?: import('@/app/models/adminDataTypes').UserSettings;
};
```
Добавить чтение пользователя без пароля (для отдачи наружу/в компонент):
```ts
export async function getUserSafe(email: string): Promise<Omit<DbUser,'password'> | null> {
    // та же логика, что getUserFromDb, но с projection { password: 0 }
}
```
✅ `npx tsc --noEmit` проходит.

---

## Шаг 2. Серверные хелперы — `app/utils/settings.ts` (новый)

```ts
import { Db, ObjectId } from 'mongodb';
import { auth } from '@/app/auth';
import { getUserFromDb, DbUser } from '@/app/utils/user';
import { SettingsType, UserSettings } from '@/app/models/adminDataTypes';

export const DEFAULT_SETTINGS: SettingsType = {
    general: { rate: 0, overheads: 0, profit: 0 },
    pay: [], materials: [], exp: [], version: 0,
};

export async function getCurrentUser(): Promise<DbUser | null> {
    const session = await auth();
    const email = String(session?.user?.email || '').trim();
    if (!email) return null;
    return getUserFromDb(email);            // role + settings из БД
}

export async function getGlobalTemplate(db: Db): Promise<SettingsType> {
    const doc = await db.collection('settings').findOne({ scope: 'global' })
             ?? await db.collection('settings').findOne({});
    return normalizeSettings(doc) ?? DEFAULT_SETTINGS; // normalize как в route.ts getSettings
}

export async function getOrCreateUserSettings(db: Db, user: DbUser): Promise<UserSettings> {
    if (user.settings) return user.settings;
    const tpl = await getGlobalTemplate(db);
    const now = new Date().toISOString();
    const cloned: UserSettings = {
        ...structuredClone(tpl),
        mode: 'own', version: 0, createdAt: now, updatedAt: now,
    };
    await db.collection('user').updateOne(
        { _id: new ObjectId(user._id.toString()), settings: { $exists: false } },
        { $set: { settings: cloned } },
    );
    const fresh = await db.collection('user').findOne(
        { _id: new ObjectId(user._id.toString()) },
        { projection: { settings: 1 } },
    );
    return (fresh?.settings as UserSettings) ?? cloned;
}

export async function resolveSettingsForCalc(db: Db, user: DbUser | null): Promise<SettingsType> {
    if (!user) return getGlobalTemplate(db);
    if (user.settings?.mode === 'global') return getGlobalTemplate(db);
    return getOrCreateUserSettings(db, user);
}
```

Вынести общий `normalizeSettings(doc)` из текущего `getSettings` в `settings.ts`
и переиспользовать в роуте (убрать дублирование).
✅ `tsc --noEmit` проходит; модуль импортируется без циклов (auth → utils ок).

---

## Шаг 3. `GET /api/settings`

`app/api/settings/route.ts`:

```ts
export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return json401();

  const { searchParams } = new URL(req.url);
  const scope = searchParams.get('scope');
  const { db } = await getDb(clientPromise, null);

  if (scope === 'global') {
    if (user.role !== 'admin') return json403();
    return ok(await getGlobalTemplate(db));      // данные шаблона
  }

  const settings = await getOrCreateUserSettings(db, user);
  return ok(settings);                            // включает mode
}
```
Сохранить существующий `try/catch` с фолбэком `DEFAULT_SETTINGS` при недоступной БД.
✅ Залогиненный GET без `scope` возвращает свои настройки + `mode`; первый заход
создаёт `user.settings`. Гость → 401. Не-админ с `?scope=global` → 403.

---

## Шаг 4. `PUT /api/settings`

Развилка цели записи:

```ts
export async function PUT(req: Request) {
  const user = await getCurrentUser();
  if (!user) return json401();
  const { db, reqBody } = await getDb(clientPromise, req);
  const payload = reqBody as UserSettings & { version?: number; scope?: string };
  const scope = new URL(req.url).searchParams.get('scope') ?? payload.scope;

  if (scope === 'global') {
    if (user.role !== 'admin') return json403();
    return putGlobalTemplate(db, payload);        // прежняя логика записи в settings
  }
  return putUserSettings(db, user, payload);
}
```

`putGlobalTemplate` = текущая реализация PUT (запись в коллекцию `settings`,
version против документа `settings`) — вынести как есть.

`putUserSettings`:
- `current = user.settings` (если нет — сперва `getOrCreateUserSettings`).
- `version`-проверка против `current.version` (409 при конфликте).
- проверка «справочники непустые» — как сейчас (после клона проходит).
- собрать `toSave` через `updateNumericOnly(current.pay, payload.pay)` и т.д.;
  `general` — числовые поля; `formula = payload.formula`;
  `mode = payload.mode === 'global' ? 'global' : 'own'` (валидация флага);
  `version = current.version + 1`; `updatedAt = now`.
- запись точечными `$set`:
  ```ts
  await db.collection('user').updateOne(
    { _id: new ObjectId(user._id.toString()) },
    { $set: {
        'settings.general': toSave.general,
        'settings.pay': toSave.pay,
        'settings.materials': toSave.materials,
        'settings.exp': toSave.exp,
        'settings.formula': toSave.formula,
        'settings.mode': toSave.mode,
        'settings.version': toSave.version,
        'settings.updatedAt': toSave.updatedAt,
    }},
  );
  ```

Отдельный лёгкий путь смены только режима: если в payload пришёл `{ mode }` без
справочников — обновить только `settings.mode`/`updatedAt` (для переключателя с `/`):
проверить `payload.pay === undefined` → ветка «только mode».
✅ Юзер сохраняет свои числа и `mode`; конфликт версий → 409; админ с
`?scope=global` правит шаблон; не-админ с `scope=global` → 403.

---

## Шаг 5. `POST /api/calculate`

`app/api/calculate/route.ts`:
```ts
const user = await getCurrentUser();            // null для гостя
const settings = await resolveSettingsForCalc(db, user);
if (!settings) return errNoSettings();
const data = calculateConcreteOffer(normalized, settings);
```
`auth()` внутри `getCurrentUser`; браузерный `fetch` шлёт cookie сам.
✅ Гость считает по шаблону; юзер в `own` — по своим; юзер в `global` — по живому
шаблону (правка админом сразу видна).

---

## Шаг 6. `/edit` — прямой вызов хелпера

`app/edit/page.tsx`:
- удалить `fetchSettings()` (HTTP без cookie).
- ```ts
  const user = await getCurrentUser();           // middleware уже не пустит гостя
  const { db } = await getDb(clientPromise, null);
  const isAdmin = user?.role === 'admin';
  const settings = await getOrCreateUserSettings(db, user!);
  ```
- пробросить в форму `settings`, `isAdmin`, `settings.mode`.
✅ Страница рендерит личные настройки без обращения к своему HTTP-роуту; куки-баг
устранён.

---

## Шаг 7. Форма: селектор источника + admin-режим

`app/components/choiceType/choiceType.tsx` — принять и пробросить
`isAdmin`, `mode`.

`app/components/concreteType/concreteType.tsx`:
- селектор «Мои значения / Шаблон администратора»:
  - юзер: «Шаблон» — поля `disabled` (read-only просмотр через `GET ?scope=global`
    или переданный шаблон), выбор вкладки шлёт `PUT { mode }`;
  - админ: «Шаблон» — редактируемо, сохранение → `PUT ?scope=global`.
- PUT личных настроек добавляет в тело `mode`.
✅ Юзер видит и read-only шаблон, и свои; переключение меняет `mode` в БД; админ
правит шаблон с того же экрана.

---

## Шаг 8. Калькулятор `/` — переключатель режима

`app/components/calculator/*`:
- для авторизованного показать тумблер `own/global` (начальное значение — из
  `GET /api/settings`); смена → `PUT { mode }` → перезапросить расчёт.
- гость тумблер не видит.
✅ Смена режима на `/` сразу меняет результат расчёта.

---

## Шаг 9. Миграция

`scripts/migrate-global-scope.mjs` (новый):
```js
// подключиться по MONGODB_URI/DB_NAME, проставить scope:'global'
db.collection('settings').updateMany(
  { scope: { $exists: false } }, { $set: { scope: 'global' } },
);
```
Запуск: `node scripts/migrate-global-scope.mjs`. Идемпотентно.
✅ У документа(ов) `settings` появилось `scope:'global'`; повторный прогон ничего
не меняет.

---

## Шаг 10. Тесты и ручная проверка

- Обновить `scripts/check-calculate-validation.mjs` и `check-calculate-regression.mjs`
  под выбор источника (мокать `user`/`mode` или прогонять `calculateConcreteOffer`
  с разными `settings`).
- Ручной сценарий (зафиксировать в PR-описании):
  1. Юзер A меняет числа → сохраняет → видит свои; БД: `user.settings` создан.
  2. Юзер B — свои значения отличаются; расчёты A и B изолированы.
  3. Юзер A переключает `global` → расчёт по шаблону; обратно `own` → свои на месте.
  4. Админ правит шаблон (`scope=global`) → юзер в `global` видит новые числа.
  5. Гость (разлогин) считает по шаблону.
  6. Конфликт версий: два таба, сохранить во втором → 409.
✅ `npm run lint`, `npx tsc --noEmit`, оба `npm run test:calculate-*` зелёные;
ручной сценарий пройден.

---

## Порядок коммитов (предлагаемый)

1. `feat(types): UserSettings + DbUser.settings, getUserSafe`
2. `feat(settings): server helpers (clone, resolve, template)`
3. `feat(api/settings): per-user GET/PUT + admin scope=global`
4. `feat(api/calculate): user-aware settings source`
5. `feat(edit): direct helper call, pass isAdmin/mode`
6. `feat(ui): source selector + mode toggle (edit + calculator)`
7. `chore(db): scope=global migration script`
8. `test: per-user settings coverage + manual checklist`

# План: белый лейбл — логотип и реквизиты подрядчика в шапке и в PDF

Создан: 14.09.2026
Основание: `PROJECT-KNOWLEDGE.md`, раздел 1 («КП делает подрядчик для СВОЕГО
заказчика → белый лейбл, его логотип»). Первый шаг ветки 1.

## Зачем

Подрядчик выдаёт КП своему заказчику. Сейчас на каждом КП и на каждой странице
сайта стоит логотип и реквизиты ПРОФИКС — подрядчик не может показать такой
документ клиенту, а значит не пользуется калькулятором как инструментом продажи.
Даём зарегистрированному пользователю подставить свой логотип и свой текст
реквизитов. Наши данные остаются у гостя и у администратора.

## Решения

1. **Модель — два поля, без структуры.** Логотип и один многострочный текст.
   Никаких отдельных полей ИНН/КПП/телефон: у ИП нет КПП, у кого-то сайт и
   Telegram — свободный текст покрывает всё, валидация реквизитов не нужна.

   ```ts
   // app/constants/branding.ts
   export type Branding = {
       logo: { dataUrl: string } | null; // PNG/JPEG data-URL, ≤ 300 КБ
       text: string;                     // ≤ 600 символов, ≤ 8 строк
   };
   export const BRANDING_LIMITS = {
       logoBytes: 300 * 1024,
       logoMaxSide: 600,   // px, ужимаем на клиенте
       textChars: 600,
       textLines: 8,
   };
   export const DEFAULT_BRANDING: Branding // наш логотип + текущие строки из PDF.tsx
   ```

2. **Где хранить — `user.branding`,** рядом с `user.settings`. Это данные
   профиля, а не расчёта: нет `version`, нет scope own/global, админ их не
   шаблонизирует. Миграция БД не нужна — поле опциональное.

3. **Логотип — в Mongo как data-URL, не файлом.** У приложения
   `output: standalone` в Docker без volume под загрузки; файлы на диске =
   правка деплоя. 300 КБ на пользователя для Mongo — ничто. Клиент перед
   отправкой прогоняет картинку через `canvas` (масштаб до 600 px по большей
   стороне, экспорт в PNG) — это заодно превращает SVG в растр, потому что
   `@react-pdf` `<Image>` SVG не умеет. Один и тот же data-URL идёт в `<img>`
   шапки сайта и в `<Image>` PDF.

4. **Чей бренд показываем — одна чистая функция,** общая для шапки и PDF:

   ```ts
   // app/utils/branding.ts
   export const resolveBranding = (user: SafeUser | null): Branding
   // нет сессии                  → DEFAULT_BRANDING
   // user.role === 'admin'       → DEFAULT_BRANDING (всегда, что бы ни было сохранено)
   // user, branding не заполнен  → DEFAULT_BRANDING (пока не заполнил — наш)
   // user, branding заполнен     → его logo и его text, без подмешивания наших полей
   ```

   Заполнен = есть логотип ИЛИ непустой текст. Смешивать «его логотип + наш
   ИНН» нельзя: если логотип загружен, а текст пуст — текст в PDF пустой.

5. **Данные для шапки берём на сервере, не через `fetch('/api/lk/me')`.**
   Иначе при загрузке страницы мигает наш логотип, потом заменяется на чужой.
   `layout.tsx` уже async-серверный компонент с `headers()` — там
   `resolveBranding(await getCurrentUser())` и проп в `<Header>`.

6. **В шапке сайта — только логотип.** Текст реквизитов нужен заказчику в PDF,
   а не подрядчику на экране. Телефон слева в шапке (`+7 (920) 252-00-01`)
   остаётся только у дефолтного бренда; у пользовательского слева пусто.

7. **Текст — всегда как текст.** `white-space: pre-line` на сайте,
   `text.split('\n')` → отдельные `<Text>` в PDF. Никакого HTML/markdown —
   это пользовательские данные, иначе XSS. Кликабельные `tel:`/`mailto:` в
   PDF при этом теряются; автоподсветка телефонов и e-mail — отдельная мелочь
   на потом, не в этой версии.

## Что уже есть в коде

| Место | Состояние |
| --- | --- |
| `app/components/header.tsx` | Клиентский; телефон и `/logo_svg.svg` зашиты; профиль тянет через `/api/lk/me` для меню ЛК |
| `app/components/PDF/PDF.tsx` (строки 396–428) | Шапка КП зашита: `<Logo/>`, «ООО "ПРОФИКС НН"», телефон, e-mail, ИНН/КПП/ОГРН; `title` документа тоже с ПРОФИКС |
| `app/components/PDF/Logo.tsx` | Наш логотип как набор `<Path>` для react-pdf |
| `app/components/preOffer/PreOffer.tsx` (~464) | Рендерит `<PDF …>` внутри `PDFDownloadLink`; пропы — только данные расчёта |
| `app/components/calculator/calculator.tsx` | Серверный; уже вызывает `getCurrentUser()` → есть откуда взять бренд для PDF |
| `app/layout.tsx` | Серверный async; рендерит `<Header />` без пропов |
| `app/lk/page.tsx` → `LkClient.tsx` | Уже грузит `user` через `getUserSafe` и отдаёт `initialName/initialEmail` пропами — тот же паттерн для `initialBranding` |
| `app/utils/user.ts` `SafeUser` | Тип документа `user`; сюда добавляется `branding?: Branding` |
| `app/api/users/route.ts` | Отдаёт пользователей по белому списку полей — `branding` туда не попадёт автоматически, хорошо |
| `app/utils/rate-limit.ts` | In-memory fixed window, переиспользуем |
| `app/components/contacts/Contacts.tsx` | Офис/склад ПРОФИКС. **Нигде не подключён** — не трогаем |
| `zod` | Уже в зависимостях |

Домен расчёта (`app/domain/concrete-calc.ts`), `/api/calculate`, `settings` —
не задействованы. `npm run test:calculate-regression` должен проходить без
обновления baseline.

## Шаг 0. Константы и чистый рефакторинг (0.5 дня)

Поведение не меняется — отдельный коммит, легко проверить глазами.

- `app/constants/branding.ts`: `Branding`, `BRANDING_LIMITS`, `DEFAULT_BRANDING`.
  В `DEFAULT_BRANDING.text` — построчно то, что сейчас в `PDF.tsx`:
  `ООО "ПРОФИКС НН"` / `Телефон: +7 920 252-00-01` / `Email: office@profix-nn.ru` /
  `ИНН 5258123969 КПП 525801001 ОГРН 1155258004648`. `logo: null` означает
  «наш SVG-логотип» (`<Logo/>` в PDF, `/logo_svg.svg` на сайте).
- `app/utils/branding.ts`: `resolveBranding`, `isBrandingFilled`.
- `PDF.tsx`: шапка компании выносится в `components/PDF/PdfCompanyHeader.tsx`
  с пропом `branding`. Первая строка текста — стилем `companyName`, остальные —
  `companyInfo`. `logo ? <Image src={dataUrl} style={{width:80,height:80,objectFit:'contain'}}/> : <Logo/>`.
  `title` документа: `Предварительная смета — ${первая строка text}`.
  Пока `PDF` получает `branding = DEFAULT_BRANDING` по умолчанию.
- `header.tsx`: телефон и путь к логотипу читаются из `DEFAULT_BRANDING`.

## Шаг 1. Хранение и API (0.5–1 день)

`app/api/lk/branding/route.ts`, все методы через `requireSession`:

- `GET` — `{ status, data: user.branding ?? null }`.
- `PUT` — тело `{ logo: { dataUrl } | null, text: string }`, `$set: { branding }`.
- `DELETE` — `$unset: { branding }` → пользователь снова видит наш дефолт.
- `role === 'admin'` на `PUT`/`DELETE` → 403 «У администратора всегда
  фирменные реквизиты». Правило дублируется в `resolveBranding`: даже если в
  базе у админа что-то окажется, показано не будет.

Валидация (`zod`, схема в `app/lib/branding-schemas.ts`):

- `text`: `trim`, `≤ 600` символов, `≤ 8` строк (`split('\n')`), нормализовать
  `\r\n` → `\n`, вырезать управляющие символы кроме `\n`.
- `logo.dataUrl`: префикс строго `data:image/png;base64,` или
  `data:image/jpeg;base64,`; декодировать base64; размер ≤ 300 КБ; проверить
  magic bytes (`89 50 4E 47` / `FF D8 FF`) — mime из строки доверять нельзя;
  прочитать ширину/высоту из заголовка (PNG IHDR / JPEG SOF), отклонить
  > 2000 px по стороне. SVG, GIF, WebP — 400.
- Rate-limit `PUT`: 20/час на userId (`checkRateLimit('branding:' + userId, …)`).
- Пустой `text` и `logo: null` одновременно → трактовать как `DELETE`.

## Шаг 2. Форма в личном кабинете (1 день)

`app/lk/page.tsx` отдаёт `initialBranding={user?.branding ?? null}` и
`isAdmin`. В `LkClient.tsx` новая карточка **«Логотип и реквизиты для КП»**
под «Данными профиля»:

- Слева превью логотипа (или наш по умолчанию с подписью «стандартный»),
  кнопки «Загрузить» (`<input type=file accept="image/png,image/jpeg,image/svg+xml">`)
  и «Убрать».
- Справа `<textarea rows={6} maxLength={600}>` с подсказкой:
  «Название компании, телефон, e-mail, ИНН — как хотите видеть в шапке КП.
  Первая строка выделяется как название». Счётчик символов и строк.
- Кнопки «Сохранить» и «Вернуть стандартные» (→ `DELETE`).
- Перед `PUT` — клиентское сжатие: `createImageBitmap`/`<img>` → `canvas`
  ≤ 600 px по большей стороне → `toDataURL('image/png')`; если результат
  > 300 КБ — попробовать `image/jpeg` 0.85; если всё ещё больше — ошибка
  пользователю. SVG проходит тем же путём и становится PNG.
- Мини-предпросмотр шапки КП прямо в форме: тот же `PdfCompanyHeader`, но
  HTML-версия (`components/branding/BrandingPreview.tsx`) — чтобы человек видел,
  как лягут строки, не скачивая PDF.
- Админу карточка не показывается; вместо неё одна строка «У администратора
  в шапке и в КП всегда фирменные реквизиты».

Хелпер сжатия — `app/utils/image-client.ts`, чистая функция
`compressLogo(file): Promise<string>`.

## Шаг 3. Шапка сайта (0.5 дня)

- `layout.tsx`: `const branding = resolveBranding(await getCurrentUser())`,
  `<Header branding={branding} />`. На `/pdf-offer` шапка не рендерится — как
  и сейчас.
- `header.tsx`: тип пропа `branding: Branding`. Логотип:
  `branding.logo ? <img src={dataUrl} alt="" className="h-full w-auto max-w-full object-contain"/> : <Image src="/logo_svg.svg" …/>`.
  Обычный `<img>`, не `next/image` — для data-URL он требует `unoptimized`
  и ничего не даёт. Телефон слева — только при `branding === DEFAULT_BRANDING`.
- `fetch('/api/lk/me')` в шапке остаётся — он для имени в меню ЛК.
- После сохранения в ЛК — `router.refresh()`, чтобы шапка обновилась без
  перезагрузки.

## Шаг 4. PDF (0.5 дня)

- `calculator.tsx` уже держит `user` → `branding = resolveBranding(user)` →
  проп в `<Form branding>` → `<PreOffer branding>` → `<PDF branding>`. По цепочке,
  без рефакторинга формы — как и в плане по регионам.
- `PDFProps.branding?: Branding`, дефолт `DEFAULT_BRANDING`. Страница
  `(pdf)/pdf-offer` рендерит `<PDF />` без пропов — остаётся наш дефолт.
- Проверить на длинных строках: `headerLeft` — 60 % ширины, логотип 80×80;
  8 строк по 8 pt влезают, но проверить обрезку названия длиной 60+ символов
  (`companyName` 14 pt) — при необходимости уменьшать до 11 pt, если первая
  строка > 40 символов.
- Имя файла `raschet_<дата>.pdf` не меняется.

## Шаг 5. Проверки и документация (0.5 дня)

- `scripts/check-api-protection.mjs`: анонимный `GET/PUT/DELETE /api/lk/branding`
  → 401.
- `scripts/check-auth-flow.mjs` (или новый `check-branding.mjs`, добавить в
  `package.json` как `test:branding`):
  - user: `PUT` валидный → 200, `GET` возвращает то же; `DELETE` → `GET` даёт `null`;
  - user: `PUT` с `data:image/svg+xml` → 400; PNG-префикс с JPEG-байтами → 400;
    логотип 500 КБ → 400; текст 9 строк → 400;
  - admin: `PUT` → 403;
  - `GET /api/users` под админом: в ответе нет ключа `branding`.
- Юнит-проверка `resolveBranding` (четыре ветки) — в тот же скрипт.
- `npm run test:calculate-regression` — без изменений baseline.
- Руками: скачать PDF под гостем, под user с брендом, под admin — три разные
  шапки; страница `/pdf-offer` — наша.
- `PROJECT-KNOWLEDGE.md`: добавить строку про `user.branding` в раздел 2 и
  отметить, что ветка 1 начата. `DEPLOY.md`: записать, что новых env, volume
  и зависимостей нет — только `docker compose up -d --build`.

## Порядок и оценка

| # | Шаг | Оценка | Блокирует |
| --- | --- | --- | --- |
| 0 | Константы, `resolveBranding`, `PdfCompanyHeader` — без изменения поведения | 0.5 дня | все |
| 1 | `user.branding` + `/api/lk/branding` + валидация | 0.5–1 день | 2 |
| 2 | Карточка в ЛК, сжатие логотипа, предпросмотр | 1 день | — |
| 3 | Шапка сайта через `layout.tsx` | 0.5 дня | — |
| 4 | Проп `branding` до `PDF` | 0.5 дня | — |
| 5 | Тесты, ручная проверка, документация | 0.5 дня | — |

Итого 3.5–4 дня. Шаги 3 и 4 независимы друг от друга и от 2 — можно делать
в любом порядке после 0 и 1. Не пересекается с планом «регион + контакт»
(`2026-09-14-region-and-contact-plan.md`): в коллекцию `calculations` бренд не
попадает, домен не трогается.

## Не делаем в этой версии

- Отдельные поля реквизитов и их валидацию (ИНН, КПП, ОГРН).
- Файловое хранилище логотипов и volume в Docker.
- Кликабельные телефон/e-mail в PDF из свободного текста.
- Цвет акцента (`#54b0bf`) и шрифты под бренд подрядчика.
- Бренд в шапке для `/pdf-offer` и в письмах (писем ещё нет).

## Открытые вопросы

1. Пользователь загрузил логотип, но текст оставил пустым — в PDF рядом с
   логотипом пусто. Принимаем, или требовать хотя бы одну строку текста при
   наличии логотипа? Предложение: требовать первую строку (название) — иначе
   у заказчика КП без имени исполнителя.
2. Лимиты 600 символов / 8 строк / 300 КБ — цифры на глаз, править по факту.
3. Показывать ли подрядчику в ЛК подсказку, что при пустом бренде на его КП
   стоит ПРОФИКС? Предложение: да, одной строкой над карточкой — это ещё и
   мотивация заполнить.

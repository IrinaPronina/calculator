# День 1: инвентаризация PHP-логики и карта соответствий PHP -> Next.js

Дата: 2026-03-11

## 1) Контур текущего PHP-решения (источник правды)

- Точка входа: `calc.php`
- Контроллер: `controller.php` (`task=calculate`)
- Модель: `models/calc.php` (PDF + email)
- Основная расчетная логика: `configs/concrete_floors.php`
- Тарифы/коэффициенты: `configs/concrete_floors.json`
- Валидация/описание запроса: `installCheck`, `setDescription` внутри `configs/concrete_floors.php`

## 2) Контур Next.js (текущее состояние)

- API расчета: `app/api/calculate/route.ts`
- Домен расчета: `app/domain/concrete-calc.ts`
- Типы запроса/ответа: `app/models/concreteCalcTypes.ts`
- UI формы: `app/components/ form/Form.tsx`
- Отображение параметров: `app/components/info/Info.tsx`
- Предпросмотр сметы: `app/components/preOffer/PreOffer.tsx`

## 3) Поля формы: паритет с PHP

Статусы:
- `done` — есть в UI и передается в `/api/calculate`
- `partial` — есть, но нет полного parity поведения
- `missing` — отсутствует

| Поле | PHP | Next | Статус | Примечание |
|---|---|---|---|---|
| area | да | да | done | диапазон 100..20000 |
| base | concrete/sand/rubble | base_concrete/base_sand/base_rubble | done | маппинг на UI label сделан |
| thickness | 70..250 или auto | 70..250 или auto | done | запрет отрицательных значений |
| preparation | 50..100 или no | 50..100 или no | done | отдельный блок есть |
| reinforcement | single/double/grid/fiber/doNotKnow | те же | done | выбранный тип передается |
| reinforcement_* (детализация) | да | нет | missing | single/double/grid/fiber параметры не перенесены |
| concrete_grade | 1/2/3 | 1/2/3 | done | блок добавлен |
| fiber (микрофибра) | no или 0.5..1.0 | no или 0.5..1.0 | done | блок добавлен |
| topping | no или 3..5 | yes/no + amount | partial | в API есть `topping_amount`, в домене пока не используется |
| pump | yes/no | yes/no | partial | передается в API, в формулах не используется |

## 4) Услуги (артикулы): покрытие формул

### 4.1 Полный список артикулов в PHP (`configs/concrete_floors.php`)

`0154, 0101, 0156, 0100, 0105, 0104, 0135, 0112, 0155, 0145, 0146, 0147, 0102, 0110, 0140, 0130, 0109, 0517, 7053, 7013, 1010, 1011, 7079, 7082, 7126, 7127, 7083, 7085, 7128, 7129, 7086, 7003, 7004, 7006, 7007, 7135, 7131, 7101, 7005, 7009, 1045, 1035, 1033, 1002, 1028, 1031, 7021, 7023, 7025, 1221, 1601, 1404, 9999, 0162, 0928`

Итого: **55** артикулов.

### 4.2 Реализовано в Next `SERVICE_META`

`0156, 0100, 0155, 0145, 0146, 0147, 0102, 0110, 0140, 0130, 0109, 0517`

Итого: **12/55** артикулов.

### 4.3 Вывод по покрытию

- Полностью покрыт только базовый поднабор раздела "Оплата труда".
- Не покрыты:
  - часть "Оплата труда" (0154, 0101, 0105, 0104, 0135, 0112),
  - весь раздел "Материалы" (7053...9999),
  - раздел "Эксплуатация" (0162, 0928).

## 5) Валидации: PHP vs Next

### В PHP (`installCheck`) есть
- строгая проверка area/thickness/preparation/base;
- детальная проверка параметров армирования (диаметры/ячейки);
- ошибки по недопустимым сочетаниям.

### В Next сейчас
- есть проверки area/thickness/preparation/base/concrete_grade/fiber/pump;
- нет детализированных проверок по `reinforcement_*` (их пока нет в UI).

## 6) Выявленные пробелы (backlog для Дня 2-3)

1. Довести формулы до 55 артикулов (расширить `SERVICE_META` + `serviceVolume`).
2. Добавить в UI детализацию для армирования:
- single: `reinforcement_single_fitting`, `reinforcement_single_cell`
- double: `reinforcement_double_fitting`, `reinforcement_double_fitting2`, `reinforcement_double_cell`
- grid: `reinforcement_grid_fitting`, `reinforcement_grid_cell`
- fiber: `reinforcement_fiber`
3. Перенести валидации из `installCheck` 1:1.
4. Начать перенос `setDescription` (чтобы PDF/письмо повторяли старую формулировку).
5. Подключить `topping_amount` и `pump` к реальным формулам материалов/эксплуатации.

## 7) Definition of Done для Дня 1

- [x] Полный список полей и формул из PHP зафиксирован.
- [x] Карта соответствий PHP -> Next составлена.
- [x] Понятный список пробелов и задач на День 2-3 подготовлен.

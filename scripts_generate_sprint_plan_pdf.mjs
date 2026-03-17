import fs from 'node:fs/promises';
import React from 'react';
import { pdf, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 11, lineHeight: 1.4 },
  title: { fontSize: 18, marginBottom: 12, fontWeight: 700 },
  h2: { fontSize: 13, marginTop: 10, marginBottom: 6, fontWeight: 700 },
  item: { marginBottom: 4 },
  bold: { fontWeight: 700 },
  divider: { marginVertical: 6 }
});

const App = () => React.createElement(
  Document,
  null,
  React.createElement(
    Page,
    { size: 'A4', style: styles.page },
    React.createElement(Text, { style: styles.title }, 'Sprint-план переноса проекта с PHP на Next.js'),

    React.createElement(Text, { style: styles.h2 }, 'Спринт 1 (Неделя 1): Расчетный паритет и стабильный API'),
    React.createElement(Text, { style: styles.item }, '1. День 1: инвентаризация PHP-логики (чеклист формул/условий, карта соответствий PHP -> TS).'),
    React.createElement(Text, { style: styles.item }, '2. День 2-3: перенос формул в Next domain (Оплата труда, Материалы, Эксплуатация).'),
    React.createElement(Text, { style: styles.item }, '3. День 4: унифицированная валидация (zod, единые ошибки UI/API).'),
    React.createElement(Text, { style: styles.item }, '4. День 5: тесты паритета (10-20 regression-кейсов, фиксы расхождений).'),
    React.createElement(Text, { style: [styles.item, styles.bold] }, 'Результат: API расчета эквивалентен PHP.'),

    React.createElement(Text, { style: styles.h2 }, 'Спринт 2 (Неделя 2): PDF + Email + админ-настройки'),
    React.createElement(Text, { style: styles.item }, '1. День 1-2: генерация PDF из данных /api/calculate (шаблон, шрифты, таблицы).'),
    React.createElement(Text, { style: styles.item }, '2. День 3: отправка email клиенту и администратору с PDF-вложением.'),
    React.createElement(Text, { style: styles.item }, '3. День 4: доработка CRUD settings в MongoDB + валидации тарифов.'),
    React.createElement(Text, { style: styles.item }, '4. День 5: интеграционный прогон (форма -> расчет -> PDF -> email).'),
    React.createElement(Text, { style: [styles.item, styles.bold] }, 'Результат: полный цикл работает в Next без PHP.'),

    React.createElement(Text, { style: styles.h2 }, 'Спринт 3 (Неделя 3): Пре-прод и переключение'),
    React.createElement(Text, { style: styles.item }, '1. День 1: observability (логи, метрики, алерты).'),
    React.createElement(Text, { style: styles.item }, '2. День 2: staging/UAT с бизнес-кейсами.'),
    React.createElement(Text, { style: styles.item }, '3. День 3: канареечный релиз (10-20% трафика).'),
    React.createElement(Text, { style: styles.item }, '4. День 4: полный rollout при стабильных метриках.'),
    React.createElement(Text, { style: styles.item }, '5. День 5: пост-релиз, документация, декомиссия PHP.'),
    React.createElement(Text, { style: [styles.item, styles.bold] }, 'Результат: миграция завершена в проде.'),

    React.createElement(Text, { style: styles.h2 }, 'Критерии готовности к переключению'),
    React.createElement(Text, { style: styles.item }, '1. Расхождение с PHP по контрольным кейсам <= 1-2% (или 0 для критичных позиций).'),
    React.createElement(Text, { style: styles.item }, '2. PDF и email проходят приемку.'),
    React.createElement(Text, { style: styles.item }, '3. 5xx на staging/канареечном трафике в допустимом пороге.'),
    React.createElement(Text, { style: styles.item }, '4. Подготовлен и проверен план быстрого отката.'),
  )
);

const instance = pdf(React.createElement(App));
const buffer = await instance.toBuffer();
await fs.writeFile('/Users/irinapronina/Documents/Проекты/NEXT/calculator/sprint-plan-migration.pdf', buffer);
console.log('OK');

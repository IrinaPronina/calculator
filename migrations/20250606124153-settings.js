module.exports = {
    /**
     * @param db {import('mongodb').Db}
     * @param client {import('mongodb').MongoClient}
     * @returns {Promise<void>}
     */
    async up(db, client) {
        await db.collection('settings').insertOne({
            general: { rate: 2, overheads: 1, profit: 50 },
            pay: [
                {
                    id: '0154',
                    name: 'Укладка мембраны',
                    price: 35,
                    increase: 35,
                },
                {
                    id: '0101',
                    name: 'Устройство бетонной подготовки',
                    price: 35,
                    increase: 150,
                },
                {
                    id: '0156',
                    name: 'Укладка пленки полиэтиленовой',
                    price: 35,
                    increase: 16,
                },
                {
                    id: '0100',
                    name: 'Армирование готовой сеткой',
                    price: 35,
                    increase: 70,
                },
                {
                    id: '0105',
                    name: 'Армирование из арматуры в 1 слой',
                    price: 35,
                    increase: 120,
                },
                {
                    id: '0104',
                    name: 'Армирование на фиксаторах "змейка" в 2 слоя',
                    price: 35,
                    increase: 220,
                },
                {
                    id: '0135',
                    name: 'Армирование объемное в 2 слоя',
                    price: 35,
                    increase: 260,
                },
                {
                    id: '0112',
                    name: 'Изготовление каркасов',
                    price: 35,
                    increase: 12,
                },
                {
                    id: '0155',
                    name: 'Установка маячковых направляющих',
                    price: 35,
                    increase: 60,
                },
                {
                    id: '0145',
                    name: 'Укладка бетонной смеси до 100 мм',
                    price: 35,
                    increase: 200,
                },
                {
                    id: '0146',
                    name: 'Укладка бетонной смеси до 150 мм',
                    price: 35,
                    increase: 210,
                },
                {
                    id: '0147',
                    name: 'Укладка бетонной смеси до 250 мм',
                    price: 35,
                    increase: 220,
                },
                {
                    id: '0102',
                    name: 'Внесение упрочняющей смеси',
                    price: 45,
                    increase: 15,
                },
                {
                    id: '0110',
                    name: 'Затирка поверхности бетона',
                    price: 50,
                    increase: 95,
                },
                {
                    id: '0140',
                    name: 'Покрытие защитным лаком в 1 слой',
                    price: 45,
                    increase: 10,
                },
                {
                    id: '0130',
                    name: 'Нарезка усадочных швов',
                    price: 100,
                    increase: 40,
                },
                {
                    id: '0109',
                    name: 'Заполнение усадочных швов',
                    price: 100,
                    increase: 30,
                },
                {
                    id: '0517',
                    name: 'Уборка строительного мусора',
                    price: 40,
                    increase: 10,
                },
            ],
            materials: [
                {
                    id: '7053',
                    name: 'Мембрана профилированная',
                    price: 185,
                    increase: 2,
                },
                {
                    id: '7013',
                    name: 'Бетон М100 В7,5 на гравии',
                    price: 7000,
                    increase: 2,
                },
                {
                    id: '1010',
                    name: 'Пленка 100мкм п/э техническая рукав 1,5м*100м',
                    price: 11,
                    increase: 10,
                },
                {
                    id: '1011',
                    name: 'Пленка 200мкм п/э техническая рукав 1,5м*100м',
                    price: 18,
                    increase: 10,
                },
                {
                    id: '7079',
                    name: 'Сетка сварная С3 100х100мм',
                    price: 114,
                    increase: 5,
                },
                {
                    id: '7082',
                    name: 'Сетка сварная С4 100х100мм',
                    price: 198,
                    increase: 5,
                },
                {
                    id: '7126',
                    name: 'Сетка сварная С5 100х100мм',
                    price: 309,
                    increase: 5,
                },
                {
                    id: '7127',
                    name: 'Сетка сварная С3 150х150мм',
                    price: 86,
                    increase: 5,
                },
                {
                    id: '7083',
                    name: 'Сетка сварная С4 150х150мм',
                    price: 150,
                    increase: 5,
                },
                {
                    id: '7085',
                    name: 'Сетка сварная С5 150х150мм',
                    price: 234,
                    increase: 5,
                },
                {
                    id: '7128',
                    name: 'Сетка сварная С3 200х200мм',
                    price: 75,
                    increase: 5,
                },
                {
                    id: '7129',
                    name: 'Сетка сварная С4 200х200мм',
                    price: 107,
                    increase: 5,
                },
                {
                    id: '7086',
                    name: 'Сетка сварная С5 200х200мм',
                    price: 142,
                    increase: 5,
                },
                {
                    id: '7003',
                    name: 'Арматура Ø8 A500С, яч 150х150',
                    price: 56490,
                    increase: 3,
                },
                {
                    id: '7004',
                    name: 'Арматура Ø8 A500С, яч 200х200',
                    price: 56490,
                    increase: 3,
                },
                {
                    id: '7006',
                    name: 'Арматура Ø10 A500С, яч 150х150',
                    price: 57190,
                    increase: 3,
                },
                {
                    id: '7007',
                    name: 'Арматура Ø10 A500С, яч 200х200',
                    price: 57190,
                    increase: 3,
                },
                {
                    id: '7135',
                    name: 'Арматура Ø12 A500С, яч 200х200',
                    price: 55290,
                    increase: 3,
                },
                {
                    id: '7131',
                    name: 'Арматура Ø14 A500С, яч 200х200',
                    price: 55290,
                    increase: 3,
                },
                {
                    id: '7101',
                    name: 'Труба профильная 25х25х1,5 мм)',
                    price: 70090,
                    increase: 3,
                },
                {
                    id: '7005',
                    name: 'Арматура Ø10 А500С (фиксаторы)',
                    price: 57190,
                    increase: 3,
                },
                {
                    id: '7009',
                    name: 'Арматура Ø20 кл. A1 (компенсаторы)',
                    price: 59400,
                    increase: 3,
                },
                {
                    id: '1045',
                    name: 'Фиксатор металлический "змейка" ф4',
                    price: 70,
                    increase: 10,
                },
                {
                    id: '1035',
                    name: 'Фиксатор арматуры на сыпучий грунт ФС-25/30',
                    price: 4,
                    increase: 25,
                },
                {
                    id: '1033',
                    name: 'Фиксатор арматуры "Cтульчик" 25 мм',
                    price: 2,
                    increase: 0,
                },
                {
                    id: '1002',
                    name: 'ВПС-полотно ТИЛИТ Базис 8мм',
                    price: 83,
                    increase: 5,
                },
                {
                    id: '1028',
                    name: 'Фибра полимерная MONOPOL Macro',
                    price: 760,
                    increase: 5,
                },
                {
                    id: '1031',
                    name: 'Фибра полипропиленовая 12мм, микрофибра',
                    price: 314,
                    increase: 5,
                },
                {
                    id: '7021',
                    name: 'Бетон М250 В20 на гравии',
                    price: 8400,
                    increase: 2,
                },
                {
                    id: '7023',
                    name: 'Бетон М300 В22,5 на гравии',
                    price: 8600,
                    increase: 2,
                },
                {
                    id: '7025',
                    name: 'Бетон М350 В25 на гравии',
                    price: 8800,
                    increase: 2,
                },
                {
                    id: '1221',
                    name: 'Топпинг MONOPOL Top 200 корундовый',
                    price: 25,
                    increase: 25,
                },
                {
                    id: '1601',
                    name: 'Пропитка MONOPOL Sealer 2',
                    price: 387,
                    increase: 20,
                },
                {
                    id: '1404',
                    name: 'Герметик MONOPOL PU 40 серый 600мл',
                    price: 442,
                    increase: 15,
                },
                {
                    id: '9999',
                    name: 'Расходные и вспомогательные материалы',
                    price: 45,
                    increase: 0,
                },
            ],
            exp: [
                {
                    id: '0162',
                    name: 'Эксплуатация машин и механизмов',
                    price: 0,
                    increase: 30,
                },
                {
                    id: '0928',
                    name: 'Услуги бетононасоса (смена)',
                    price: 60000,
                    increase: 0,
                },
            ],
        });
    },

    /**
     * @param db {import('mongodb').Db}
     * @param client {import('mongodb').MongoClient}
     * @returns {Promise<void>}
     */
    async down(db) {
        await db.collection('settings').drop();
    },
};

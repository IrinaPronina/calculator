import { FormulaSettings, SettingsType } from '@/app/models/adminDataTypes';
import {
    BaseType,
    CalculateRequest,
    CalculateResponseData,
    CalculationContext,
    ReinforcementType,
    ServiceItem,
} from '@/app/models/concreteCalcTypes';

type AutoCode =
    | '34150'
    | '35150'
    | '18200'
    | '110200'
    | '112200'
    | '2810200'
    | '21012200'
    | 0
    | false;

const SERVICE_META = {
    '0154': {
        name: 'Укладка мембраны',
        unit: 'м²',
        note: 'с проклейкой стыков',
    },
    '0101': {
        name: 'Устройство бетонной подготовки',
        unit: 'м²',
        note: 'по нивелиру',
    },
    '0156': {
        name: 'Укладка пленки полиэтиленовой',
        unit: 'м²',
        note: 'в 1 слой с проклейкой',
    },
    '0100': {
        name: 'Армирование готовой сеткой',
        unit: 'м²',
        note: 'укладка с нахлестом',
    },
    '0105': {
        name: 'Армирование из арматуры  в 1 слой',
        unit: 'м²',
        note: 'вязка проволокой',
    },
    '0104': {
        name: 'Армирование на фиксаторах "змейка" в 2 слоя',
        unit: 'м²',
        note: 'вязка проволокой',
    },
    '0135': {
        name: 'Армирование объемное в 2 слоя',
        unit: 'м²',
        note: 'вязка проволокой',
    },
    '0112': {
        name: 'Изготовление каркасов',
        unit: 'шт',
        note: 'по чертежу, 0,5шт/м2',
    },
    '0155': {
        name: 'Установка маячковых направляющих',
        unit: 'м/п',
        note: 'на сварку, съемные',
    },
    '0145': {
        name: 'Укладка бетонной смеси до 100 мм',
        unit: 'м²',
        note: 'с вибрацией',
    },
    '0146': {
        name: 'Укладка бетонной смеси до 150 мм',
        unit: 'м²',
        note: 'с вибрацией',
    },
    '0147': {
        name: 'Укладка бетонной смеси до 250 мм',
        unit: 'м²',
        note: 'с вибрацией',
    },
    '0102': {
        name: 'Внесение упрочняющей смеси',
        unit: 'м²',
        note: 'с помощью тележки',
    },
    '0110': {
        name: 'Затирка поверхности бетона',
        unit: 'м²',
        note: 'железнение лопастями',
    },
    '0140': {
        name: 'Покрытие защитным лаком в 1 слой',
        unit: 'м²',
        note: 'для набора прочности',
    },
    '0130': {
        name: 'Нарезка усадочных швов',
        unit: 'м/п',
        note: '1/3 от толщины пола',
    },
    '0109': {
        name: 'Заполнение усадочных швов',
        unit: 'м/п',
        note: 'вилатерм с герметиком',
    },
    '0517': {
        name: 'Уборка строительного мусора',
        unit: 'м²',
        note: 'сухая уборка',
    },
    '7053': {
        name: 'Мембрана профилированная',
        unit: 'м²',
        note: '10% на перекрытие',
    },
    '7013': {
        name: 'Бетон М100 В7,5 на гравии',
        unit: 'м³',
        note: '5% запас-усадка',
    },
    '1010': {
        name: 'Плёнка техническая полиэтиленовая 100 мкм',
        unit: 'м²',
        note: '10% на перекрытие',
    },
    '1011': {
        name: 'Плёнка техническая полиэтиленовая 200 мкм',
        unit: 'м²',
        note: '10% на перекрытие',
    },
    '7079': {
        name: 'Сетка сварная С3 100х100мм',
        unit: 'м²',
        note: 'S+15% карта 3х2м',
    },
    '7082': {
        name: 'Сетка сварная С4 100х100мм',
        unit: 'м²',
        note: 'S+15% карта 3х2м',
    },
    '7126': {
        name: 'Сетка сварная С5 100х100мм',
        unit: 'м²',
        note: 'S+15% карта 3х2м',
    },
    '7127': {
        name: 'Сетка сварная С3 150х150мм',
        unit: 'м²',
        note: 'S+20% карта 3х2м',
    },
    '7083': {
        name: 'Сетка сварная С4 150х150мм',
        unit: 'м²',
        note: 'S+20% карта 3х2м',
    },
    '7085': {
        name: 'Сетка сварная С5 150х150мм',
        unit: 'м²',
        note: 'S+20% карта 3х2м',
    },
    '7128': {
        name: 'Сетка сварная С3 200х200мм',
        unit: 'м²',
        note: 'S+35% карта 3х2м',
    },
    '7129': {
        name: 'Сетка сварная С4 200х200мм',
        unit: 'м²',
        note: 'S+35% карта 3х2м',
    },
    '7086': {
        name: 'Сетка сварная С5 200х200мм',
        unit: 'м²',
        note: 'S+35% карта 3х2м',
    },
    '7003': {
        name: 'Арматура Ø8 A500С, яч 150х150',
        unit: 'т',
        note: '14м/м² на 1 слой',
    },
    '7004': {
        name: 'Арматура Ø8 A500С, яч 200х200',
        unit: 'т',
        note: '11м/м² на 1 слой',
    },
    '7006': {
        name: 'Арматура Ø10 A500С, яч 150х150',
        unit: 'т',
        note: '14,2м/м² на 1 слой',
    },
    '7007': {
        name: 'Арматура Ø10 A500С, яч 200х200',
        unit: 'т',
        note: '11,2м/м² на 1 слой',
    },
    '7135': {
        name: 'Арматура Ø12 A500С, яч 200х200',
        unit: 'т',
        note: '11,4м/м² на 1 слой',
    },
    '7131': {
        name: 'Арматура Ø14 A500С, яч 200х200',
        unit: 'т',
        note: '11,6м/м² на 1 слой',
    },
    '7101': {
        name: 'Труба профильная 25х25х1,5 мм)',
        unit: 'т',
        note: '0,25м/м², коэф=1,2',
    },
    '7005': {
        name: 'Арматура Ø10 А500С (фиксаторы)',
        unit: 'т',
        note: 'штыри для маяков',
    },
    '7009': {
        name: 'Арматура Ø20 кл. A1 (компенсаторы)',
        unit: 'т',
        note: 'шаг 400мм, L=100см',
    },
    '1045': {
        name: 'Фиксатор металлический \"змейка\" ф4',
        unit: 'м/п',
        note: '1 м/п на 1 м²',
    },
    '1035': {
        name: 'Фиксатор арматуры на сыпучий грунт ФС-25/30',
        unit: 'шт',
        note: 'расход 2шт/м²',
    },
    '1033': {
        name: 'Фиксатор арматуры \"Cтульчик\" 25 мм',
        unit: 'шт',
        note: 'расход 2шт/м²',
    },
    '1002': {
        name: 'ВПС-полотно ТИЛИТ Базис 8мм',
        unit: 'м²',
        note: 'расход +10%',
    },
    '1028': {
        name: 'Фибра полимерная MONOPOL Macro',
        unit: 'кг',
        note: '1-3 кг/1м³ бетона',
    },
    '1031': {
        name: 'Фибра полипропиленовая 12мм, микрофибра',
        unit: 'кг',
        note: '0,5-1 кг/1м³ бетона',
    },
    '7021': {
        name: 'Бетон М250 В20 на гравии',
        unit: 'м³',
        note: '5% запас-усадка',
    },
    '7023': {
        name: 'Бетон М300 В22,5 на гравии',
        unit: 'м³',
        note: '5% запас-усадка',
    },
    '7025': {
        name: 'Бетон М350 В25 на гравии',
        unit: 'м³',
        note: '5% запас-усадка',
    },
    '1221': {
        name: 'Топпинг MONOPOL Top 200 корундовый',
        unit: 'кг',
        note: 'расход 3-5 кг/м²',
    },
    '1601': {
        name: 'Пропитка MONOPOL Sealer 2',
        unit: 'л',
        note: 'расход 0,09 л/м²',
    },
    '1404': {
        name: 'Герметик MONOPOL PU 40 серый 600мл',
        unit: 'шт',
        note: '80 мл/м = 0,08шт/м',
    },
    '9999': {
        name: 'Расходные и вспомогательные материалы',
        unit: 'м²',
        note: 'инструмент, ГСМ и пр.',
    },
    '0162': {
        name: 'Эксплуатация машин и механизмов',
        unit: 'м²',
        note: 'амортизация',
    },
    '0928': {
        name: 'Услуги бетононасоса (смена)',
        unit: 'смен',
        note: 'с трассой до 50 м',
    },
} as const;

type ServiceCode = keyof typeof SERVICE_META;

const DEFAULT_FORMULA: FormulaSettings = {
    cuttingStepThresholdCm: 8,
    cuttingStepSmallM: 3,
    cuttingStepLargeM: 6,
    guidesAreaThreshold: 150,
    guidesAreaFactor: 0.45,
    filmOverlapCoef: 1.1,
    concreteReserveCoef: 1.05,
    meshOverlap100Coef: 1.15,
    meshOverlap150Coef: 1.2,
    meshOverlap200Coef: 1.35,
    sealerConsumptionLpm2: 0.09,
    jointSealantCoef: 0.08,
    pumpAreaPerShift: 500,
};

const resolveFormula = (formula?: Partial<FormulaSettings>): FormulaSettings => {
    const resolved = { ...DEFAULT_FORMULA };
    if (!formula) {
        return resolved;
    }

    (Object.keys(DEFAULT_FORMULA) as Array<keyof FormulaSettings>).forEach(
        (key) => {
            const raw = formula[key];
            const value = typeof raw === 'number' ? raw : Number(raw);
            if (Number.isFinite(value) && value > 0) {
                resolved[key] = value;
            }
        },
    );

    return resolved;
};

const FALLBACK_PRICES: Record<ServiceCode, number> = {
    '0154': 0,
    '0101': 0,
    '0156': 0,
    '0100': 0,
    '0105': 0,
    '0104': 0,
    '0135': 0,
    '0112': 0,
    '0155': 0,
    '0145': 0,
    '0146': 0,
    '0147': 0,
    '0102': 22,
    '0110': 143,
    '0140': 15,
    '0130': 80,
    '0109': 60,
    '0517': 14,
    '7053': 0,
    '7013': 0,
    '1010': 0,
    '1011': 0,
    '7079': 0,
    '7082': 0,
    '7126': 0,
    '7127': 0,
    '7083': 0,
    '7085': 0,
    '7128': 0,
    '7129': 0,
    '7086': 0,
    '7003': 0,
    '7004': 0,
    '7006': 0,
    '7007': 0,
    '7135': 0,
    '7131': 0,
    '7101': 0,
    '7005': 0,
    '7009': 0,
    '1045': 0,
    '1035': 0,
    '1033': 0,
    '1002': 0,
    '1028': 0,
    '1031': 0,
    '7021': 0,
    '7023': 0,
    '7025': 0,
    '1221': 0,
    '1601': 0,
    '1404': 0,
    '9999': 0,
    '0162': 0,
    '0928': 0,
};

export const normalizeCalculateRequest = (
    raw: Partial<CalculateRequest>,
): Required<CalculateRequest> => {
    const asNumber = (value: unknown, fallback = 0): number => {
        const num = Number(value);
        return Number.isFinite(num) ? num : fallback;
    };

    const normalizedThickness =
        raw.thickness === 'auto' || raw.thickness === undefined
            ? 'auto'
            : Number(raw.thickness);

    return {
        area: Number(raw.area),
        base: (raw.base || 'base_concrete') as BaseType,
        thickness: normalizedThickness,
        preparation:
            raw.preparation === 'no' || raw.preparation === undefined
                ? 'no'
                : Number(raw.preparation),
        concrete_grade:
            raw.concrete_grade === undefined ? 1 : Number(raw.concrete_grade),
        fiber:
            raw.fiber === 'no' || raw.fiber === undefined
                ? 'no'
                : Number(raw.fiber),
        pump: raw.pump === 'yes' ? 'yes' : 'no',
        topping_amount: asNumber(raw.topping_amount, 3),
        reinforcement: (raw.reinforcement || 'doNotKnow') as ReinforcementType,
        topping: raw.topping || 'yes',
        reinforcement_single_fitting: asNumber(
            raw.reinforcement_single_fitting,
        ),
        reinforcement_single_cell: asNumber(raw.reinforcement_single_cell),
        reinforcement_double_fitting: asNumber(
            raw.reinforcement_double_fitting,
        ),
        reinforcement_double_fitting2: asNumber(
            raw.reinforcement_double_fitting2,
        ),
        reinforcement_double_cell: asNumber(raw.reinforcement_double_cell),
        reinforcement_grid_fitting: asNumber(raw.reinforcement_grid_fitting),
        reinforcement_grid_cell: asNumber(raw.reinforcement_grid_cell),
        reinforcement_fiber: asNumber(raw.reinforcement_fiber, 1),
    };
};

export const validateCalculateRequest = (
    request: Required<CalculateRequest>,
): string[] => {
    const errors: string[] = [];
    const area = Number(request.area);

    if (!Number.isFinite(area) || area < 100 || area > 20000) {
        errors.push('Площадь должна быть в диапазоне от 100 до 20000 м².');
    }

    if (!['base_concrete', 'base_sand', 'base_rubble'].includes(request.base)) {
        errors.push('Некорректный тип основания.');
    }

    if (
        request.thickness !== 'auto' &&
        (!Number.isFinite(request.thickness) ||
            request.thickness < 70 ||
            request.thickness > 250)
    ) {
        errors.push(
            'Толщина должна быть в диапазоне от 70 до 250 мм или auto.',
        );
    }

    if (
        request.preparation !== 'no' &&
        (!Number.isFinite(request.preparation) ||
            request.preparation < 50 ||
            request.preparation > 100)
    ) {
        errors.push(
            'Бетонная подготовка должна быть в диапазоне от 50 до 100 мм или Нет.',
        );
    }

    if (![1, 2, 3].includes(Number(request.concrete_grade))) {
        errors.push('Некорректная марка бетона.');
    }

    if (
        request.fiber !== 'no' &&
        (!Number.isFinite(request.fiber) ||
            request.fiber < 0.5 ||
            request.fiber > 1.0)
    ) {
        errors.push('Микрофибра должна быть в диапазоне от 0.5 до 1.0 кг/м³.');
    }

    if (!['yes', 'no'].includes(request.pump)) {
        errors.push('Некорректное значение бетононасоса.');
    }

    if (
        request.topping === 'yes' &&
        (!Number.isFinite(request.topping_amount) ||
            request.topping_amount < 3 ||
            request.topping_amount > 5)
    ) {
        errors.push('Топпинг должен быть в диапазоне от 3 до 5 кг/м².');
    }

    // Валидация армирования (паритет с PHP installCheck)
    switch (request.reinforcement) {
        case 'single': {
            const diam = Number(request.reinforcement_single_fitting);
            const cell = Number(request.reinforcement_single_cell);

            if (![8, 10, 12, 14].includes(diam)) {
                errors.push(
                    'Расчет не досупен для выбранного диаметра арматуры',
                );
            }

            if (![150, 200].includes(cell)) {
                errors.push('Расчет не досупен для выбранного размера ячейки');
            }

            if (cell === 150 && ![8, 10].includes(diam)) {
                errors.push(
                    'Расчет не досупен для выбранного диаметра арматуры',
                );
            }
            break;
        }
        case 'double': {
            const diam1 = Number(request.reinforcement_double_fitting);
            const diam2 = Number(request.reinforcement_double_fitting2);
            const cell = Number(request.reinforcement_double_cell);

            if (
                ![8, 10, 12, 14].includes(diam1) ||
                ![8, 10, 12, 14].includes(diam2)
            ) {
                errors.push(
                    'Расчет не досупен для выбранного диаметра арматуры',
                );
            }

            if (![150, 200].includes(cell)) {
                errors.push('Расчет не досупен для выбранного размера ячейки');
            }

            if (
                cell === 150 &&
                (![8, 10].includes(diam1) || ![8, 10].includes(diam2))
            ) {
                errors.push(
                    'Расчет не досупен для выбранного диаметра арматуры',
                );
            }
            break;
        }
        case 'grid': {
            const diam = Number(request.reinforcement_grid_fitting);
            const cell = Number(request.reinforcement_grid_cell);

            if (![3, 4, 5].includes(diam)) {
                errors.push(
                    'Расчет не досупен для выбранного диаметра арматуры',
                );
            }

            if (![100, 150, 200].includes(cell)) {
                errors.push('Расчет не досупен для выбранного размера ячейки');
            }
            break;
        }
        case 'fiber': {
            const fiberQty = Number(request.reinforcement_fiber);
            if (![1, 2, 3].includes(fiberQty)) {
                errors.push(
                    'Расчет не досупен с выбранным количеством на куб бетона',
                );
            }
            break;
        }
        case 'doNotKnow':
            break;
        default:
            errors.push('Не выбрано адмирование');
    }

    return errors;
};

const getThickness = (request: Required<CalculateRequest>): number => {
    if (request.thickness === 'auto') {
        const map: Record<BaseType, number> = {
            base_concrete: 80,
            base_sand: 120,
            base_rubble: 100,
        };
        return map[request.base];
    }

    return Number(request.thickness);
};

const roundup = (number: number, precision = 0): number => {
    const r = Math.pow(10, precision);
    return Math.ceil(number * r) / r;
};

const cuttingStep = (
    request: Required<CalculateRequest>,
    formula: FormulaSettings,
): number => {
    const mdlThickness = getThickness(request) / 10;
    return mdlThickness <= formula.cuttingStepThresholdCm
        ? formula.cuttingStepSmallM
        : formula.cuttingStepLargeM;
};

const getReinforcementAuto = (
    request: Required<CalculateRequest>,
): AutoCode => {
    if (request.reinforcement !== 'doNotKnow') {
        return false;
    }

    const d = getThickness(request) / 10;

    switch (request.base) {
        case 'base_concrete':
            if (d <= 8) return '34150';
            if (d <= 10) return '35150';
            if (d <= 12) return '18200';
            if (d <= 16) return '110200';
            if (d <= 20) return '2810200';
            if (d <= 25) return '21012200';
            break;
        case 'base_sand':
            if (d <= 8) return '18200';
            if (d <= 10) return '110200';
            if (d <= 12) return '112200';
            if (d <= 20) return '2810200';
            if (d <= 25) return '21012200';
            break;
        case 'base_rubble':
            if (d <= 8) return '35150';
            if (d <= 10) return '110200';
            if (d <= 12) return '112200';
            if (d <= 20) return '2810200';
            if (d <= 25) return '21012200';
            break;
    }

    return 0;
};

const calcPriceWithIncrease = (basePrice: number, increase: number): number => {
    const rate = Number(basePrice);
    const markup = Number(increase);

    if (!Number.isFinite(rate)) {
        return 0;
    }

    if (!Number.isFinite(markup)) {
        return rate;
    }

    return rate + (rate * markup) / 100;
};

const getPriceMap = (settings: SettingsType): Map<string, number> => {
    const pairs: Array<[string, number]> = [];
    settings.pay.forEach((item) =>
        pairs.push([item.id, calcPriceWithIncrease(item.price, item.increase)]),
    );
    settings.materials.forEach((item) =>
        pairs.push([item.id, calcPriceWithIncrease(item.price, item.increase)]),
    );
    settings.exp.forEach((item) =>
        pairs.push([item.id, calcPriceWithIncrease(item.price, item.increase)]),
    );
    return new Map(pairs);
};

const serviceVolume = (
    code: ServiceCode,
    request: Required<CalculateRequest>,
    formula: FormulaSettings,
): number => {
    const area = request.area;
    const mdlThickness = getThickness(request) / 10;
    const auto = getReinforcementAuto(request);
    const reinf = request.reinforcement;
    const fitting = request.reinforcement_single_fitting;
    const cell = request.reinforcement_single_cell;
    const dFitting = request.reinforcement_double_fitting;
    const dFitting2 = request.reinforcement_double_fitting2;
    const dCell = request.reinforcement_double_cell;
    const gFitting = request.reinforcement_grid_fitting;
    const gCell = request.reinforcement_grid_cell;
    const prep = request.preparation;
    const fiberMacro = request.reinforcement_fiber;
    const grade = request.concrete_grade;
    const microfiber = request.fiber;
    const toppingAmount =
        request.topping === 'yes' ? request.topping_amount : 0;
    const doubleLayerFactor =
        reinf === 'double' && dFitting === dFitting2 ? 2 : 1;

    switch (code) {
        case '0154':
            return request.base === 'base_sand' ? area : 0;
        case '0101':
            return request.preparation === 'no' ? 0 : area;
        case '0156':
            return ['base_concrete', 'base_rubble'].includes(request.base)
                ? area
                : 0;
        case '0100':
            return request.reinforcement === 'grid' ||
                auto === '34150' ||
                auto === '35150'
                ? area
                : 0;
        case '0105':
            return request.reinforcement === 'single' ||
                auto === '18200' ||
                auto === '110200' ||
                auto === '112200'
                ? area
                : 0;
        case '0104':
            return (mdlThickness >= 7 &&
                mdlThickness <= 20 &&
                request.reinforcement === 'double') ||
                auto === '2810200'
                ? area
                : 0;
        case '0135':
            return (mdlThickness > 20 && request.reinforcement === 'double') ||
                auto === '21012200'
                ? area
                : 0;
        case '0112':
            return (request.reinforcement === 'double' && mdlThickness > 20) ||
                auto === '21012200'
                ? area / 2
                : 0;
        case '0155':
            return area <= formula.guidesAreaThreshold
                ? 0
                : Math.ceil(area * formula.guidesAreaFactor);
        case '0145':
            return mdlThickness <= 10 ? area : 0;
        case '0146':
            return mdlThickness > 10 && mdlThickness <= 15 ? area : 0;
        case '0147':
            return mdlThickness > 15 ? area : 0;
        case '0102':
            return request.topping === 'no' ? 0 : area;
        case '0110':
            return area;
        case '0140':
            return area;
        case '0130':
            return Math.ceil(
                (0.35 * area * formula.cuttingStepLargeM) /
                    cuttingStep(request, formula),
            );
        case '0109':
            return Math.ceil(
                (0.35 * area * formula.cuttingStepLargeM) /
                    cuttingStep(request, formula),
            );
        case '0517':
            return area;
        case '7053':
            return prep === 'no' && request.base === 'base_sand'
                ? Math.ceil(area * formula.filmOverlapCoef)
                : 0;
        case '7013':
            return prep === 'no'
                ? 0
                : Math.ceil(
                      (prep / 1000) * area * formula.concreteReserveCoef,
                  );
        case '1010':
            return prep !== 'no' || request.base === 'base_concrete'
                ? Math.ceil(area * formula.filmOverlapCoef)
                : 0;
        case '1011':
            return prep === 'no' && request.base === 'base_rubble'
                ? Math.ceil(area * formula.filmOverlapCoef)
                : 0;
        case '7079':
            return reinf === 'grid' && gFitting === 3 && gCell === 100
                ? Math.ceil(area * formula.meshOverlap100Coef)
                : 0;
        case '7082':
            return reinf === 'grid' && gFitting === 4 && gCell === 100
                ? Math.ceil(area * formula.meshOverlap100Coef)
                : 0;
        case '7126':
            return reinf === 'grid' && gFitting === 5 && gCell === 100
                ? Math.ceil(area * formula.meshOverlap100Coef)
                : 0;
        case '7127':
            return reinf === 'grid' && gFitting === 3 && gCell === 150
                ? Math.ceil(area * formula.meshOverlap150Coef)
                : 0;
        case '7083':
            return (reinf === 'grid' && gFitting === 4 && gCell === 150) ||
                auto === '34150'
                ? Math.ceil(area * formula.meshOverlap150Coef)
                : 0;
        case '7085':
            return (reinf === 'grid' && gFitting === 5 && gCell === 150) ||
                auto === '35150'
                ? Math.ceil(area * formula.meshOverlap150Coef)
                : 0;
        case '7128':
            return reinf === 'grid' && gFitting === 3 && gCell === 200
                ? Math.ceil(area * formula.meshOverlap200Coef)
                : 0;
        case '7129':
            return reinf === 'grid' && gFitting === 4 && gCell === 200
                ? Math.ceil(area * formula.meshOverlap200Coef)
                : 0;
        case '7086':
            return reinf === 'grid' && gFitting === 5 && gCell === 200
                ? Math.ceil(area * formula.meshOverlap200Coef)
                : 0;
        case '7003':
            if (
                !(
                    (reinf === 'single' && fitting === 8 && cell === 150) ||
                    (reinf === 'double' &&
                        (dFitting === 8 || dFitting2 === 8) &&
                        dCell === 150)
                )
            ) {
                return 0;
            }
            return roundup((14 * area * doubleLayerFactor * 0.395) / 1000, 1);
        case '7004':
            if (
                !(
                    (reinf === 'single' && fitting === 8 && cell === 200) ||
                    (reinf === 'double' &&
                        (dFitting === 8 || dFitting2 === 8) &&
                        dCell === 200) ||
                    auto === '18200' ||
                    auto === '2810200'
                )
            ) {
                return 0;
            }
            return roundup((11 * area * doubleLayerFactor * 0.395) / 1000, 1);
        case '7006':
            if (
                !(
                    (reinf === 'single' && fitting === 10 && cell === 150) ||
                    (reinf === 'double' &&
                        (dFitting === 10 || dFitting2 === 10) &&
                        dCell === 150)
                )
            ) {
                return 0;
            }
            return roundup((14.2 * area * doubleLayerFactor * 0.617) / 1000, 1);
        case '7007':
            if (
                !(
                    (reinf === 'single' && fitting === 10 && cell === 200) ||
                    (reinf === 'double' &&
                        (dFitting === 10 || dFitting2 === 10) &&
                        dCell === 200) ||
                    auto === '110200' ||
                    auto === '2810200' ||
                    auto === '21012200'
                )
            ) {
                return 0;
            }
            return roundup((11.2 * area * doubleLayerFactor * 0.617) / 1000, 1);
        case '7135':
            if (
                !(
                    (reinf === 'single' && fitting === 12 && cell === 200) ||
                    (reinf === 'double' &&
                        (dFitting === 12 || dFitting2 === 12) &&
                        dCell === 200) ||
                    auto === '112200' ||
                    auto === '21012200'
                )
            ) {
                return 0;
            }
            return roundup((11.4 * area * doubleLayerFactor * 0.888) / 1000, 1);
        case '7131':
            if (
                !(
                    (reinf === 'single' && fitting === 14 && cell === 200) ||
                    (reinf === 'double' &&
                        (dFitting === 14 || dFitting2 === 14) &&
                        dCell === 200)
                )
            ) {
                return 0;
            }
            return roundup((11.6 * area * doubleLayerFactor * 1.21) / 1000, 1);
        case '7101': {
            if (!(area > 200)) {
                return 0;
            }
            const a = Math.min(2, Math.round(area < 500 ? 1 : area / 500));
            const b = area < 100 ? 2 : area < 350 ? 1.5 : 1;
            return roundup(((((0.25 * area) / a) * 1.178) / 1000) * b, 2);
        }
        case '7005':
            if (!(area > 200)) {
                return 0;
            }
            if (!(reinf === 'grid' || auto === '34150' || auto === '35150')) {
                return 0;
            }
            return roundup(
                (((area * 0.45 * mdlThickness * 3) / 100) * 0.617) / 1000,
                2,
            );
        case '7009':
            return area > 500 && reinf === 'fiber'
                ? roundup(((area / 400) * 60 * 1 * 1.58) / 1000, 2)
                : 0;
        case '1045':
            return (mdlThickness > 12 &&
                mdlThickness <= 20 &&
                reinf === 'double') ||
                auto === '2810200'
                ? area
                : 0;
        case '1035':
            return request.base === 'base_sand' ||
                request.base === 'base_rubble'
                ? area * 2
                : 0;
        case '1033':
            return request.base === 'base_concrete' ? area * 2 : 0;
        case '1002':
            return Math.ceil(
                (mdlThickness / 100) * 1.3 * Math.sqrt(area) * 4 * 1.4,
            );
        case '1028':
            return reinf === 'fiber'
                ? Math.ceil(
                      (mdlThickness *
                          area *
                          formula.concreteReserveCoef *
                          fiberMacro) /
                          100,
                  )
                : 0;
        case '1031':
            return microfiber === 'no'
                ? 0
                : Math.ceil(
                      (mdlThickness *
                          area *
                          formula.concreteReserveCoef *
                          microfiber) /
                          100,
                  );
        case '7021':
            return grade === 1
                ? Math.ceil(
                      (mdlThickness * area * formula.concreteReserveCoef) / 100,
                  )
                : 0;
        case '7023':
            return grade === 2
                ? Math.ceil(
                      (mdlThickness * area * formula.concreteReserveCoef) / 100,
                  )
                : 0;
        case '7025':
            return grade === 3
                ? Math.ceil(
                      (mdlThickness * area * formula.concreteReserveCoef) / 100,
                  )
                : 0;
        case '1221':
            return request.topping === 'no'
                ? 0
                : Math.ceil((toppingAmount * area) / 25) * 25;
        case '1601':
            return Math.ceil(area * formula.sealerConsumptionLpm2);
        case '1404':
            return Math.ceil(
                (formula.jointSealantCoef * 0.35 * area * formula.cuttingStepLargeM) /
                    cuttingStep(request, formula),
            );
        case '9999':
            return area;
        case '0162':
            return area;
        case '0928':
            return request.pump === 'no'
                ? 0
                : Math.ceil(area / formula.pumpAreaPerShift);
    }
};

const buildDescription = (
    request: Required<CalculateRequest>,
    formula: FormulaSettings,
): string => {
    const area = request.area;
    const thickness = getThickness(request);
    const mdlThickness = thickness / 10;
    const cut = cuttingStep(request, formula);
    const auto = getReinforcementAuto(request);

    const baseTextMap: Record<BaseType, string> = {
        base_concrete: 'существующему бетонному основанию',
        base_sand: 'уплотненному песку',
        base_rubble: 'уплотненному щебеночному основанию',
    };

    let desc = '';
    desc += `Предварительный расчет бетонных полов по ${baseTextMap[request.base]}, со следующими работами:\n`;

    if (request.preparation !== 'no') {
        desc += `- Устройство бетонной подготовки ${request.preparation} мм без армирования\n`;
    }

    if (request.base === 'base_sand' && request.preparation === 'no') {
        desc += '- Укладка мембраны на уплотненный песок\n';
    } else {
        desc += '- Гидроизоляция из пленки полиэтиленовой ПЭ в 1 слой\n';
    }

    if (
        ['single', 'double'].includes(request.reinforcement) ||
        ['18200', '110200', '112200', '2810200', '21012200'].includes(
            String(auto),
        )
    ) {
        if (typeof auto === 'string') {
            desc += `- Армирование из арматуры (автоподбор: ${auto})\n`;
        } else if (request.reinforcement === 'double') {
            desc += `- Армирование: Ø${request.reinforcement_double_fitting}-Ø${request.reinforcement_double_fitting2}, яч. ${request.reinforcement_double_cell}x${request.reinforcement_double_cell}, 2 слоя\n`;
        } else {
            desc += `- Армирование: Ø${request.reinforcement_single_fitting}, яч. ${request.reinforcement_single_cell}x${request.reinforcement_single_cell}, 1 слой\n`;
        }
    }

    if (
        request.reinforcement === 'grid' ||
        auto === '34150' ||
        auto === '35150'
    ) {
        if (auto === '34150' || auto === '35150') {
            desc += '- Армирование из сварной сетки\n';
        } else {
            desc += `- Армирование из сварной сетки: Ø${request.reinforcement_grid_fitting}, яч. ${request.reinforcement_grid_cell}x${request.reinforcement_grid_cell}\n`;
        }
    }

    if (request.fiber !== 'no') {
        desc += `- С добавлением полипропиленовой фибры ${request.fiber} кг на 1м³ бетона\n`;
    }

    const toppingText =
        request.topping === 'no'
            ? ''
            : ` с внесением топинга ${request.topping_amount} кг/м²`;
    desc += `- Устройство бетонной плиты ${thickness} мм${toppingText}, обработкой поверхности и покрытием лаком в 1 слой\n`;
    desc += `- Нарезка усадочных швов на 1/3 от толщины пола, шагом ${cut} м, с последующим заполнением\n`;
    desc += `Средняя толщина полов: ${mdlThickness} см\n`;
    desc += `Общая площадь полов: ${area} м²`;

    return desc;
};

export const calculateConcreteOffer = (
    request: Required<CalculateRequest>,
    settings: SettingsType,
): CalculateResponseData => {
    const ctx: CalculationContext = { request, settings };
    const priceMap = getPriceMap(ctx.settings);
    const orderedCodes = Object.keys(SERVICE_META) as ServiceCode[];
    const formula = resolveFormula(settings.formula);

    const items: ServiceItem[] = orderedCodes
        .map((code) => {
            const volume = serviceVolume(code, ctx.request, formula);
            const price = priceMap.get(code) ?? FALLBACK_PRICES[code];
            const total = volume * price;
            const meta = SERVICE_META[code];

            return {
                id: code,
                name: meta.name,
                unit: meta.unit,
                note: meta.note,
                volume,
                price,
                total,
            };
        })
        .filter((item) => item.volume > 0);

    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const transport = (subtotal * Number(settings.general.rate || 0)) / 100;
    const overheads =
        (subtotal * Number(settings.general.overheads || 0)) / 100;
    const profit = (subtotal * Number(settings.general.profit || 0)) / 100;
    const grandTotal = subtotal + transport + overheads + profit;
    const unitPrice = request.area > 0 ? grandTotal / request.area : 0;

    return {
        description: buildDescription(request, formula),
        section: {
            title: 'Раздел 1. Оплата труда (с учетом налогов)',
            items,
            total: subtotal,
        },
        totals: {
            subtotal,
            transport,
            overheads,
            profit,
            grandTotal,
            unitPrice,
        },
        normalizedInput: request,
    };
};

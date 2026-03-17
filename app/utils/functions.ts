export const numberInputValue = (value: string): string => {
    return value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
};

/** GLOBALS **/

// Округление наверх (Round up)
export const roundUp = (number: number, precision: number = 0): number => {
    const r = Math.pow(10, precision);
    return Math.ceil(number * r) / r;
};

// Thickness calculation

// Auto thickness based on base type
// console.log(getThickness({ thickness: 'auto', base: 'sand' }));     // 120
// console.log(getThickness({ thickness: 'auto', base: 'concrete' })); // 80
// console.log(getThickness({ thickness: 'auto', base: 'rubble' }));   // 100

// // Manual thickness
// console.log(getThickness({ thickness: 150, base: 'concrete' }));    // 150
// console.log(getThickness({ thickness: '200', base: 'sand' }));      // 200

interface IRequest {
    reinforcement: ReinforcementCode;
    //  reinforcement_single_fitting;
    //  reinforcement_single_cell;
    //  reinforcement_double_fitting;
    //  reinforcement_double_fitting2;
    //  reinforcement_double_cell;
    //  reinforcement_fiber;
    thickness: string | number;
    base: 'base_concrete' | 'base_sand' | 'base_rubble';
    cutting_step: number;
    concrete_grade: number; // марка бетона
}

// Final object

interface Request {
    area: number;
    base: 'base_concrete' | 'base_sand' | 'base_rubble';
    preparation: number | null; //подготовка
    reinforcement: 'single' | 'double' | 'grid' | 'fiber' | 'auto';
    //  reinforcement_single_fitting;
    //  reinforcement_single_cell;
    //  reinforcement_double_fitting;
    //  reinforcement_double_fitting2;
    //  reinforcement_double_cell;
    //  reinforcement_fiber;
    thickness: number;
    cutting_step: number | null;
    concrete_grade: number; // марка бетона
    microfiber: number | null;
    topping: number | null;
    pump: boolean; //бетононасос да/нет
}

type ReinforcementCode =
    | '34150'
    | '35150'
    | '18200'
    | '110200'
    | '112200'
    | '2810200'
    | '21012200'
    | 'doNotKnow';

export const getThickness = (request: IRequest): number => {
    const { thickness, base } = request;

    if (thickness === 'auto') {
        const thicknessMap: Record<IRequest['base'], number> = {
            base_concrete: 80,
            base_sand: 120,
            base_rubble: 100,
        };

        return thicknessMap[base];
    }

    return Number(thickness);
};

// Cutting step

// Thin floor (≤ 8cm)
// console.log(cuttingStep({ thickness: 'auto', base: 'concrete' })); // 3 (8cm / 10 = 0.8)

// // Thick floor (> 8cm)
// console.log(cuttingStep({ thickness: 150, base: 'sand' }));        // 6 (15cm / 10 = 1.5)
// console.log(cuttingStep({ thickness: 200, base: 'rubble' }));      // 6 (20cm / 10 = 2.0)

export const cuttingStep = (request: IRequest): number => {
    const mdlThickness = getThickness(request) / 10;

    return mdlThickness <= 8 ? 3 : 6;
};

// Reinforcement selection

export const getReinforcementAuto = (
    request: IRequest
): ReinforcementCode | false | 0 => {
    const reinforcement = request.reinforcement;
    const base = request.base;
    const d = getThickness(request) / 10;

    if (reinforcement !== 'doNotKnow') {
        return false;
    }

    switch (base) {
        case 'base_concrete':
            if (d <= 8) return '34150';
            if (d > 8 && d <= 10) return '35150';
            if (d > 10 && d <= 12) return '18200';
            if (d > 12 && d <= 16) return '110200';
            if (d > 16 && d <= 20) return '2810200';
            if (d > 20 && d <= 25) return '21012200';
            break;

        case 'base_sand':
            if (d <= 8) return '18200';
            if (d > 8 && d <= 10) return '110200';
            if (d > 10 && d <= 12) return '112200';
            if (d > 12 && d <= 20) return '2810200';
            if (d > 20 && d <= 25) return '21012200';
            break;

        case 'base_rubble':
            if (d <= 8) return '35150';
            if (d > 8 && d <= 10) return '110200';
            if (d > 10 && d <= 12) return '112200';
            if (d > 12 && d <= 20) return '2810200';
            if (d > 20 && d <= 25) return '21012200';
            break;
    }

    return 0;
};

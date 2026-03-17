const BASE_URL = process.env.CALC_BASE_URL || 'http://localhost:3000';

const basePayload = {
    area: 1000,
    base: 'base_concrete',
    thickness: 'auto',
    preparation: 'no',
    concrete_grade: 1,
    fiber: 'no',
    topping: 'yes',
    topping_amount: 3,
    pump: 'no',
};

const cases = [
    {
        name: 'valid single reinforcement',
        payload: {
            ...basePayload,
            reinforcement: 'single',
            reinforcement_single_fitting: 8,
            reinforcement_single_cell: 150,
        },
        expectedStatus: 200,
        expectedError: null,
    },
    {
        name: 'invalid single 150 cell + diameter 14',
        payload: {
            ...basePayload,
            reinforcement: 'single',
            reinforcement_single_fitting: 14,
            reinforcement_single_cell: 150,
        },
        expectedStatus: 400,
        expectedError: 'Расчет не досупен для выбранного диаметра арматуры',
    },
    {
        name: 'invalid grid cell',
        payload: {
            ...basePayload,
            reinforcement: 'grid',
            reinforcement_grid_fitting: 4,
            reinforcement_grid_cell: 180,
        },
        expectedStatus: 400,
        expectedError: 'Расчет не досупен для выбранного размера ячейки',
    },
    {
        name: 'invalid fiber amount',
        payload: {
            ...basePayload,
            reinforcement: 'fiber',
            reinforcement_fiber: 5,
        },
        expectedStatus: 400,
        expectedError: 'Расчет не досупен с выбранным количеством на куб бетона',
    },
    {
        name: 'invalid double 150 cell with diameter 12',
        payload: {
            ...basePayload,
            reinforcement: 'double',
            reinforcement_double_fitting: 12,
            reinforcement_double_fitting2: 10,
            reinforcement_double_cell: 150,
        },
        expectedStatus: 400,
        expectedError: 'Расчет не досупен для выбранного диаметра арматуры',
    },
    {
        name: 'valid doNotKnow reinforcement',
        payload: {
            ...basePayload,
            reinforcement: 'doNotKnow',
        },
        expectedStatus: 200,
        expectedError: null,
    },
];

let failed = 0;

for (const testCase of cases) {
    const response = await fetch(`${BASE_URL}/api/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testCase.payload),
    });

    const body = await response.json();
    const statusOk = response.status === testCase.expectedStatus;
    const errorOk =
        testCase.expectedError === null ||
        (Array.isArray(body.errors) &&
            body.errors.some((msg) => msg.includes(testCase.expectedError)));

    if (statusOk && errorOk) {
        console.log(`PASS: ${testCase.name}`);
        continue;
    }

    failed += 1;
    console.log(`FAIL: ${testCase.name}`);
    console.log(`  expected status: ${testCase.expectedStatus}, got: ${response.status}`);
    console.log(`  response: ${JSON.stringify(body)}`);
}

if (failed > 0) {
    console.error(`Validation tests failed: ${failed}`);
    process.exit(1);
}

console.log('All validation tests passed');

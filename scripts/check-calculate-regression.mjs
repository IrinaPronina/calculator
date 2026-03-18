import { readFile, writeFile } from 'node:fs/promises';

const BASE_URL = process.env.CALC_BASE_URL || 'http://localhost:3000';
const EPSILON = 0.01;
const UPDATE_MODE = process.argv.includes('--update');
const BASELINE_URL = new URL('./calculate-regression-baseline.json', import.meta.url);

const cases = [
    {
        key: 'grid_concrete_no_topping',
        name: 'Grid, concrete base, no topping',
        watchIds: ['0100', '1601', '7053'],
        payload: {
            area: 500,
            base: 'base_concrete',
            thickness: 'auto',
            preparation: 'no',
            reinforcement: 'grid',
            reinforcement_grid_fitting: 4,
            reinforcement_grid_cell: 150,
            concrete_grade: 2,
            fiber: 'no',
            topping: 'no',
            topping_amount: 3,
            pump: 'no',
            reinforcement_fiber: 1,
        },
    },
    {
        key: 'auto_sand_with_pump',
        name: 'Auto reinforcement, sand base, with pump',
        watchIds: ['0154', '0101', '0928', '1028'],
        payload: {
            area: 1200,
            base: 'base_sand',
            thickness: 120,
            preparation: 70,
            reinforcement: 'doNotKnow',
            concrete_grade: 3,
            fiber: 0.9,
            topping: 'yes',
            topping_amount: 4,
            pump: 'yes',
            reinforcement_fiber: 1,
        },
    },
    {
        key: 'double_rubble_with_topping',
        name: 'Double reinforcement, rubble base, topping',
        watchIds: ['0104', '0147', '1221', '0928'],
        payload: {
            area: 3000,
            base: 'base_rubble',
            thickness: 180,
            preparation: 'no',
            reinforcement: 'double',
            reinforcement_double_fitting: 8,
            reinforcement_double_fitting2: 10,
            reinforcement_double_cell: 200,
            concrete_grade: 2,
            fiber: 'no',
            topping: 'yes',
            topping_amount: 3.5,
            pump: 'yes',
            reinforcement_fiber: 1,
        },
    },
];

const readBaseline = async () => {
    const raw = await readFile(BASELINE_URL, 'utf-8');
    return JSON.parse(raw);
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchCalculation = async (payload) => {
    let lastResult = { status: 0, body: null };

    for (let attempt = 1; attempt <= 3; attempt += 1) {
        const response = await fetch(`${BASE_URL}/api/calculate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        let body = null;
        try {
            body = await response.json();
        } catch {
            body = null;
        }

        lastResult = { status: response.status, body };

        if (response.status === 200 && body?.status === 'success') {
            return lastResult;
        }

        // In dev mode Next can return transient 404/500 while route is warming up.
        if (attempt < 3 && [404, 500, 503].includes(response.status)) {
            await sleep(250);
            continue;
        }

        return lastResult;
    }

    return lastResult;
};

const pickSnapshot = (testCase, responseBody) => {
    const totals = responseBody?.data?.totals;
    const items = responseBody?.data?.section?.items || [];
    const itemMap = new Map(items.map((item) => [item.id, item]));

    const watched = {};
    testCase.watchIds.forEach((id) => {
        const item = itemMap.get(id);
        watched[id] = item
            ? {
                  volume: Number(item.volume),
                  price: Number(item.price),
                  total: Number(item.total),
              }
            : null;
    });

    return {
        status: responseBody?.status || 'unknown',
        totals: {
            subtotal: Number(totals?.subtotal),
            transport: Number(totals?.transport),
            overheads: Number(totals?.overheads),
            profit: Number(totals?.profit),
            grandTotal: Number(totals?.grandTotal),
            unitPrice: Number(totals?.unitPrice),
        },
        watched,
    };
};

const isClose = (a, b) => Math.abs(Number(a) - Number(b)) <= EPSILON;

const compareSnapshots = (actual, expected) => {
    const diffs = [];

    if (actual.status !== expected.status) {
        diffs.push(`status expected=${expected.status}, actual=${actual.status}`);
    }

    for (const key of [
        'subtotal',
        'transport',
        'overheads',
        'profit',
        'grandTotal',
        'unitPrice',
    ]) {
        if (!isClose(actual.totals[key], expected.totals[key])) {
            diffs.push(
                `totals.${key} expected=${expected.totals[key]}, actual=${actual.totals[key]}`,
            );
        }
    }

    const watchedKeys = new Set([
        ...Object.keys(expected.watched || {}),
        ...Object.keys(actual.watched || {}),
    ]);

    for (const id of watchedKeys) {
        const exp = expected.watched?.[id] ?? null;
        const act = actual.watched?.[id] ?? null;

        if (exp === null || act === null) {
            if (exp !== act) {
                diffs.push(`watched.${id} expected=${JSON.stringify(exp)}, actual=${JSON.stringify(act)}`);
            }
            continue;
        }

        for (const key of ['volume', 'price', 'total']) {
            if (!isClose(act[key], exp[key])) {
                diffs.push(
                    `watched.${id}.${key} expected=${exp[key]}, actual=${act[key]}`,
                );
            }
        }
    }

    return diffs;
};

const run = async () => {
    const captured = {
        generatedAt: new Date().toISOString(),
        baseUrl: BASE_URL,
        epsilon: EPSILON,
        cases: {},
    };

    let failed = 0;
    let baseline = null;

    if (!UPDATE_MODE) {
        baseline = await readBaseline();
    }

    for (const testCase of cases) {
        const { status, body } = await fetchCalculation(testCase.payload);

        if (status !== 200 || body?.status !== 'success') {
            failed += 1;
            console.log(`FAIL: ${testCase.name}`);
            console.log(`  expected status: 200/success, got: ${status}/${body?.status}`);
            console.log(`  response: ${JSON.stringify(body)}`);
            continue;
        }

        const actualSnapshot = pickSnapshot(testCase, body);
        captured.cases[testCase.key] = actualSnapshot;

        if (UPDATE_MODE) {
            console.log(`CAPTURED: ${testCase.name}`);
            continue;
        }

        const expectedSnapshot = baseline?.cases?.[testCase.key];
        if (!expectedSnapshot) {
            failed += 1;
            console.log(`FAIL: ${testCase.name}`);
            console.log('  baseline snapshot not found for this case');
            continue;
        }

        const diffs = compareSnapshots(actualSnapshot, expectedSnapshot);

        if (diffs.length === 0) {
            console.log(`PASS: ${testCase.name}`);
            continue;
        }

        failed += 1;
        console.log(`FAIL: ${testCase.name}`);
        diffs.forEach((diff) => console.log(`  ${diff}`));
    }

    if (UPDATE_MODE) {
        await writeFile(BASELINE_URL, `${JSON.stringify(captured, null, 2)}\n`, 'utf-8');
        console.log(`Baseline updated: ${BASELINE_URL.pathname}`);
        return;
    }

    if (failed > 0) {
        console.error(`Regression tests failed: ${failed}`);
        process.exit(1);
    }

    console.log('All regression tests passed');
};

run().catch((error) => {
    console.error('Failed to run regression tests');
    console.error(error);
    process.exit(1);
});

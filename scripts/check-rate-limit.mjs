/**
 * Проверка rate-limit на входе.
 * Запуск: npm run test:rate-limit (сервер поднят: npm run dev)
 *
 * Правило: /sign-in/email — max 5 за 60 сек; шестая попытка -> 429.
 * Внимание: счётчики хранятся в MongoDB (коллекция rateLimit) — повторный
 * запуск в течение минуты может начать не с нуля.
 */
const BASE_URL = process.env.CALC_BASE_URL || 'http://localhost:3000';
const EMAIL = `test-ratelimit-${Date.now()}@example.com`;

async function main() {
    let got429 = false;
    let attempts = 0;

    for (let i = 1; i <= 6; i += 1) {
        const res = await fetch(`${BASE_URL}/api/auth/sign-in/email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: EMAIL, password: 'wrong-password-1' }),
        });
        attempts = i;
        console.log(`попытка ${i}: статус ${res.status}`);
        if (res.status === 429) {
            got429 = true;
            break;
        }
    }

    if (got429 && attempts <= 6) {
        console.log(`\nOK: rate-limit сработал на попытке ${attempts}`);
        process.exit(0);
    }
    console.log('\nFAIL: 429 не получен за 6 попыток');
    process.exit(1);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});

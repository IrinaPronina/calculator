/**
 * Проверка защиты API-роутов.
 * Запуск: npm run test:api-protection (сервер поднят: npm run dev)
 *
 * 1. /api/users, /api/settings, /api/lk/me без сессии -> 401
 * 2. /api/users под обычным пользователем -> 403
 * 3. /api/users под админом -> 200 и без password-хэшей
 */
import 'dotenv/config';
import { MongoClient } from 'mongodb';

const BASE_URL = process.env.CALC_BASE_URL || 'http://localhost:3000';
const suffix = Date.now();
const USER_EMAIL = `test-user-${suffix}@example.com`;
const ADMIN_EMAIL = `test-admin-${suffix}@example.com`;
const PASSWORD = 'test-password-123';

let failures = 0;
const check = (name, ok, details = '') => {
    console.log(`${ok ? 'OK  ' : 'FAIL'} ${name}${details ? ` — ${details}` : ''}`);
    if (!ok) failures += 1;
};

const signUp = async (email) => {
    const res = await fetch(`${BASE_URL}/api/auth/sign-up/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Test', email, password: PASSWORD }),
    });
    if (res.status !== 200) {
        throw new Error(`sign-up ${email} failed: ${res.status}`);
    }
    return (res.headers.getSetCookie?.() || [])
        .map((c) => c.split(';')[0])
        .join('; ');
};

const signIn = async (email) => {
    const res = await fetch(`${BASE_URL}/api/auth/sign-in/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: PASSWORD }),
    });
    return (res.headers.getSetCookie?.() || [])
        .map((c) => c.split(';')[0])
        .join('; ');
};

async function main() {
    const client = await MongoClient.connect(process.env.DB_URL);
    const db = client.db(process.env.DB_NAME);

    try {
        // --- 1. Без сессии -> 401 ---
        for (const path of ['/api/users', '/api/settings', '/api/lk/me']) {
            const res = await fetch(`${BASE_URL}${path}`);
            check(`${path} без сессии -> 401`, res.status === 401, `got ${res.status}`);
        }

        // --- 2. Обычный пользователь -> 403 на /api/users ---
        const userCookie = await signUp(USER_EMAIL);
        const usersAsUser = await fetch(`${BASE_URL}/api/users`, {
            headers: { cookie: userCookie },
        });
        check(
            '/api/users под user -> 403',
            usersAsUser.status === 403,
            `got ${usersAsUser.status}`,
        );

        const meAsUser = await fetch(`${BASE_URL}/api/lk/me`, {
            headers: { cookie: userCookie },
        });
        check('/api/lk/me под user -> 200', meAsUser.status === 200, `got ${meAsUser.status}`);

        // --- 3. Админ -> 200, без хэшей ---
        await signUp(ADMIN_EMAIL);
        await db
            .collection('user')
            .updateOne({ email: ADMIN_EMAIL }, { $set: { role: 'admin' } });
        // Новая сессия, чтобы роль попала в сессию
        const adminCookie = await signIn(ADMIN_EMAIL);

        const usersAsAdmin = await fetch(`${BASE_URL}/api/users`, {
            headers: { cookie: adminCookie },
        });
        check(
            '/api/users под admin -> 200',
            usersAsAdmin.status === 200,
            `got ${usersAsAdmin.status}`,
        );
        const body = await usersAsAdmin.text();
        check(
            '/api/users: в ответе нет password и хэшей',
            !body.includes('password') && !body.includes('$2') && !body.includes('scrypt'),
        );
    } finally {
        const testUsers = await db
            .collection('user')
            .find({ email: { $in: [USER_EMAIL, ADMIN_EMAIL] } })
            .toArray();
        const ids = testUsers.map((u) => u._id);
        await db.collection('session').deleteMany({
            userId: { $in: [...ids, ...ids.map((id) => id.toString())] },
        });
        await db.collection('account').deleteMany({
            userId: { $in: [...ids, ...ids.map((id) => id.toString())] },
        });
        await db.collection('user').deleteMany({ _id: { $in: ids } });
        await client.close();
    }

    console.log(failures === 0 ? '\nВсе проверки пройдены' : `\nПровалено: ${failures}`);
    process.exit(failures === 0 ? 0 : 1);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});

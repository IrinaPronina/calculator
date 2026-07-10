/**
 * Проверка auth-флоу better-auth против запущенного dev-сервера.
 * Запуск: npm run test:auth-flow (сервер должен быть поднят: npm run dev)
 *
 * Проверяет:
 * 1. sign-up -> сессия -> get-session -> sign-out
 * 2. Вход legacy-пользователя с bcrypt-хэшем + ленивое перехэширование в scrypt
 * 3. Ответы на неверный пароль и несуществующий email идентичны
 */
import 'dotenv/config';
import bcryptjs from 'bcryptjs';
import { MongoClient } from 'mongodb';

const BASE_URL = process.env.CALC_BASE_URL || 'http://localhost:3000';
const suffix = Date.now();
const NEW_EMAIL = `test-authflow-${suffix}@example.com`;
const LEGACY_EMAIL = `test-legacy-${suffix}@example.com`;
const PASSWORD = 'test-password-123';

let failures = 0;
const check = (name, ok, details = '') => {
    console.log(`${ok ? 'OK  ' : 'FAIL'} ${name}${details ? ` — ${details}` : ''}`);
    if (!ok) failures += 1;
};

const api = (path, options = {}) =>
    fetch(`${BASE_URL}/api/auth${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        ...options,
    });

const getCookie = (response) => {
    const setCookie = response.headers.getSetCookie?.() || [];
    return setCookie.map((c) => c.split(';')[0]).join('; ');
};

async function main() {
    const client = await MongoClient.connect(process.env.DB_URL);
    const db = client.db(process.env.DB_NAME);

    try {
        // --- 1. Регистрация и сессия ---
        const signUpRes = await api('/sign-up/email', {
            body: JSON.stringify({
                name: 'Test User',
                email: NEW_EMAIL,
                password: PASSWORD,
            }),
        });
        check('sign-up: статус 200', signUpRes.status === 200, `got ${signUpRes.status}`);
        const cookie = getCookie(signUpRes);
        check('sign-up: выдана session-cookie', cookie.includes('better-auth'));

        const sessionRes = await fetch(`${BASE_URL}/api/auth/get-session`, {
            headers: { cookie },
        });
        const sessionJson = await sessionRes.json();
        check(
            'get-session: возвращает пользователя',
            sessionJson?.user?.email === NEW_EMAIL,
        );
        check(
            'get-session: роль user по умолчанию',
            sessionJson?.user?.role === 'user',
            `got ${sessionJson?.user?.role}`,
        );

        const signOutRes = await api('/sign-out', {
            headers: { 'Content-Type': 'application/json', cookie },
            body: '{}',
        });
        check('sign-out: статус 200', signOutRes.status === 200);

        const afterSignOut = await fetch(`${BASE_URL}/api/auth/get-session`, {
            headers: { cookie },
        });
        const afterJson = await afterSignOut.json().catch(() => null);
        check('после sign-out сессии нет', !afterJson?.user);

        // --- 2. Legacy bcrypt-пользователь ---
        const bcryptHash = await bcryptjs.hash(PASSWORD, 10);
        const now = new Date();
        const { insertedId } = await db.collection('user').insertOne({
            email: LEGACY_EMAIL,
            name: 'Legacy User',
            emailVerified: false,
            role: 'user',
            createdAt: now,
            updatedAt: now,
        });
        await db.collection('account').insertOne({
            userId: insertedId,
            accountId: insertedId.toString(),
            providerId: 'credential',
            password: bcryptHash,
            createdAt: now,
            updatedAt: now,
        });

        const legacySignIn = await api('/sign-in/email', {
            body: JSON.stringify({ email: LEGACY_EMAIL, password: PASSWORD }),
        });
        check(
            'legacy: вход с bcrypt-паролем успешен',
            legacySignIn.status === 200,
            `got ${legacySignIn.status}`,
        );

        const legacyAccount = await db
            .collection('account')
            .findOne({ userId: insertedId, providerId: 'credential' });
        check(
            'legacy: хэш перезаписан на scrypt',
            legacyAccount && !String(legacyAccount.password).startsWith('$2'),
        );

        // --- 3. Отсутствие энумерации email ---
        const wrongPassword = await api('/sign-in/email', {
            body: JSON.stringify({
                email: LEGACY_EMAIL,
                password: 'wrong-password-123',
            }),
        });
        const noSuchUser = await api('/sign-in/email', {
            body: JSON.stringify({
                email: `no-such-${suffix}@example.com`,
                password: 'wrong-password-123',
            }),
        });
        const wrongBody = await wrongPassword.json().catch(() => ({}));
        const noUserBody = await noSuchUser.json().catch(() => ({}));
        check(
            'энумерация: одинаковый статус',
            wrongPassword.status === noSuchUser.status,
            `${wrongPassword.status} vs ${noSuchUser.status}`,
        );
        check(
            'энумерация: одинаковое сообщение',
            (wrongBody.message || '') === (noUserBody.message || ''),
            `${wrongBody.message} vs ${noUserBody.message}`,
        );
    } finally {
        // Чистка тестовых данных
        const testUsers = await db
            .collection('user')
            .find({ email: { $in: [NEW_EMAIL, LEGACY_EMAIL] } })
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

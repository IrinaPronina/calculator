/**
 * Проверка белого лейбла: /api/lk/branding.
 * Запуск: npm run test:branding (сервер поднят: npm run dev)
 *
 * 1. Без сессии GET/PUT/DELETE -> 401
 * 2. user: PUT валидный -> 200, GET возвращает то же; DELETE -> GET null
 * 3. user: невалидные логотипы/текст -> 400 (SVG, подмена байт, размер, строки)
 * 4. admin: PUT/DELETE -> 403
 * 5. /api/users под admin: ключа branding в ответе нет
 */
import 'dotenv/config';
import { MongoClient } from 'mongodb';
import { deflateSync } from 'node:zlib';

const BASE_URL = process.env.CALC_BASE_URL || 'http://localhost:3000';
const suffix = Date.now();
const USER_EMAIL = `test-brand-user-${suffix}@example.com`;
const ADMIN_EMAIL = `test-brand-admin-${suffix}@example.com`;
const PASSWORD = 'test-password-123';

let failures = 0;
const check = (name, ok, details = '') => {
    console.log(`${ok ? 'OK  ' : 'FAIL'} ${name}${details ? ` — ${details}` : ''}`);
    if (!ok) failures += 1;
};

const cookieOf = (res) =>
    (res.headers.getSetCookie?.() || []).map((c) => c.split(';')[0]).join('; ');

const signUp = async (email) => {
    const res = await fetch(`${BASE_URL}/api/auth/sign-up/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Test', email, password: PASSWORD }),
    });
    if (res.status !== 200) throw new Error(`sign-up ${email} failed: ${res.status}`);
    return cookieOf(res);
};

const signIn = async (email) => {
    const res = await fetch(`${BASE_URL}/api/auth/sign-in/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: PASSWORD }),
    });
    return cookieOf(res);
};

const api = (path, { method = 'GET', cookie = '', body } = {}) =>
    fetch(`${BASE_URL}${path}`, {
        method,
        headers: {
            ...(cookie ? { cookie } : {}),
            ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        },
        body: body !== undefined ? JSON.stringify(body) : undefined,
    });

/** Минимальный валидный PNG width×height (RGB, один цвет). */
const makePng = (width, height, noisy = false) => {
    const crcTable = new Int32Array(256);
    for (let n = 0; n < 256; n++) {
        let c = n;
        for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
        crcTable[n] = c;
    }
    const crc32 = (buf) => {
        let c = -1;
        for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8);
        return (c ^ -1) >>> 0;
    };
    const chunk = (type, data) => {
        const len = Buffer.alloc(4);
        len.writeUInt32BE(data.length);
        const typeBuf = Buffer.from(type, 'ascii');
        const crc = Buffer.alloc(4);
        crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])));
        return Buffer.concat([len, typeBuf, data, crc]);
    };
    const ihdr = Buffer.alloc(13);
    ihdr.writeUInt32BE(width, 0);
    ihdr.writeUInt32BE(height, 4);
    ihdr[8] = 8; // bit depth
    ihdr[9] = 2; // RGB
    const raw = Buffer.alloc((width * 3 + 1) * height, 0x54);
    if (noisy) {
        // Случайные байты не сжимаются — нужно для проверки лимита по размеру.
        for (let i = 0; i < raw.length; i++) raw[i] = (Math.random() * 256) | 0;
    }
    for (let y = 0; y < height; y++) raw[y * (width * 3 + 1)] = 0; // filter none
    return Buffer.concat([
        Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
        chunk('IHDR', ihdr),
        chunk('IDAT', deflateSync(raw)),
        chunk('IEND', Buffer.alloc(0)),
    ]);
};

const toDataUrl = (mime, buf) => `data:${mime};base64,${buf.toString('base64')}`;

async function main() {
    const client = await MongoClient.connect(process.env.DB_URL);
    const db = client.db(process.env.DB_NAME);

    try {
        // --- 1. Без сессии -> 401 ---
        for (const method of ['GET', 'PUT', 'DELETE']) {
            const res = await api('/api/lk/branding', {
                method,
                body: method === 'PUT' ? { logo: null, text: 'x' } : undefined,
            });
            check(`${method} /api/lk/branding без сессии -> 401`, res.status === 401, `got ${res.status}`);
        }

        // --- 2. user: happy path ---
        const userCookie = await signUp(USER_EMAIL);
        const png = makePng(120, 60);
        const valid = {
            logo: { dataUrl: toDataUrl('image/png', png) },
            text: 'ООО "Ромашка"\r\nТелефон: +7 900 000-00-00  \nИНН 1234567890\n',
        };
        const put = await api('/api/lk/branding', { method: 'PUT', cookie: userCookie, body: valid });
        check('PUT валидный -> 200', put.status === 200, `got ${put.status} ${await put.clone().text()}`);
        const putJson = await put.json();
        check(
            'PUT: текст нормализован (\\r\\n → \\n, хвосты срезаны)',
            putJson.data?.text === 'ООО "Ромашка"\nТелефон: +7 900 000-00-00\nИНН 1234567890',
            JSON.stringify(putJson.data?.text),
        );

        const get = await api('/api/lk/branding', { cookie: userCookie });
        const getJson = await get.json();
        check(
            'GET возвращает сохранённое',
            get.status === 200 && getJson.data?.logo?.dataUrl === valid.logo.dataUrl,
        );

        const stored = await db.collection('user').findOne({ email: USER_EMAIL });
        check('в user.branding лежит логотип и текст', Boolean(stored?.branding?.logo?.dataUrl && stored?.branding?.text));

        const del = await api('/api/lk/branding', { method: 'DELETE', cookie: userCookie });
        const afterDel = await (await api('/api/lk/branding', { cookie: userCookie })).json();
        check('DELETE -> GET null', del.status === 200 && afterDel.data === null);

        // Только текст, без логотипа — тоже валидно
        const textOnly = await api('/api/lk/branding', {
            method: 'PUT', cookie: userCookie, body: { logo: null, text: 'ИП Иванов' },
        });
        check('PUT только текст -> 200', textOnly.status === 200, `got ${textOnly.status}`);

        // Пусто и без логотипа == сброс
        const empty = await api('/api/lk/branding', {
            method: 'PUT', cookie: userCookie, body: { logo: null, text: '   \n\n ' },
        });
        const afterEmpty = await (await api('/api/lk/branding', { cookie: userCookie })).json();
        check('PUT пустой -> 200 и GET null (сброс)', empty.status === 200 && afterEmpty.data === null);

        // --- 3. user: невалидное -> 400 ---
        const badCases = [
            ['SVG', { logo: { dataUrl: 'data:image/svg+xml;base64,PHN2Zy8+' }, text: 'x' }],
            ['PNG-префикс с JPEG-байтами', {
                logo: { dataUrl: toDataUrl('image/png', Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 16])) }, text: 'x',
            }],
            ['логотип > 300 КБ', { logo: { dataUrl: toDataUrl('image/png', makePng(400, 400, true)) }, text: 'x' }],
            ['логотип 2001 px', { logo: { dataUrl: toDataUrl('image/png', makePng(2001, 1)) }, text: 'x' }],
            ['9 строк', { logo: null, text: Array.from({ length: 9 }, (_, i) => `строка ${i}`).join('\n') }],
            ['601 символ', { logo: null, text: 'a'.repeat(601) }],
            ['нет поля text', { logo: null }],
            ['logo не объект', { logo: 'data:image/png;base64,AAAA', text: 'x' }],
        ];
        for (const [name, body] of badCases) {
            const res = await api('/api/lk/branding', { method: 'PUT', cookie: userCookie, body });
            check(`PUT ${name} -> 400`, res.status === 400, `got ${res.status}`);
        }

        // --- 4. admin -> 403 ---
        await signUp(ADMIN_EMAIL);
        await db.collection('user').updateOne({ email: ADMIN_EMAIL }, { $set: { role: 'admin' } });
        const adminCookie = await signIn(ADMIN_EMAIL);
        const adminPut = await api('/api/lk/branding', { method: 'PUT', cookie: adminCookie, body: { logo: null, text: 'x' } });
        check('admin PUT -> 403', adminPut.status === 403, `got ${adminPut.status}`);
        const adminDel = await api('/api/lk/branding', { method: 'DELETE', cookie: adminCookie });
        check('admin DELETE -> 403', adminDel.status === 403, `got ${adminDel.status}`);
        const adminGet = await api('/api/lk/branding', { cookie: adminCookie });
        check('admin GET -> 200 (читать можно)', adminGet.status === 200, `got ${adminGet.status}`);

        // --- 5. /api/users не отдаёт branding ---
        await api('/api/lk/branding', { method: 'PUT', cookie: userCookie, body: { logo: null, text: 'ИП Иванов' } });
        const users = await (await api('/api/users', { cookie: adminCookie })).text();
        check('/api/users: нет ключа branding', !users.includes('"branding"'));
    } finally {
        const testUsers = await db
            .collection('user')
            .find({ email: { $in: [USER_EMAIL, ADMIN_EMAIL] } })
            .toArray();
        const ids = testUsers.map((u) => u._id);
        const idFilter = { $in: [...ids, ...ids.map((id) => id.toString())] };
        await db.collection('session').deleteMany({ userId: idFilter });
        await db.collection('account').deleteMany({ userId: idFilter });
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

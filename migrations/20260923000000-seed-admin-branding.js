const fs = require('node:fs');
const path = require('node:path');

/**
 * Реквизиты ПРОФИКС переезжают из кода (DEFAULT_BRANDING) в user.branding
 * администраторов. Стандартный бренд теперь нейтральный — Калькулятора.
 * Записываем только тем admin, у кого branding ещё пуст: если админ уже
 * что-то заполнил через /edit, не трогаем.
 *
 * Логотип — public/logo.png (526×109, ~10 КБ) как data-URL, тот же формат,
 * в котором его сохраняет форма.
 */
const PROFIX_TEXT = [
    'ООО "ПРОФИКС НН"',
    'Телефон: +7 920 252-00-01',
    'Email: office@profix-nn.ru',
    'ИНН 5258123969 КПП 525801001 ОГРН 1155258004648',
].join('\n');

const readLogoDataUrl = () => {
    const file = path.join(__dirname, '..', 'public', 'logo.png');
    const buf = fs.readFileSync(file);
    const isPng =
        buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47;
    if (!isPng) {
        throw new Error(`[seed-admin-branding] ${file} — не PNG`);
    }
    return `data:image/png;base64,${buf.toString('base64')}`;
};

const isFilled = (branding) =>
    Boolean(branding) &&
    (Boolean(branding.logo && branding.logo.dataUrl) ||
        String(branding.text || '').trim() !== '');

module.exports = {
    /**
     * @param db {import('mongodb').Db}
     * @returns {Promise<void>}
     */
    async up(db) {
        const users = db.collection('user');
        const admins = await users.find({ role: 'admin' }).toArray();
        if (admins.length === 0) {
            console.warn('[seed-admin-branding] администраторов не найдено');
            return;
        }

        const branding = { logo: { dataUrl: readLogoDataUrl() }, text: PROFIX_TEXT };
        const now = new Date();
        let updated = 0;

        for (const admin of admins) {
            if (isFilled(admin.branding)) {
                console.log(
                    `[seed-admin-branding] ${admin.email}: branding уже заполнен, пропуск`,
                );
                continue;
            }
            await users.updateOne(
                { _id: admin._id },
                { $set: { branding, brandingSeededAt: now, updatedAt: now } },
            );
            updated += 1;
        }
        console.log(`[seed-admin-branding] записано: ${updated} из ${admins.length}`);
    },

    /**
     * Откат снимает только то, что записала эта миграция (по метке
     * brandingSeededAt), не трогая реквизиты, которые админ правил сам.
     * @param db {import('mongodb').Db}
     * @returns {Promise<void>}
     */
    async down(db) {
        const result = await db.collection('user').updateMany(
            { role: 'admin', brandingSeededAt: { $exists: true } },
            { $unset: { branding: '', brandingSeededAt: '' }, $set: { updatedAt: new Date() } },
        );
        console.log(`[seed-admin-branding] откат: ${result.modifiedCount}`);
    },
};

const bcryptjs = require('bcryptjs');

const toDate = (value) => {
    if (value instanceof Date) return value;
    const parsed = new Date(value || Date.now());
    return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
};

module.exports = {
    /**
     * Перенос пользователей на схему better-auth:
     * - обязательные поля user: emailVerified, name, createdAt/updatedAt (Date);
     * - пароль переезжает в коллекцию account (providerId: 'credential');
     * - плейнтекст-пароли хэшируются bcrypt (дальше их верифицирует
     *   bcrypt-fallback в app/lib/auth.ts и лениво перехэширует в scrypt);
     * - документы без email пропускаются (залогируются) — войти они и раньше
     *   не могли.
     *
     * @param db {import('mongodb').Db}
     * @returns {Promise<void>}
     */
    async up(db) {
        const users = db.collection('user');
        const accounts = db.collection('account');
        const allUsers = await users.find({}).toArray();
        const now = new Date();

        for (const user of allUsers) {
            const email = String(user.email || '')
                .trim()
                .toLowerCase();

            if (!email) {
                console.warn(
                    `[better-auth migration] пропущен документ без email: _id=${user._id}`,
                );
                continue;
            }

            const createdAt = toDate(user.createdAt);
            const updatedAt = toDate(user.updatedAt);

            if (typeof user.password === 'string' && user.password) {
                const isBcrypt = user.password.startsWith('$2');
                const passwordHash = isBcrypt
                    ? user.password
                    : await bcryptjs.hash(user.password, 10);

                const existing = await accounts.findOne({
                    userId: user._id,
                    providerId: 'credential',
                });
                if (!existing) {
                    await accounts.insertOne({
                        userId: user._id,
                        accountId: user._id.toString(),
                        providerId: 'credential',
                        password: passwordHash,
                        createdAt: now,
                        updatedAt: now,
                    });
                }
            }

            await users.updateOne(
                { _id: user._id },
                {
                    $set: {
                        email,
                        name: user.name || user.username || email,
                        emailVerified: false,
                        role: user.role || 'user',
                        createdAt,
                        updatedAt,
                    },
                    $unset: { password: '' },
                },
            );
        }
    },

    /**
     * Откат: вернуть пароль в user, удалить credential-аккаунты.
     * emailVerified/Date-поля не откатываем — они безвредны.
     *
     * @param db {import('mongodb').Db}
     * @returns {Promise<void>}
     */
    async down(db) {
        const users = db.collection('user');
        const accounts = db.collection('account');
        const credentialAccounts = await accounts
            .find({ providerId: 'credential' })
            .toArray();

        for (const account of credentialAccounts) {
            await users.updateOne(
                { _id: account.userId },
                { $set: { password: account.password } },
            );
        }

        await accounts.deleteMany({ providerId: 'credential' });
    },
};

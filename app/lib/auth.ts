import { betterAuth } from 'better-auth';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import { nextCookies } from 'better-auth/next-js';
import { hashPassword, verifyPassword } from 'better-auth/crypto';
import bcryptjs from 'bcryptjs';
import { MongoClient } from 'mongodb';

// Отдельный клиент для better-auth: mongodbAdapter требует синхронный Db.
// Драйвер v6 подключается лениво при первой операции.
const client = new MongoClient(process.env.DB_URL as string, {
    maxPoolSize: 10,
});
const db = client.db(process.env.DB_NAME);

/**
 * Верификация пароля с поддержкой legacy bcrypt-хэшей ($2a$/$2b$...).
 * При успешном bcrypt-входе хэш лениво перезаписывается на scrypt.
 */
const verifyWithBcryptFallback = async ({
    password,
    hash,
}: {
    password: string;
    hash: string;
}): Promise<boolean> => {
    if (!hash.startsWith('$2')) {
        return verifyPassword({ password, hash });
    }

    const isValid = await bcryptjs.compare(password, hash);
    if (isValid) {
        // Ленивая миграция bcrypt -> scrypt.
        try {
            const newHash = await hashPassword(password);
            await db
                .collection('account')
                .updateOne(
                    { providerId: 'credential', password: hash },
                    { $set: { password: newHash, updatedAt: new Date() } },
                );
        } catch (error) {
            // Перехэширование не должно ломать вход.
            console.error('Failed to rehash legacy password:', error);
        }
    }
    return isValid;
};

export const auth = betterAuth({
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: process.env.BETTER_AUTH_URL,
    database: mongodbAdapter(db, { client }),
    emailAndPassword: {
        enabled: true,
        minPasswordLength: 8,
        maxPasswordLength: 200,
        password: {
            hash: hashPassword,
            verify: verifyWithBcryptFallback,
        },
    },
    user: {
        additionalFields: {
            role: {
                type: 'string',
                defaultValue: 'user',
                // Нельзя задать с клиента при регистрации.
                input: false,
            },
        },
    },
    // Сессии: дефолт better-auth — 7 дней, скользящее продление раз в сутки.
    rateLimit: {
        // По умолчанию rate-limit включён только в production — включаем всегда.
        enabled: true,
        storage: 'database',
        customRules: {
            '/sign-in/email': { window: 60, max: 5 },
            '/sign-up/email': { window: 60, max: 3 },
        },
    },
    plugins: [
        // Должен быть последним: прокидывает Set-Cookie в server actions Next.js.
        nextCookies(),
    ],
});

export type Session = typeof auth.$Infer.Session;

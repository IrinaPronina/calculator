import type { UserSettings } from '@/app/models/adminDataTypes';

/**
 * Документ пользователя в коллекции user (схема better-auth).
 * Пароль здесь не хранится — он в коллекции account (providerId: 'credential').
 */
export type SafeUser = {
    _id: { toString(): string };
    email: string;
    role?: string;
    name?: string;
    emailVerified?: boolean;
    settings?: UserSettings;
};

const buildEmailFilter = (email: string) => {
    const normalizedEmail = String(email || '')
        .trim()
        .toLowerCase();
    return {
        normalizedEmail,
        filter: { email: normalizedEmail },
    };
};

/** Пользователь по email — без чувствительных полей. */
export async function getUserSafe(email: string): Promise<SafeUser | null> {
    const { normalizedEmail, filter } = buildEmailFilter(email);
    if (!normalizedEmail) {
        return null;
    }

    const { default: clientPromise } = await import('@/lib/mongodb');
    const client = await clientPromise;
    const db = client.db(process.env.DB_NAME);

    return db.collection<SafeUser>('user').findOne(filter, {
        projection: { password: 0 },
    });
}

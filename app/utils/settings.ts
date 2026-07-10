import { Db, Document, ObjectId } from 'mongodb';
import { headers } from 'next/headers';
import { auth } from '@/app/lib/auth';
import { getUserSafe, type SafeUser } from '@/app/utils/user';
import { SettingsType, UserSettings } from '@/app/models/adminDataTypes';

export const DEFAULT_SETTINGS: SettingsType = {
    general: { rate: 0, overheads: 0, profit: 0 },
    pay: [],
    materials: [],
    exp: [],
    version: 0,
};

/** Приводит сырой документ настроек к SettingsType с безопасными фолбэками. */
export const normalizeSettings = (
    doc: Document | null,
): SettingsType | null => {
    if (!doc) {
        return null;
    }

    const general =
        doc.general &&
        typeof doc.general.rate === 'number' &&
        typeof doc.general.overheads === 'number' &&
        typeof doc.general.profit === 'number'
            ? doc.general
            : DEFAULT_SETTINGS.general;

    return {
        general,
        pay: Array.isArray(doc.pay) ? doc.pay : DEFAULT_SETTINGS.pay,
        materials: Array.isArray(doc.materials)
            ? doc.materials
            : DEFAULT_SETTINGS.materials,
        exp: Array.isArray(doc.exp) ? doc.exp : DEFAULT_SETTINGS.exp,
        formula: doc.formula,
        version: Number(doc.version || 0),
        updatedAt: typeof doc.updatedAt === 'string' ? doc.updatedAt : undefined,
    };
};

/** Текущий пользователь из сессии (резолв из БД, без password). */
export async function getCurrentUser(): Promise<SafeUser | null> {
    const session = await auth.api.getSession({ headers: await headers() });
    const email = String(session?.user?.email || '').trim();
    if (!email) {
        return null;
    }
    return getUserSafe(email);
}

/** Глобальный шаблон (дефолты администратора). */
export async function getGlobalTemplate(db: Db): Promise<SettingsType> {
    const doc =
        (await db.collection('settings').findOne({ scope: 'global' })) ??
        (await db.collection('settings').findOne({}));
    return normalizeSettings(doc) ?? DEFAULT_SETTINGS;
}

/**
 * Личные настройки пользователя. При первом обращении лениво клонирует шаблон
 * условным апдейтом (без гонки и без уникального индекса).
 */
export async function getOrCreateUserSettings(
    db: Db,
    user: SafeUser,
): Promise<UserSettings> {
    if (user.settings) {
        return user.settings;
    }

    const template = await getGlobalTemplate(db);
    const now = new Date().toISOString();
    const cloned: UserSettings = {
        general: { ...template.general },
        pay: template.pay.map((row) => ({ ...row })),
        materials: template.materials.map((row) => ({ ...row })),
        exp: template.exp.map((row) => ({ ...row })),
        formula: template.formula ? { ...template.formula } : undefined,
        mode: 'own',
        version: 0,
        createdAt: now,
        updatedAt: now,
    };

    const _id = new ObjectId(user._id.toString());

    // Условие settings:{$exists:false} делает операцию идемпотентной: при гонке
    // второй апдейт не находит документ и ничего не перезаписывает.
    await db
        .collection('user')
        .updateOne(
            { _id, settings: { $exists: false } },
            { $set: { settings: cloned } },
        );

    const fresh = await db
        .collection('user')
        .findOne({ _id }, { projection: { settings: 1 } });

    return (fresh?.settings as UserSettings) ?? cloned;
}

/** Какие настройки использовать для расчёта: гость/global → шаблон, иначе свои. */
export async function resolveSettingsForCalc(
    db: Db,
    user: SafeUser | null,
): Promise<SettingsType> {
    if (!user) {
        return getGlobalTemplate(db);
    }
    if (user.settings?.mode === 'global') {
        return getGlobalTemplate(db);
    }
    return getOrCreateUserSettings(db, user);
}

import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getDb } from '@/app/utils/api-routes';
import { Db, Document, ObjectId } from 'mongodb';
import {
    SettingsType,
    SettingsMode,
    UserSettings,
} from '@/app/models/adminDataTypes';
import type { SafeUser } from '@/app/utils/user';
import {
    DEFAULT_SETTINGS,
    getCurrentUser,
    getGlobalTemplate,
    getOrCreateUserSettings,
} from '@/app/utils/settings';

type PriceRow = { id: string; name: string; price: number; increase: number };

const toNumberOrFallback = (value: unknown, fallback: number): number => {
    const num = Number(value);
    return Number.isFinite(num) ? num : fallback;
};

const updateNumericOnly = (
    currentRows: PriceRow[],
    incomingRows: unknown,
): PriceRow[] => {
    const incomingArray = Array.isArray(incomingRows) ? incomingRows : [];
    const incomingById = new Map<string, Record<string, unknown>>();

    incomingArray.forEach((row) => {
        if (!row || typeof row !== 'object') {
            return;
        }
        const item = row as Record<string, unknown>;
        incomingById.set(String(item.id ?? ''), item);
    });

    return currentRows.map((row) => {
        const incoming = incomingById.get(row.id);
        if (!incoming) {
            return row;
        }

        return {
            ...row,
            // Only numeric fields are mutable from /edit
            price: toNumberOrFallback(incoming.price, row.price),
            increase: toNumberOrFallback(incoming.increase, row.increase),
        };
    });
};

const isValidSettingsPayload = (payload: SettingsType): boolean => {
    if (!payload || !payload.general) return false;
    if (!Array.isArray(payload.pay)) return false;
    if (!Array.isArray(payload.materials)) return false;
    if (!Array.isArray(payload.exp)) return false;
    return true;
};

const normalizeMode = (value: unknown): SettingsMode =>
    value === 'global' ? 'global' : 'own';

const unauthorized = () =>
    NextResponse.json(
        { status: 'error', errors: ['Требуется авторизация.'] },
        { status: 401 },
    );

const forbidden = () =>
    NextResponse.json(
        { status: 'error', errors: ['Недостаточно прав.'] },
        { status: 403 },
    );

const versionConflict = () =>
    NextResponse.json(
        {
            status: 'error',
            errors: ['Конфликт версий. Обновите страницу и повторите.'],
        },
        { status: 409 },
    );

const emptyRefs = () =>
    NextResponse.json(
        {
            status: 'error',
            errors: [
                'Справочники pay/materials/exp пустые. Сначала восстановите данные миграцией.',
            ],
        },
        { status: 400 },
    );

// --- GET ------------------------------------------------------------------

export async function GET(req: Request) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return unauthorized();
        }

        const scope = new URL(req.url).searchParams.get('scope');
        const { db } = await getDb(clientPromise, null);

        if (scope === 'global') {
            if (user.role !== 'admin') {
                return forbidden();
            }
            return NextResponse.json({
                status: 'success',
                data: await getGlobalTemplate(db),
            });
        }

        const settings = await getOrCreateUserSettings(db, user);
        return NextResponse.json({ status: 'success', data: settings });
    } catch {
        return NextResponse.json(
            {
                status: 'success',
                data: DEFAULT_SETTINGS,
                warnings: [
                    'База данных недоступна, использованы настройки по умолчанию.',
                ],
            },
            { status: 200 },
        );
    }
}

// --- PUT ------------------------------------------------------------------

export async function PUT(req: Request) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return unauthorized();
        }

        const { db, reqBody } = await getDb(clientPromise, req);
        const payload = reqBody as Partial<UserSettings> & {
            version?: number;
            scope?: string;
        };
        const scope =
            new URL(req.url).searchParams.get('scope') ?? payload.scope;

        if (scope === 'global') {
            if (user.role !== 'admin') {
                return forbidden();
            }
            return putGlobalTemplate(db, payload);
        }

        return putUserSettings(db, user, payload);
    } catch {
        return NextResponse.json(
            { status: 'error', errors: ['Ошибка сохранения настроек.'] },
            { status: 500 },
        );
    }
}

// --- запись личных настроек пользователя ----------------------------------

async function putUserSettings(
    db: Db,
    user: SafeUser,
    payload: Partial<UserSettings> & { version?: number },
): Promise<NextResponse> {
    const current = await getOrCreateUserSettings(db, user);
    const _id = new ObjectId(user._id.toString());
    const now = new Date().toISOString();

    // Лёгкий путь: переключатель режима шлёт только { mode } — без правки чисел.
    const isModeOnly =
        payload.mode !== undefined &&
        payload.pay === undefined &&
        payload.materials === undefined &&
        payload.exp === undefined &&
        payload.general === undefined;

    if (isModeOnly) {
        const mode = normalizeMode(payload.mode);
        await db
            .collection('user')
            .updateOne(
                { _id },
                { $set: { 'settings.mode': mode, 'settings.updatedAt': now } },
            );
        return NextResponse.json({
            status: 'success',
            data: { mode, updatedAt: now },
        });
    }

    const currentVersion = Number(current.version || 0);
    const clientVersion = Number(payload.version ?? currentVersion);
    if (clientVersion !== currentVersion) {
        return versionConflict();
    }

    const currentPay = Array.isArray(current.pay) ? current.pay : [];
    const currentMaterials = Array.isArray(current.materials)
        ? current.materials
        : [];
    const currentExp = Array.isArray(current.exp) ? current.exp : [];

    if (
        currentPay.length === 0 ||
        currentMaterials.length === 0 ||
        currentExp.length === 0
    ) {
        return emptyRefs();
    }

    const nextVersion = currentVersion + 1;
    const currentGeneral = current.general ?? DEFAULT_SETTINGS.general;

    const toSave: SettingsType & { mode: SettingsMode } = {
        general: {
            rate: toNumberOrFallback(payload.general?.rate, currentGeneral.rate ?? 0),
            overheads: toNumberOrFallback(
                payload.general?.overheads,
                currentGeneral.overheads ?? 0,
            ),
            profit: toNumberOrFallback(
                payload.general?.profit,
                currentGeneral.profit ?? 0,
            ),
        },
        pay: updateNumericOnly(currentPay, payload.pay),
        materials: updateNumericOnly(currentMaterials, payload.materials),
        exp: updateNumericOnly(currentExp, payload.exp),
        formula: payload.formula ?? current.formula,
        version: nextVersion,
        updatedAt: now,
        mode:
            payload.mode !== undefined
                ? normalizeMode(payload.mode)
                : current.mode,
    };

    if (!isValidSettingsPayload(toSave)) {
        return NextResponse.json(
            { status: 'error', errors: ['Некорректный формат настроек.'] },
            { status: 400 },
        );
    }

    await db.collection('user').updateOne(
        { _id },
        {
            $set: {
                'settings.general': toSave.general,
                'settings.pay': toSave.pay,
                'settings.materials': toSave.materials,
                'settings.exp': toSave.exp,
                'settings.formula': toSave.formula,
                'settings.mode': toSave.mode,
                'settings.version': toSave.version,
                'settings.updatedAt': toSave.updatedAt,
            },
        },
    );

    return NextResponse.json({
        status: 'success',
        data: { version: nextVersion, updatedAt: now, mode: toSave.mode },
        warnings: [
            'Обновлены только разрешенные числовые поля: pay/materials/exp.price+increase, general.rate+overheads+profit.',
        ],
    });
}

// --- запись глобального шаблона (только admin, ?scope=global) --------------

async function putGlobalTemplate(
    db: Db,
    payload: Partial<SettingsType> & { version?: number },
): Promise<NextResponse> {
    const current = await getGlobalTemplateDoc(db);
    const currentVersion = Number(current?.version || 0);
    const clientVersion = Number(payload.version ?? currentVersion);

    if (current && clientVersion !== currentVersion) {
        return versionConflict();
    }

    const currentPay = Array.isArray(current?.pay)
        ? (current!.pay as PriceRow[])
        : [];
    const currentMaterials = Array.isArray(current?.materials)
        ? (current!.materials as PriceRow[])
        : [];
    const currentExp = Array.isArray(current?.exp)
        ? (current!.exp as PriceRow[])
        : [];

    if (
        currentPay.length === 0 ||
        currentMaterials.length === 0 ||
        currentExp.length === 0
    ) {
        return emptyRefs();
    }

    const now = new Date().toISOString();
    const nextVersion = currentVersion + 1;
    const currentGeneral =
        current?.general && typeof current.general === 'object'
            ? (current.general as {
                  rate?: number;
                  overheads?: number;
                  profit?: number;
              })
            : DEFAULT_SETTINGS.general;

    const toSave: SettingsType = {
        general: {
            rate: toNumberOrFallback(payload.general?.rate, currentGeneral.rate ?? 0),
            overheads: toNumberOrFallback(
                payload.general?.overheads,
                currentGeneral.overheads ?? 0,
            ),
            profit: toNumberOrFallback(
                payload.general?.profit,
                currentGeneral.profit ?? 0,
            ),
        },
        pay: updateNumericOnly(currentPay, payload.pay),
        materials: updateNumericOnly(currentMaterials, payload.materials),
        exp: updateNumericOnly(currentExp, payload.exp),
        formula: payload.formula,
        version: nextVersion,
        updatedAt: now,
    };

    if (!isValidSettingsPayload(toSave)) {
        return NextResponse.json(
            { status: 'error', errors: ['Некорректный формат настроек.'] },
            { status: 400 },
        );
    }

    await db
        .collection('settings')
        .updateOne(
            { _id: current?._id ?? 'default' },
            { $set: { ...toSave, scope: 'global' } },
            { upsert: true },
        );

    return NextResponse.json({
        status: 'success',
        data: { version: nextVersion, updatedAt: now },
        warnings: [
            'Обновлены только разрешенные числовые поля глобального шаблона.',
        ],
    });
}

const getGlobalTemplateDoc = async (db: Db): Promise<Document | null> => {
    return (
        (await db.collection('settings').findOne({ scope: 'global' })) ??
        (await db.collection('settings').findOne({}))
    );
};

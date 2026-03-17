import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getDb } from '@/app/utils/api-routes';
import { Db, Document } from 'mongodb';
import { SettingsType } from '@/app/models/adminDataTypes';

const DEFAULT_SETTINGS: SettingsType = {
    general: { rate: 0, overheads: 0, profit: 0 },
    pay: [],
    materials: [],
    exp: [],
    version: 0,
};

export async function GET() {
    try {
        const { db } = await getDb(clientPromise, null);
        const settings = await getSettings(db);
        return NextResponse.json({
            status: 'success',
            data: settings ?? DEFAULT_SETTINGS,
        });
    } catch {
        return NextResponse.json(
            {
                status: 'success',
                data: DEFAULT_SETTINGS,
                warnings: ['База данных недоступна, использованы настройки по умолчанию.'],
            },
            { status: 200 },
        );
    }
}

export async function PUT(req: Request) {
    try {
        const { db, reqBody } = await getDb(clientPromise, req);
        const payload = reqBody as SettingsType & { version?: number };
        const current = await getSettingsDoc(db);
        const currentVersion = Number(current?.version || 0);
        const clientVersion = Number(payload.version ?? currentVersion);

        if (current && clientVersion !== currentVersion) {
            return NextResponse.json(
                {
                    status: 'error',
                    errors: ['Конфликт версий. Обновите страницу и повторите.'],
                },
                { status: 409 },
            );
        }

        const now = new Date().toISOString();
        const nextVersion = currentVersion + 1;

        const toSave: SettingsType = {
            general: payload.general,
            pay: payload.pay,
            materials: payload.materials,
            exp: payload.exp,
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

        await db.collection('settings').updateOne(
            { _id: current?._id ?? 'default' },
            { $set: toSave },
            { upsert: true },
        );

        return NextResponse.json({
            status: 'success',
            data: { version: nextVersion, updatedAt: now },
        });
    } catch {
        return NextResponse.json(
            { status: 'error', errors: ['Ошибка сохранения настроек.'] },
            { status: 500 },
        );
    }
}

const getSettingsDoc = async (db: Db): Promise<Document | null> => {
    return db.collection('settings').findOne({});
};

const getSettings = async (db: Db): Promise<SettingsType | null> => {
    const doc = await getSettingsDoc(db);
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

const isValidSettingsPayload = (payload: SettingsType): boolean => {
    if (!payload || !payload.general) return false;
    if (!Array.isArray(payload.pay)) return false;
    if (!Array.isArray(payload.materials)) return false;
    if (!Array.isArray(payload.exp)) return false;
    return true;
};

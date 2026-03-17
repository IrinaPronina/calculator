import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getDb } from '@/app/utils/api-routes';
import { SettingsType } from '@/app/models/adminDataTypes';
import {
    calculateConcreteOffer,
    normalizeCalculateRequest,
    validateCalculateRequest,
} from '@/app/domain/concrete-calc';

export async function POST(req: Request) {
    try {
        const { db, reqBody } = await getDb(clientPromise, req);
        const normalized = normalizeCalculateRequest(reqBody);
        const errors = validateCalculateRequest(normalized);

        if (errors.length > 0) {
            return NextResponse.json(
                { status: 'error', errors },
                { status: 400 }
            );
        }

        const settings = (await db.collection('settings').findOne({})) as
            | SettingsType
            | null;

        if (!settings) {
            return NextResponse.json(
                {
                    status: 'error',
                    errors: [
                        'Настройки расчета не найдены. Проверьте коллекцию settings.',
                    ],
                },
                { status: 500 }
            );
        }

        const data = calculateConcreteOffer(normalized, settings);

        return NextResponse.json({ status: 'success', data });
    } catch (error) {
        return NextResponse.json(
            {
                status: 'error',
                errors: ['Ошибка сервера при выполнении расчета.'],
            },
            { status: 500 }
        );
    }
}

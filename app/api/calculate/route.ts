import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { getDb } from '@/app/utils/api-routes';
import {
    calculateConcreteOffer,
    normalizeCalculateRequest,
    validateCalculateRequest,
} from '@/app/domain/concrete-calc';
import { getCurrentUser, resolveSettingsForCalc } from '@/app/utils/settings';
import { checkRateLimit, getClientIp } from '@/app/utils/rate-limit';

export async function POST(req: Request) {
    const rate = checkRateLimit(`calculate:${getClientIp(req)}`, {
        windowMs: 60_000,
        max: 30,
    });
    if (!rate.allowed) {
        return NextResponse.json(
            { status: 'error', errors: ['Слишком много запросов'] },
            {
                status: 429,
                headers: { 'Retry-After': String(rate.retryAfterSec) },
            },
        );
    }

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

        // Гость / режим global → живой шаблон; режим own → личные настройки.
        const user = await getCurrentUser();
        const settings = await resolveSettingsForCalc(db, user);

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

import { NextResponse } from 'next/server';
import { requireSession } from '@/app/utils/auth-guards';
import { getUserSafe } from '@/app/utils/user';
import { checkRateLimit } from '@/app/utils/rate-limit';
import { brandingSchema } from '@/app/lib/branding-schemas';
import { isBrandingFilled } from '@/app/utils/branding';
import type { Branding } from '@/app/constants/branding';

/**
 * Бренд пользователя для шапки сайта и КП: логотип + текст реквизитов.
 * Хранится в user.branding. У администратора всегда фирменный — писать нельзя.
 * См. docs/superpowers/plans/2026-09-14-white-label-branding-plan.md
 */

const error = (status: number, ...errors: string[]) =>
    NextResponse.json({ status: 'error', errors }, { status });

const adminForbidden = () =>
    error(403, 'У администратора всегда фирменные реквизиты.');

const getUsersCollection = async () => {
    const { default: clientPromise } = await import('@/lib/mongodb');
    const client = await clientPromise;
    return client.db(process.env.DB_NAME).collection('user');
};

export async function GET() {
    const { session, response } = await requireSession();
    if (response) return response;

    try {
        const user = await getUserSafe(session.user.email);
        const branding: Branding | null = isBrandingFilled(user?.branding)
            ? user!.branding!
            : null;
        return NextResponse.json({ status: 'success', data: branding });
    } catch (err) {
        console.error('GET /api/lk/branding failed:', err);
        return error(500, 'Ошибка загрузки реквизитов');
    }
}

export async function PUT(req: Request) {
    const { session, response } = await requireSession();
    if (response) return response;
    if (session.user.role === 'admin') return adminForbidden();

    const rate = checkRateLimit(`branding:${session.user.id}`, {
        windowMs: 60 * 60_000,
        max: 20,
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

    let body: unknown;
    try {
        body = await req.json();
    } catch {
        return error(400, 'Некорректное тело запроса.');
    }

    const parsed = brandingSchema.safeParse(body);
    if (!parsed.success) {
        const messages = parsed.error.issues.map((issue) => issue.message);
        return error(400, ...Array.from(new Set(messages)));
    }

    const branding: Branding = parsed.data;

    try {
        const users = await getUsersCollection();
        const email = String(session.user.email).trim().toLowerCase();

        if (!isBrandingFilled(branding)) {
            // Пусто и без логотипа — то же, что сброс на фирменный.
            await users.updateOne(
                { email },
                { $unset: { branding: '' }, $set: { updatedAt: new Date() } },
            );
            return NextResponse.json({ status: 'success', data: null });
        }

        await users.updateOne(
            { email },
            { $set: { branding, updatedAt: new Date() } },
        );
        return NextResponse.json({ status: 'success', data: branding });
    } catch (err) {
        console.error('PUT /api/lk/branding failed:', err);
        return error(500, 'Ошибка сохранения реквизитов');
    }
}

export async function DELETE() {
    const { session, response } = await requireSession();
    if (response) return response;
    if (session.user.role === 'admin') return adminForbidden();

    try {
        const users = await getUsersCollection();
        const email = String(session.user.email).trim().toLowerCase();
        await users.updateOne(
            { email },
            { $unset: { branding: '' }, $set: { updatedAt: new Date() } },
        );
        return NextResponse.json({ status: 'success', data: null });
    } catch (err) {
        console.error('DELETE /api/lk/branding failed:', err);
        return error(500, 'Ошибка сброса реквизитов');
    }
}

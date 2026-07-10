import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { auth, type Session } from '@/app/lib/auth';

type GuardResult =
    | { session: Session; response: null }
    | { session: null; response: NextResponse };

/** Требует активную сессию, иначе 401. */
export async function requireSession(): Promise<GuardResult> {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
        return {
            session: null,
            response: NextResponse.json(
                { status: 'error', errors: ['Требуется авторизация'] },
                { status: 401 },
            ),
        };
    }
    return { session, response: null };
}

/** Требует сессию с ролью admin, иначе 401/403. */
export async function requireAdmin(): Promise<GuardResult> {
    const result = await requireSession();
    if (result.response) {
        return result;
    }
    if (result.session.user.role !== 'admin') {
        return {
            session: null,
            response: NextResponse.json(
                { status: 'error', errors: ['Недостаточно прав'] },
                { status: 403 },
            ),
        };
    }
    return result;
}

import { NextResponse } from 'next/server';
import { requireSession } from '@/app/utils/auth-guards';

export async function GET() {
    const { session, response } = await requireSession();
    if (response) {
        return response;
    }

    try {
        return NextResponse.json({
            status: 'success',
            data: {
                name: session.user.name || '',
                email: session.user.email,
            },
        });
    } catch (error) {
        console.error('GET /api/lk/me failed:', error);
        return NextResponse.json(
            { status: 'error', errors: ['Ошибка загрузки профиля'] },
            { status: 500 },
        );
    }
}

import { NextResponse } from 'next/server';
import { auth } from '@/app/auth';
import { getUserFromDb } from '@/app/utils/user';

export async function GET() {
    try {
        const session = await auth();
        const email = String(session?.user?.email || '').trim();

        if (!email) {
            return NextResponse.json(
                { status: 'error', errors: ['Требуется авторизация'] },
                { status: 401 },
            );
        }

        const user = await getUserFromDb(email);
        if (!user) {
            return NextResponse.json(
                { status: 'error', errors: ['Пользователь не найден'] },
                { status: 404 },
            );
        }

        return NextResponse.json({
            status: 'success',
            data: {
                name: user.name || '',
                email: user.email || email,
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

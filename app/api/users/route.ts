import { NextResponse } from 'next/server';
import { requireAdmin } from '@/app/utils/auth-guards';

export async function GET() {
    const { response } = await requireAdmin();
    if (response) {
        return response;
    }

    try {
        const { default: clientPromise } = await import('@/lib/mongodb');
        const client = await clientPromise;
        const db = client.db(process.env.DB_NAME);
        const users = await db
            .collection('user')
            .find(
                {},
                // Только безопасные поля — хэши и settings не отдаём.
                {
                    projection: {
                        email: 1,
                        name: 1,
                        role: 1,
                        emailVerified: 1,
                        createdAt: 1,
                    },
                },
            )
            .toArray();
        return NextResponse.json({ status: 'success', data: users });
    } catch (error) {
        console.error('GET /api/users failed:', error);
        return NextResponse.json(
            { status: 'error', errors: ['Ошибка получения пользователей'] },
            { status: 500 },
        );
    }
}

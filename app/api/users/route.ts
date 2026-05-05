import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const { default: clientPromise } = await import('@/lib/mongodb');
        const client = await clientPromise;
        const db = client.db(process.env.DB_NAME);
        const users = await db.collection('user').find({}).toArray();
        return NextResponse.json({ status: 'success', data: users });
    } catch (error) {
        console.error('GET /api/users failed:', error);
        return NextResponse.json(
            { status: 'error', errors: ['Ошибка получения пользователей'] },
            { status: 500 },
        );
    }
}

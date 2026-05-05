import { NextResponse } from 'next/server';
import { registerUserFunc } from '@/app/actions/auth-actions';

export async function POST(req: Request) {
    try {
        const body = (await req.json()) as {
            email?: string;
            password?: string;
            name?: string;
        };

        const result = await registerUserFunc(
            body.email || '',
            body.password || '',
            body.name || '',
        );

        if ('error' in result) {
            return NextResponse.json(
                { status: 'error', errors: [result.error] },
                { status: 400 },
            );
        }

        return NextResponse.json({ status: 'success', data: result });
    } catch (error) {
        console.error('POST /api/register failed:', error);
        return NextResponse.json(
            { status: 'error', errors: ['Ошибка регистрации'] },
            { status: 500 },
        );
    }
}

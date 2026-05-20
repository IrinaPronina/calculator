import { NextResponse } from 'next/server';
import bcryptjs from 'bcryptjs';
import { loginSchema } from '@/app/lib/auth-schemas';
import { getUserFromDb } from '@/app/utils/user';

export async function POST(req: Request) {
    try {
        const body = (await req.json()) as { email?: string; password?: string };
        const parsed = loginSchema.safeParse({
            email: body.email,
            password: body.password,
        });

        if (!parsed.success) {
            return NextResponse.json(
                {
                    status: 'error',
                    code: 'INVALID_INPUT',
                    error: parsed.error.issues[0]?.message || 'Некорректные данные',
                },
                { status: 400 },
            );
        }

        const user = await getUserFromDb(parsed.data.email);
        if (!user) {
            return NextResponse.json(
                {
                    status: 'error',
                    code: 'USER_NOT_FOUND',
                    error: 'Нет такого пользователя - Зарегистрируйтесь',
                },
                { status: 404 },
            );
        }

        const isPasswordValid = await bcryptjs.compare(
            parsed.data.password,
            user.password,
        );
        if (!isPasswordValid) {
            return NextResponse.json(
                {
                    status: 'error',
                    code: 'INVALID_PASSWORD_OR_EMAIL',
                    error: 'Неверный пароль или email',
                },
                { status: 401 },
            );
        }

        return NextResponse.json({ status: 'success' });
    } catch (error) {
        console.error('POST /api/auth/check failed:', error);
        return NextResponse.json(
            {
                status: 'error',
                code: 'UNEXPECTED_ERROR',
                error: 'Неожиданная ошибка входа',
            },
            { status: 500 },
        );
    }
}

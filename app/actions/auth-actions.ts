'use server';

import bcryptjs from 'bcryptjs';
import { signIn, signOut } from '@/app/auth';
import clientPromise from '@/lib/mongodb';
import { loginSchema } from '@/app/lib/auth-schemas';
import { getUserFromDb } from '@/app/utils/user';

export const singInFunc = async (email: string, password: string) => {
    try {
        const parsed = loginSchema.safeParse({ email, password });
        if (!parsed.success) {
            return {
                ok: false,
                code: 'INVALID_INPUT',
                error: parsed.error.issues[0]?.message || 'Некорректные данные',
            };
        }

        const user = await getUserFromDb(parsed.data.email);
        if (!user) {
            return {
                ok: false,
                code: 'USER_NOT_FOUND',
                error: 'Нет такого пользователя - Зарегистрируйтесь',
            };
        }

        const isPasswordValid = await bcryptjs.compare(
            parsed.data.password,
            user.password,
        );
        if (!isPasswordValid) {
            return {
                ok: false,
                code: 'INVALID_PASSWORD_OR_EMAIL',
                error: 'Неверный пароль или email',
            };
        }

        const result = await signIn('credentials', {
            email: parsed.data.email,
            password: parsed.data.password,
            redirect: false,
        });

        if (!result || (result as { error?: string }).error) {
            return {
                ok: false,
                code: 'INVALID_PASSWORD_OR_EMAIL',
                error: 'Неверный пароль или email',
            };
        }

        return { ok: true };
    } catch (error) {
        console.error('Error during sign-in:', error);
        return {
            ok: false,
            code: 'UNEXPECTED_ERROR',
            error: 'Неожиданная ошибка входа',
        };
    }
};

export const singOutFunc = async () => {
    try {
        const result = await signOut({ redirect: false });
        return result;
    } catch (error) {
        console.error('Error during sign-out:', error);
        return { error: 'An unexpected error occurred during sign-out.' };
    }
};

export const registerUserFunc = async (
    email: string,
    password: string,
    name?: string,
) => {
    try {
        const normalizedEmail = String(email || '')
            .trim()
            .toLowerCase();
        const normalizedPassword = String(password || '');
        const normalizedName = String(name || '').trim();

        if (!normalizedEmail) {
            return { error: 'Email is required.' };
        }

        if (!normalizedPassword || normalizedPassword.length < 8) {
            return { error: 'Password must contain at least 8 characters.' };
        }

        const client = await clientPromise;
        const db = client.db(process.env.DB_NAME);
        const users = db.collection('user');

        const existingUser = await users.findOne({ email: normalizedEmail });
        if (existingUser) {
            return {
                ok: false,
                code: 'USER_ALREADY_EXISTS',
                error: 'Пользователь с таким email уже существует',
            };
        }

        const passwordHash = await bcryptjs.hash(normalizedPassword, 10);

        const insertResult = await users.insertOne({
            email: normalizedEmail,
            password: passwordHash,
            name: normalizedName || normalizedEmail,
            role: 'user',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });

        return { success: true, userId: insertResult.insertedId.toString() };
    } catch (error) {
        console.error('Error during registration:', error);
        return { error: 'An unexpected error occurred during registration.' };
    }
};

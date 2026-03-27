'use server';

import { cookies } from 'next/headers';

const EDIT_AUTH_COOKIE = 'calc_edit_auth';

export async function loginAction(formData: FormData) {
    const login = String(formData.get('login') || '').trim();
    const password = String(formData.get('password') || '');

    const expectedLogin = process.env.EDIT_LOGIN || 'administrator';
    const expectedPassword = process.env.EDIT_PASSWORD || 'dimvs2003';

    const isValid = login === expectedLogin && password === expectedPassword;

    if (!isValid) {
        return { ok: false as const, error: 'Неверный логин или пароль' };
    }

    const cookieStore = await cookies();
    cookieStore.set(EDIT_AUTH_COOKIE, '1', {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60 * 12,
    });

    return { ok: true as const };
}

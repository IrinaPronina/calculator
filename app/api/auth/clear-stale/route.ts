import { NextRequest, NextResponse } from 'next/server';

// Сюда попадают запросы с кукой better-auth, за которой в базе
// уже нет сессии (например, после пересоздания Mongo).
// Server component не может удалить куку при redirect, поэтому
// стираем её здесь и отправляем на /login.
export function GET(request: NextRequest) {
    const next = request.nextUrl.searchParams.get('next') || '';
    const loginUrl = new URL('/login', request.url);
    if (next.startsWith('/') && !next.startsWith('//')) {
        loginUrl.searchParams.set('next', next);
    }

    const response = NextResponse.redirect(loginUrl);
    // dev (http) и production (https) используют разные имена куки.
    response.cookies.set('better-auth.session_token', '', {
        maxAge: 0,
        path: '/',
    });
    response.cookies.set('__Secure-better-auth.session_token', '', {
        maxAge: 0,
        path: '/',
        secure: true,
    });
    return response;
}

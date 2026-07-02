import { NextRequest, NextResponse } from 'next/server';
import { getSessionCookie } from 'better-auth/cookies';

// Middleware — только UX-слой (редиректы по наличию session-cookie).
// Настоящая проверка сессии — в API-роутах и server components.
export default function middleware(request: NextRequest) {
    const { pathname, search } = request.nextUrl;

    const isEditRoute = pathname.startsWith('/edit');
    const isLoginRoute = pathname.startsWith('/login');
    const hasSessionCookie = Boolean(getSessionCookie(request));

    if (isEditRoute && !hasSessionCookie) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('next', `${pathname}${search}`);
        return NextResponse.redirect(loginUrl);
    }

    if (isLoginRoute && hasSessionCookie) {
        return NextResponse.redirect(new URL('/edit', request.url));
    }

    const response = NextResponse.next();

    if (pathname.startsWith('/pdf-offer')) {
        response.headers.set('x-pdf-route', 'true');
    }

    return response;
}

export const config = {
    // /api/auth не трогаем — роуты better-auth защищают себя сами.
    matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico).*)'],
};

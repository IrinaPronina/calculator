import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const EDIT_AUTH_COOKIE = 'calc_edit_auth';

export function middleware(request: NextRequest) {
    const { pathname, search } = request.nextUrl;

    const isEditRoute = pathname.startsWith('/edit');
    const isLoginRoute = pathname.startsWith('/login');
    const hasEditAuth = request.cookies.get(EDIT_AUTH_COOKIE)?.value === '1';

    if (isEditRoute && !hasEditAuth) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('next', `${pathname}${search}`);
        return NextResponse.redirect(loginUrl);
    }

    if (isLoginRoute && hasEditAuth) {
        return NextResponse.redirect(new URL('/edit', request.url));
    }

    const response = NextResponse.next();

    if (pathname.startsWith('/pdf-offer')) {
        response.headers.set('x-pdf-route', 'true');
    }

    return response;
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

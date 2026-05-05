import { NextResponse } from 'next/server';
import { auth } from '@/app/auth';

export default auth((request) => {
    const { pathname, search } = request.nextUrl;

    const isEditRoute = pathname.startsWith('/edit');
    const isLoginRoute = pathname.startsWith('/login');
    const isAuthenticated = Boolean(request.auth);

    if (isEditRoute && !isAuthenticated) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('next', `${pathname}${search}`);
        return NextResponse.redirect(loginUrl);
    }

    if (isLoginRoute && isAuthenticated) {
        return NextResponse.redirect(new URL('/edit', request.url));
    }

    const response = NextResponse.next();

    if (pathname.startsWith('/pdf-offer')) {
        response.headers.set('x-pdf-route', 'true');
    }

    return response;
});

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

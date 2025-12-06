import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const response = NextResponse.next();

    // Add a custom header to identify PDF routes
    if (request.nextUrl.pathname.startsWith('/pdf-offer')) {
        response.headers.set('x-pdf-route', 'true');
    }

    return response;
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

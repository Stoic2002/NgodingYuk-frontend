import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define paths that require authentication
const protectedRoutes = [
    '/profile',
    '/settings',
    '/courses', // Root courses list can be public if desired, customize as needed
    '/challenges'
];

// Define paths that are strictly for unauthenticated users
const authRoutes = [
    '/login',
    '/register'
];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Check if the current route is protected or auth-only
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
    const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

    // Access token is stored as an HttpOnly cookie
    const accessToken = request.cookies.get('access_token')?.value;

    if (isProtectedRoute && !accessToken) {
        // Redirect unauthenticated users to login if trying to access a protected route
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        // Optional: add a ?redirect= param to send them back after login
        url.searchParams.set('redirect', pathname);
        return NextResponse.redirect(url);
    }

    if (isAuthRoute && accessToken) {
        // Redirect authenticated users away from login/register
        const url = request.nextUrl.clone();
        url.pathname = '/';
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};

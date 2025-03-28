import { NextResponse } from "next/server";

const PUBLIC_PATHS = ['/', '/login', '/signup', '/privacy', '/terms', '/contact'];
const PROTECTED_PATHS = ['/welcome', '/dashboard', '/map', '/camera'];

export function middleware(request) {
    const token = request.cookies.get("token")?.value;
    const path = request.nextUrl.pathname;

    const isPublicPath = PUBLIC_PATHS.includes(path);
    const isProtectedPath = PROTECTED_PATHS.some(p => path.startsWith(p));

    if (isProtectedPath && !token) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    if (isPublicPath && token && path !== '/') {
        return NextResponse.redirect(new URL('/welcome', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/',
        '/login',
        '/signup',
        '/welcome',
        '/dashboard/:path*',
        '/map/:path*',
        '/camera/:path*',
        '/api/user/:path*'
    ]
}; 
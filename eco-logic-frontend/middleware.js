import { NextResponse } from "next/server";

const PUBLIC_PATHS = ['/', '/login', '/signup'];
const PROTECTED_PATHS = ['/welcome', '/food-analysis'];

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
        '/food-analysis/:path*',
        '/guest-dashboard',
        '/api/auth/:path*',
        '/api/food/:path*'
    ]
}; 
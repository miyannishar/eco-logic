import { NextResponse } from "next/server";

export function middleware(request) {
    const token = request.cookies.get("token")?.value;
    const path = request.nextUrl.pathname;

    // Public paths that should be accessible without redirection
    const publicPaths = ['/', '/login', '/signup', '/privacy', '/terms', '/contact'];
    const isPublicPath = publicPaths.includes(path);

    // Protected paths
    const protectedPaths = ['/welcome', '/dashboard', '/map', '/camera'];
    const isProtectedPath = protectedPaths.some(p => path.startsWith(p));

    // If trying to access protected routes without token, redirect to login
    if (isProtectedPath && !token) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // If trying to access login/signup with token, redirect to welcome page
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
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

// Protected routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/chat',
  '/documents',
  '/terms',
  '/clauses',
  '/risk',
  '/sec',
  '/draft-email',
  '/saved',
  '/settings',
];

// Admin-only routes
const adminRoutes = [
  '/admin',
  '/approvals',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if route requires authentication
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));

  if (isProtectedRoute || isAdminRoute) {
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      // Redirect to login
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const payload = await verifyToken(token);

    if (!payload) {
      // Invalid token, redirect to login
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Check admin access
    if (isAdminRoute && payload.role !== 'admin') {
      // Not admin, redirect to dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - login, /, /legal (public pages)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|login|legal|$).*)',
  ],
};

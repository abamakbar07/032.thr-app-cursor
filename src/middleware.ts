import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if this is a protected route
  const isProtectedRoute = 
    pathname.startsWith('/dashboard') || 
    pathname.startsWith('/admin') || 
    pathname.startsWith('/api/admin');
  
  // Check if this is an auth route
  const isAuthRoute = 
    pathname.startsWith('/signin') || 
    pathname.startsWith('/signup');

  // Check if this is an entry route
  const isEntryRoute = pathname.startsWith('/entry');

  // Get the authentication token
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  
  // Redirect logic
  if (isProtectedRoute && !token) {
    // Redirect to signin if trying to access protected route without authentication
    return NextResponse.redirect(new URL('/signin', request.url));
  }
  
  if (isAuthRoute && token) {
    // Redirect to dashboard if already authenticated and trying to access auth routes
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // Check for admin-only routes
  if ((pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) && 
      token && token.role !== 'admin') {
    // Redirect to dashboard if not an admin
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Entry route requires roomId parameter
  if (isEntryRoute) {
    const roomId = request.nextUrl.searchParams.get('roomId');
    if (!roomId) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Protected routes
    '/dashboard/:path*',
    '/admin/:path*',
    '/api/admin/:path*',
    // Auth routes
    '/signin',
    '/signup',
    // Entry route
    '/entry',
  ],
}; 
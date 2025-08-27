import { NextRequest, NextResponse } from 'next/server';
import { getSessionCookie } from 'better-auth/cookies';

export async function middleware(request: NextRequest) {
  // Check if the request is for dashboard routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    // Get the session cookie using Better Auth's helper
    const sessionCookie = getSessionCookie(request);
    
    // If no session cookie, redirect to login
    if (!sessionCookie) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }

    // If session cookie exists, allow the request to continue
    // The actual session validation will happen on the server side
    return NextResponse.next();
  }

  // For non-dashboard routes, allow the request to continue
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'], // Apply middleware only to dashboard routes
};

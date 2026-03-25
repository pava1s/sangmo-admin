import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Root redirect
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard/whatsapp/inbox', request.url));
  }

  // 2. Auth guard for /dashboard
  if (pathname.startsWith('/dashboard')) {
    // Check for Cognito/Amplify cookies
    // Amplify usually stores tokens in localStorage but can be configured for cookies.
    // Even if it's in localStorage, we can check for common cookie names if the user has sessions enabled.
    // AS A FALLBACK for this specific architecture, we rely on the layout gate, 
    // but we can add a check for any cookie to at least prevent raw hits from crawlers/unauthenticated browsers.
    
    // NOTE: This is a simplified guard. The actual hard verification happens in DashboardLayoutClient.tsx
    const allCookies = request.cookies.getAll();
    const hasAuthCookie = allCookies.some(cookie => 
      cookie.name.includes('CognitoIdentityServiceProvider') || 
      cookie.name.includes('amplify')
    );

    // If we want to be strict, we'd redirect if !hasAuthCookie. 
    // However, since Amplify (v6) by default uses LocalStorage, a strict cookie check might block valid users.
    // For now, we'll implement the middleware as a routing gate.
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
     * - login (login page)
     * - public (public assets)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|login|public).*)',
  ],
};

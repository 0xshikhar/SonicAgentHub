import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // List of protected routes that require wallet authentication
  const protectedRoutes = [
    '/agents', 
    '/dashboard', 
    '/profile', 
    '/tweets'
  ];

  if (protectedRoutes.some(route => path.startsWith(route))) {
    // Check if wallet is connected by looking for the wallet-connected cookie
    // This cookie will be set by the client-side Wagmi implementation
    const isWalletConnected = request.cookies.get('wallet-connected');
    
    if (!isWalletConnected) {
      // Redirect to the home page with a query parameter to show toast
      const url = new URL('/', request.url);
      url.searchParams.set('auth', 'required');
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

// Define which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}; 
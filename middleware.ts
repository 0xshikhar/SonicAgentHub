import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // List of protected routes
  const protectedRoutes = ['', '/dashboard'];

  if (protectedRoutes.some(route => path.startsWith(route))) {
    // Check if user is authenticated (you might want to check for a specific cookie or header)
    const isAuthenticated = request.cookies.get('privy-token');
    
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/listing/:path*', '/agents/:path*', '/dashboard/:path*'],
}; 
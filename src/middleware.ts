// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const publicPaths = ['/registro', '/login', '/confirm-register'];
  
  if (publicPaths.includes(pathname)) {
    return NextResponse.next();
  }

  const authToken = request.cookies.get('auth-token');
  if (!authToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}


export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
};
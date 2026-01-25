import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// This is a placeholder middleware. Since we're using Zustand with persist,
// authentication state is client-side only. The actual auth check happens
// in the dashboard layout component.
export function middleware(request: NextRequest) {
  // You can add server-side auth logic here if needed in the future
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/appointments/:path*',
    '/staff/:path*',
    '/services/:path*',
    '/queue/:path*',
    '/activity/:path*',
  ],
}

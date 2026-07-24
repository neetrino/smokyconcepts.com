import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  return new NextResponse('Not Found', { status: 404 });
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
};

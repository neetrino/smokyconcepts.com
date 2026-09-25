import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  SITE_FRAME_CSP,
  isFramablePaymentReturn,
  paymentFrameCsp,
} from '@/lib/security/payment-frame-policy';

function isHiddenAdminPath(pathname: string): boolean {
  return pathname === '/admin' || pathname.startsWith('/admin/');
}

function applyFramePolicy(response: NextResponse, pathname: string): NextResponse {
  if (isFramablePaymentReturn(pathname)) {
    response.headers.set('Content-Security-Policy', paymentFrameCsp());
    response.headers.delete('X-Frame-Options');
    return response;
  }

  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Content-Security-Policy', SITE_FRAME_CSP);
  return response;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (isHiddenAdminPath(pathname)) {
    return applyFramePolicy(new NextResponse('Not Found', { status: 404 }), pathname);
  }

  return applyFramePolicy(NextResponse.next(), pathname);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

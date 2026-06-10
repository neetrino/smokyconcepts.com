import type { NextRequest, NextResponse } from 'next/server';
import {
  AUTH_COOKIE_NAME,
  getAuthCookieMaxAgeSeconds,
} from './auth-cookie.constants';

function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

function buildAuthCookieParts(token: string, maxAgeSeconds: number): string[] {
  const parts = [
    `${AUTH_COOKIE_NAME}=${encodeURIComponent(token)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${maxAgeSeconds}`,
  ];

  if (isProduction()) {
    parts.push('Secure');
  }

  return parts;
}

export function buildAuthCookieHeader(token: string): string {
  return buildAuthCookieParts(token, getAuthCookieMaxAgeSeconds()).join('; ');
}

export function buildClearAuthCookieHeader(): string {
  const parts = [
    `${AUTH_COOKIE_NAME}=`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=0',
  ];

  if (isProduction()) {
    parts.push('Secure');
  }

  return parts.join('; ');
}

export function appendAuthCookie(response: NextResponse, token: string): NextResponse {
  response.headers.append('Set-Cookie', buildAuthCookieHeader(token));
  return response;
}

export function appendClearAuthCookie(response: NextResponse): NextResponse {
  response.headers.append('Set-Cookie', buildClearAuthCookieHeader());
  return response;
}

/**
 * Reads JWT from httpOnly cookie first, then Authorization Bearer (legacy migration).
 */
export function getTokenFromRequest(request: NextRequest): string | null {
  const cookieToken = request.cookies.get(AUTH_COOKIE_NAME)?.value?.trim();
  if (cookieToken) {
    return cookieToken;
  }

  const authHeader = request.headers.get('authorization');
  const bearerToken = authHeader?.split(' ')[1]?.trim();
  return bearerToken || null;
}

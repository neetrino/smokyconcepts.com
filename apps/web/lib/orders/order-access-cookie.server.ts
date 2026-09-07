import type { NextRequest, NextResponse } from 'next/server';
import {
  ORDER_ACCESS_COOKIE_MAX_AGE_SECONDS,
  ORDER_ACCESS_COOKIE_NAME,
} from './order-access-cookie.constants';

function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

/**
 * Cookie holds exactly one order id (the order currently allowed to view).
 * Legacy JSON-array cookies are reduced to their last id.
 */
function parseOrderAccessId(raw: string | undefined): string | null {
  if (!raw?.trim()) {
    return null;
  }
  const value = raw.trim();
  try {
    const decoded = decodeURIComponent(value);
    const parsed: unknown = JSON.parse(decoded);
    if (Array.isArray(parsed)) {
      const ids = parsed
        .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
        .map((item) => item.trim());
      return ids.length > 0 ? ids[ids.length - 1]! : null;
    }
    if (typeof parsed === 'string' && parsed.trim()) {
      return parsed.trim();
    }
  } catch {
    // plain id (possibly URI-encoded)
  }
  try {
    const decoded = decodeURIComponent(value).trim();
    return decoded || null;
  } catch {
    return value || null;
  }
}

function buildOrderAccessCookieHeader(orderId: string): string {
  const parts = [
    `${ORDER_ACCESS_COOKIE_NAME}=${encodeURIComponent(orderId)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${ORDER_ACCESS_COOKIE_MAX_AGE_SECONDS}`,
  ];
  if (isProduction()) {
    parts.push('Secure');
  }
  return parts.join('; ');
}

/**
 * Reads the single allowed order id from the order-access cookie.
 */
export function getOrderAccessIdFromRequest(request: NextRequest): string | null {
  return parseOrderAccessId(request.cookies.get(ORDER_ACCESS_COOKIE_NAME)?.value);
}

/**
 * Replaces the order-access cookie with exactly one order id.
 */
export function appendOrderAccessCookie(
  response: NextResponse,
  _request: NextRequest,
  orderId: string,
): NextResponse {
  const trimmed = orderId.trim();
  if (!trimmed) {
    return response;
  }
  response.headers.append('Set-Cookie', buildOrderAccessCookieHeader(trimmed));
  return response;
}

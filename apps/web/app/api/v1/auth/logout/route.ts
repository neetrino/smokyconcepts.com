import { NextResponse } from 'next/server';
import { appendClearAuthCookie } from '@/lib/auth/auth-cookie.server';

/**
 * POST /api/v1/auth/logout
 * Clears the httpOnly auth cookie.
 */
export async function POST() {
  const response = NextResponse.json({ ok: true });
  return appendClearAuthCookie(response);
}

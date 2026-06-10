import { NextRequest, NextResponse } from 'next/server';
import { authenticateToken } from '@/lib/middleware/auth';
import {
  appendAuthCookie,
  getTokenFromRequest,
} from '@/lib/auth/auth-cookie.server';

/**
 * POST /api/v1/auth/migrate-cookie
 * One-time migration: moves a legacy Bearer token into an httpOnly cookie.
 */
export async function POST(req: NextRequest) {
  const user = await authenticateToken(req);
  if (!user) {
    return NextResponse.json(
      {
        type: 'https://api.shop.am/problems/unauthorized',
        title: 'Unauthorized',
        status: 401,
        detail: 'Authentication token required',
        instance: req.url,
      },
      { status: 401 },
    );
  }

  const token = getTokenFromRequest(req);
  if (!token) {
    return NextResponse.json(
      {
        type: 'https://api.shop.am/problems/unauthorized',
        title: 'Unauthorized',
        status: 401,
        detail: 'Authentication token required',
        instance: req.url,
      },
      { status: 401 },
    );
  }

  const response = NextResponse.json({ ok: true, userId: user.id });
  return appendAuthCookie(response, token);
}

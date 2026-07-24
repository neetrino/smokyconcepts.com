import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/services/auth.service';
import { appendAuthCookie } from '@/lib/auth/auth-cookie.server';
import { toApiError } from '@/lib/types/errors';
import { logger } from '@/lib/utils/logger';
import { enforceRateLimit } from '@/lib/security/rate-limit';
import {
  AUTH_LOGIN_MAX_ATTEMPTS,
  AUTH_RATE_LIMIT_WINDOW_SECONDS,
} from '@/lib/security/rate-limit.constants';

export async function POST(req: NextRequest) {
  const rateLimited = await enforceRateLimit(req, {
    scope: 'auth:login',
    limit: AUTH_LOGIN_MAX_ATTEMPTS,
    windowSeconds: AUTH_RATE_LIMIT_WINDOW_SECONDS,
  });
  if (rateLimited) {
    return rateLimited;
  }

  try {
    const data = await req.json();
    const result = await authService.login(data);
    const response = NextResponse.json({ user: result.user });
    return appendAuthCookie(response, result.token);
  } catch (error: unknown) {
    logger.error('Login error', { error });
    const apiError = toApiError(error, req.url);
    return NextResponse.json(apiError, { status: apiError.status || 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { passwordResetService } from '@/lib/services/password-reset.service';
import { toApiError } from '@/lib/types/errors';
import { logger } from '@/lib/utils/logger';
import { enforceRateLimit } from '@/lib/security/rate-limit';
import {
  AUTH_RATE_LIMIT_WINDOW_SECONDS,
  AUTH_RESET_PASSWORD_MAX_ATTEMPTS,
} from '@/lib/security/rate-limit.constants';

export async function POST(req: NextRequest) {
  const rateLimited = await enforceRateLimit(req, {
    scope: 'auth:reset-password',
    limit: AUTH_RESET_PASSWORD_MAX_ATTEMPTS,
    windowSeconds: AUTH_RATE_LIMIT_WINDOW_SECONDS,
  });
  if (rateLimited) {
    return rateLimited;
  }

  try {
    const body = await req.json();
    const token = typeof body.token === 'string' ? body.token : '';
    const password = typeof body.password === 'string' ? body.password : '';
    const result = await passwordResetService.resetPassword(token, password);
    return NextResponse.json(result);
  } catch (error: unknown) {
    logger.error('Reset password error', { error });
    const apiError = toApiError(error, req.url);
    return NextResponse.json(apiError, { status: apiError.status || 500 });
  }
}

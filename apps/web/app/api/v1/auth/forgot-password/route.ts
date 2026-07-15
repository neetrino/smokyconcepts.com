import { NextRequest, NextResponse } from 'next/server';
import { passwordResetService } from '@/lib/services/password-reset.service';
import { toApiError } from '@/lib/types/errors';
import { logger } from '@/lib/utils/logger';
import { enforceRateLimit } from '@/lib/security/rate-limit';
import {
  AUTH_FORGOT_PASSWORD_MAX_ATTEMPTS,
  AUTH_FORGOT_PASSWORD_WINDOW_SECONDS,
} from '@/lib/security/rate-limit.constants';

export async function POST(req: NextRequest) {
  const rateLimited = await enforceRateLimit(req, {
    scope: 'auth:forgot-password',
    limit: AUTH_FORGOT_PASSWORD_MAX_ATTEMPTS,
    windowSeconds: AUTH_FORGOT_PASSWORD_WINDOW_SECONDS,
  });
  if (rateLimited) {
    return rateLimited;
  }

  try {
    const body = await req.json();
    const email = typeof body.email === 'string' ? body.email : '';
    const result = await passwordResetService.requestReset(email, {
      appBaseUrl: req.nextUrl.origin,
    });
    return NextResponse.json(result);
  } catch (error: unknown) {
    logger.error('Forgot password error', { error });
    const apiError = toApiError(error, req.url);
    return NextResponse.json(apiError, { status: apiError.status || 500 });
  }
}

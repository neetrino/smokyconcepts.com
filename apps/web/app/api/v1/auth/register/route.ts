import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/services/auth.service';
import { appendAuthCookie } from '@/lib/auth/auth-cookie.server';
import { logger } from '@/lib/utils/logger';
import { enforceRateLimit } from '@/lib/security/rate-limit';
import {
  AUTH_RATE_LIMIT_WINDOW_SECONDS,
  AUTH_REGISTER_MAX_ATTEMPTS,
} from '@/lib/security/rate-limit.constants';

export async function POST(req: NextRequest) {
  const rateLimited = await enforceRateLimit(req, {
    scope: 'auth:register',
    limit: AUTH_REGISTER_MAX_ATTEMPTS,
    windowSeconds: AUTH_RATE_LIMIT_WINDOW_SECONDS,
  });
  if (rateLimited) {
    return rateLimited;
  }

  try {
    const data = await req.json();
    const result = await authService.register(data);
    const response = NextResponse.json({ user: result.user }, { status: 201 });
    return appendAuthCookie(response, result.token);
  } catch (error: unknown) {
    logger.error('Registration error', { error });
    const err = error as {
      type?: string;
      title?: string;
      status?: number;
      detail?: string;
      message?: string;
    };
    return NextResponse.json(
      {
        type: err.type || 'https://api.shop.am/problems/internal-error',
        title: err.title || 'Internal Server Error',
        status: err.status || 500,
        detail: err.detail || err.message || 'An error occurred',
        instance: req.url,
      },
      { status: err.status || 500 },
    );
  }
}

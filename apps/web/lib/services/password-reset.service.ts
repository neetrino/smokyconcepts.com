import { db } from '@white-shop/db';
import {
  createPasswordResetToken,
  hashPasswordResetToken,
} from '@/lib/auth/password-reset.token';
import { sendPasswordResetEmail } from '@/lib/email/send-password-reset-email';
import {
  hashPassword,
  validateNewPasswordPolicy,
} from '@/lib/security/password';
import { PASSWORD_POLICY_DETAIL } from '@/lib/security/password.constants';
import { logger } from '@/lib/utils/logger';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const FORGOT_PASSWORD_SUCCESS = {
  message: 'If an account exists for this email, a reset link has been sent.',
} as const;

interface PasswordResetRequestOptions {
  appBaseUrl?: string;
}

function assertValidEmail(email: string): string {
  const normalized = email.trim().toLowerCase();
  if (!normalized || !EMAIL_REGEX.test(normalized)) {
    throw {
      status: 400,
      type: 'https://api.shop.am/problems/validation-error',
      title: 'Validation failed',
      detail: 'A valid email is required',
    };
  }
  return normalized;
}

function assertValidNewPassword(password: string): void {
  const passwordError = validateNewPasswordPolicy(password);
  if (!passwordError) {
    return;
  }

  throw {
    status: 400,
    type: 'https://api.shop.am/problems/validation-error',
    title: 'Validation failed',
    detail:
      passwordError === 'Password is required'
        ? PASSWORD_POLICY_DETAIL
        : passwordError,
  };
}

class PasswordResetService {
  async requestReset(
    emailRaw: string,
    options?: PasswordResetRequestOptions,
  ): Promise<{ message: string }> {
    const email = assertValidEmail(emailRaw);

    const user = await db.user.findFirst({
      where: {
        email: { equals: email, mode: 'insensitive' },
        deletedAt: null,
        blocked: false,
      },
      select: { id: true, email: true, passwordHash: true },
    });

    if (!user?.email || !user.passwordHash) {
      logger.info('Password reset skipped — no matching account', { email });
      return FORGOT_PASSWORD_SUCCESS;
    }

    const { rawToken, tokenHash, expiresAt } = createPasswordResetToken();

    await db.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: tokenHash,
        passwordResetExpires: expiresAt,
      },
    });

    try {
      await sendPasswordResetEmail({
        to: user.email,
        rawToken,
        appBaseUrl: options?.appBaseUrl,
      });
    } catch (error: unknown) {
      await db.user.update({
        where: { id: user.id },
        data: { passwordResetToken: null, passwordResetExpires: null },
      });
      throw error;
    }

    logger.info('Password reset requested', { userId: user.id });
    return FORGOT_PASSWORD_SUCCESS;
  }

  async resetPassword(
    rawToken: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    if (!rawToken?.trim()) {
      throw {
        status: 400,
        type: 'https://api.shop.am/problems/validation-error',
        title: 'Validation failed',
        detail: 'Reset token is required',
      };
    }

    assertValidNewPassword(newPassword);

    const tokenHash = hashPasswordResetToken(rawToken.trim());
    const user = await db.user.findFirst({
      where: {
        passwordResetToken: tokenHash,
        passwordResetExpires: { gt: new Date() },
        deletedAt: null,
        blocked: false,
      },
      select: { id: true },
    });

    if (!user) {
      throw {
        status: 400,
        type: 'https://api.shop.am/problems/validation-error',
        title: 'Invalid or expired token',
        detail: 'This reset link is invalid or has expired',
      };
    }

    const passwordHash = await hashPassword(newPassword);
    await db.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });

    logger.info('Password reset completed', { userId: user.id });
    return { message: 'Password has been reset successfully' };
  }
}

export const passwordResetService = new PasswordResetService();

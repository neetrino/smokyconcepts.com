import { PASSWORD_RESET_BRAND_NAME } from '@/lib/auth/password-reset.constants';
import { logger } from '@/lib/utils/logger';
import { getAppBaseUrl } from './get-app-base-url';
import { getEmailFromAddress, getResendClient } from './resend.client';
import {
  buildPasswordResetEmailHtml,
  buildPasswordResetEmailText,
} from './templates/password-reset-html';

export interface SendPasswordResetEmailParams {
  to: string;
  rawToken: string;
  appBaseUrl?: string;
}

/**
 * Sends a branded password-reset email via Resend.
 * The reset link in the email opens /reset-password on the app.
 */
export async function sendPasswordResetEmail({
  to,
  rawToken,
  appBaseUrl,
}: SendPasswordResetEmailParams): Promise<void> {
  const resetLinkBaseUrl = getAppBaseUrl(appBaseUrl);
  const assetsBaseUrl = getAppBaseUrl();
  const resetUrl = `${resetLinkBaseUrl}/reset-password?token=${encodeURIComponent(rawToken)}`;
  const html = buildPasswordResetEmailHtml({ resetUrl, baseUrl: assetsBaseUrl });
  const text = buildPasswordResetEmailText(resetUrl);

  const resend = getResendClient();
  const from = getEmailFromAddress();

  if (!resend || !from) {
    logger.error('Password reset email not configured', {
      hasResend: Boolean(resend),
      hasFrom: Boolean(from),
    });
    throw {
      status: 503,
      type: 'https://api.shop.am/problems/service-unavailable',
      title: 'Email service unavailable',
      detail:
        'Password reset email is not configured. Set RESEND_API_KEY and EMAIL_FROM in .env',
    };
  }

  const { error } = await resend.emails.send({
    from,
    to,
    subject: `${PASSWORD_RESET_BRAND_NAME} — Վերականգնել գաղտնաբառը`,
    html,
    text,
  });

  if (error) {
    logger.error('Failed to send password reset email', { to, error });
    throw {
      status: 502,
      type: 'https://api.shop.am/problems/bad-gateway',
      title: 'Email delivery failed',
      detail: error.message || 'Could not send password reset email',
    };
  }

  logger.info('Password reset email sent', { to });
}

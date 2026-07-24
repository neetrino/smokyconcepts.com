import { Resend } from 'resend';

let resendClient: Resend | null = null;

function readEnv(name: string): string | null {
  const value = process.env[name]?.trim();
  return value ? value : null;
}

/**
 * Returns a Resend client when RESEND_API_KEY is configured.
 */
export function getResendClient(): Resend | null {
  const apiKey = readEnv('RESEND_API_KEY');
  if (!apiKey) {
    return null;
  }

  if (!resendClient) {
    resendClient = new Resend(apiKey);
  }

  return resendClient;
}

export function getEmailFromAddress(): string | null {
  return readEnv('EMAIL_FROM');
}

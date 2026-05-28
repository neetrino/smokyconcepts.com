import { createHmac, timingSafeEqual } from 'node:crypto';

const INIT_TOKEN_TTL_SECONDS = 10 * 60;
const HMAC_ALGORITHM = 'sha256';

export type PaymentInitTokenClaims = {
  orderId: string;
  orderNumber: string;
  paymentMethod: string;
  userId: string | null;
  exp: number;
};

function getSigningKey(): string {
  const key = process.env.PAYMENT_INIT_TOKEN_SECRET?.trim() || process.env.JWT_SECRET?.trim() || '';
  if (!key) {
    throw new Error('Missing PAYMENT_INIT_TOKEN_SECRET (or JWT_SECRET fallback) for payment init token');
  }
  return key;
}

function hmacDigest(data: string): Buffer {
  return createHmac(HMAC_ALGORITHM, getSigningKey()).update(data).digest();
}

function toBase64Url(value: string): string {
  return Buffer.from(value, 'utf8').toString('base64url');
}

export function signPaymentInitToken(
  input: Omit<PaymentInitTokenClaims, 'exp'>,
  nowUnixSeconds = Math.floor(Date.now() / 1000),
): string {
  const payload: PaymentInitTokenClaims = {
    ...input,
    exp: nowUnixSeconds + INIT_TOKEN_TTL_SECONDS,
  };
  const encodedPayload = toBase64Url(JSON.stringify(payload));
  const signature = hmacDigest(encodedPayload).toString('base64url');
  return `${encodedPayload}.${signature}`;
}

export function verifyPaymentInitToken(
  token: string,
  nowUnixSeconds = Math.floor(Date.now() / 1000),
): PaymentInitTokenClaims | null {
  const [encodedPayload, encodedSignature] = token.split('.');
  if (!encodedPayload || !encodedSignature) {
    return null;
  }

  const expectedSignature = hmacDigest(encodedPayload);
  const receivedSignature = Buffer.from(encodedSignature, 'base64url');
  if (expectedSignature.length !== receivedSignature.length) {
    return null;
  }
  if (!timingSafeEqual(expectedSignature, receivedSignature)) {
    return null;
  }

  const parsed = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8')) as
    | PaymentInitTokenClaims
    | undefined;
  if (!parsed) {
    return null;
  }
  if (typeof parsed.exp !== 'number' || parsed.exp <= nowUnixSeconds) {
    return null;
  }
  if (
    typeof parsed.orderId !== 'string' ||
    typeof parsed.orderNumber !== 'string' ||
    typeof parsed.paymentMethod !== 'string' ||
    (parsed.userId !== null && typeof parsed.userId !== 'string')
  ) {
    return null;
  }
  return parsed;
}

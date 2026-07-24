import * as argon2 from 'argon2';
import * as bcrypt from 'bcryptjs';
import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  PASSWORD_POLICY_DETAIL,
} from './password.constants';

const BCRYPT_HASH_PREFIX = '$2';

/** Argon2id options — balanced for API routes / serverless. */
const ARGON2_OPTIONS: argon2.Options & { type: typeof argon2.argon2id } = {
  type: argon2.argon2id,
  memoryCost: 19_456,
  timeCost: 2,
  parallelism: 1,
};

export function isLegacyBcryptHash(hash: string): boolean {
  return hash.startsWith(BCRYPT_HASH_PREFIX);
}

/**
 * Validates password for registration or password change (not login).
 */
export function validateNewPasswordPolicy(password: string): string | null {
  if (typeof password !== 'string' || password.trim() === '') {
    return 'Password is required';
  }

  if (password.length < PASSWORD_MIN_LENGTH) {
    return PASSWORD_POLICY_DETAIL;
  }

  if (password.length > PASSWORD_MAX_LENGTH) {
    return `Password must be at most ${PASSWORD_MAX_LENGTH} characters long`;
  }

  return null;
}

/**
 * Hash a password with Argon2id.
 */
export async function hashPassword(plain: string): Promise<string> {
  return argon2.hash(plain, ARGON2_OPTIONS);
}

/**
 * Verify password against Argon2id or legacy bcrypt hash.
 */
export async function verifyPassword(plain: string, storedHash: string): Promise<boolean> {
  if (isLegacyBcryptHash(storedHash)) {
    return bcrypt.compare(plain, storedHash);
  }

  try {
    return await argon2.verify(storedHash, plain);
  } catch {
    return false;
  }
}

/**
 * Re-hash legacy bcrypt passwords to Argon2id after successful login / password change.
 */
export function shouldUpgradePasswordHash(storedHash: string): boolean {
  return isLegacyBcryptHash(storedHash);
}

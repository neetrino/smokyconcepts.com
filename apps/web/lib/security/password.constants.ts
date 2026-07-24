/** Minimum length for newly set passwords (register / password change). Login keeps legacy passwords. */
export const PASSWORD_MIN_LENGTH = 8;

/** Maximum password length (DoS guard for hashing). */
export const PASSWORD_MAX_LENGTH = 128;

export const PASSWORD_POLICY_DETAIL = `Password must be at least ${PASSWORD_MIN_LENGTH} characters long`;

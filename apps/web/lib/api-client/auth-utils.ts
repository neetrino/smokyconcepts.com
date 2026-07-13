import {
  LEGACY_AUTH_TOKEN_KEY,
  LEGACY_AUTH_USER_KEY,
} from '@/lib/auth/auth-cookie.constants';

export function clearLegacyAuthStorage(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.removeItem(LEGACY_AUTH_TOKEN_KEY);
    localStorage.removeItem(LEGACY_AUTH_USER_KEY);
  } catch {
    // Ignore storage errors (private mode, etc.)
  }
}

/**
 * Moves a legacy localStorage JWT into an httpOnly cookie (one-time migration).
 */
export async function migrateLegacyAuthSession(): Promise<void> {
  if (typeof window === 'undefined') {
    return;
  }

  let legacyToken: string | null = null;
  try {
    legacyToken = localStorage.getItem(LEGACY_AUTH_TOKEN_KEY);
  } catch {
    return;
  }

  if (!legacyToken) {
    clearLegacyAuthStorage();
    return;
  }

  try {
    await fetch('/api/v1/auth/migrate-cookie', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${legacyToken}`,
      },
      credentials: 'include',
    });
  } catch {
    // Session restore will fall back to unauthenticated state.
  } finally {
    clearLegacyAuthStorage();
  }
}

/**
 * Handle 401 Unauthorized errors - clear session and redirect.
 */
export function handleUnauthorized(): void {
  if (typeof window === 'undefined') {
    return;
  }

  const currentPath = window.location.pathname;
  const publicAuthPaths = ['/login', '/forgot-password', '/reset-password', '/register'];
  const isPublicAuthPath = publicAuthPaths.some(
    (pathPrefix) => currentPath === pathPrefix || currentPath.startsWith(`${pathPrefix}/`),
  );

  clearLegacyAuthStorage();

  void fetch('/api/v1/auth/logout', {
    method: 'POST',
    credentials: 'include',
  }).catch(() => {
    // Best-effort cookie clear.
  });

  window.dispatchEvent(new Event('auth-updated'));

  if (!isPublicAuthPath) {
    const redirectPath = currentPath + window.location.search;
    window.location.href = '/login?redirect=' + encodeURIComponent(redirectPath);
  }
}

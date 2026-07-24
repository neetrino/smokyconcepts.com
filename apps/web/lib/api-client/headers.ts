import type { RequestOptions } from "./types";

/**
 * JSON headers for API requests.
 * Auth is sent via httpOnly cookie (`credentials: 'include'`).
 */
export function getHeaders(options?: RequestOptions): globalThis.HeadersInit {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string> || {}),
  };

  return headers as globalThis.HeadersInit;
}




/**
 * Request options interface
 */
export interface RequestOptions extends globalThis.RequestInit {
  params?: Record<string, string>;
  skipAuth?: boolean; // Skip automatic token injection
  /** When true, a 401 does not clear the session or redirect to /login (e.g. session probe). */
  skipUnauthorizedHandler?: boolean;
}

/**
 * Custom API Error class with proper typing
 */
export class ApiError extends Error {
  status: number;
  statusText: string;
  data?: unknown;

  constructor(message: string, status: number, statusText: string = '', data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.statusText = statusText;
    this.data = data;
    
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }
}





'use client';

import { useEffect, useState } from 'react';

/** Default delay that keeps typing responsive without firing a request per keystroke. */
export const DEFAULT_DEBOUNCE_DELAY_MS = 350;

/**
 * Returns `value` only after it stayed unchanged for `delayMs`.
 * Use for filter inputs that trigger network requests.
 */
export function useDebouncedValue<TValue>(
  value: TValue,
  delayMs: number = DEFAULT_DEBOUNCE_DELAY_MS,
): TValue {
  const [debouncedValue, setDebouncedValue] = useState<TValue>(value);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setDebouncedValue(value), delayMs);
    return () => window.clearTimeout(timeoutId);
  }, [value, delayMs]);

  return debouncedValue;
}

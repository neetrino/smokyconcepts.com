/**
 * Breaks out of a payment-provider iframe when SUCCESS/FAIL was loaded framed.
 * @returns true when a top-level navigation was started (caller should stop side effects).
 */
export function breakOutOfPaymentIframeIfNeeded(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    if (window.top && window.top !== window.self) {
      window.top.location.replace(window.location.href);
      return true;
    }
  } catch {
    try {
      if (window.top) {
        window.top.location.href = window.location.href;
        return true;
      }
    } catch {
      return false;
    }
  }

  return false;
}

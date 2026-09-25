import { NextRequest, NextResponse } from 'next/server';

const PROBE_CACHE_CONTROL = 'no-store';

/**
 * Browsers and payment pages probe return URLs with HEAD or prefetch.
 * Those must not redirect the shopper or change the order.
 */
export function isPaymentReturnProbe(req: NextRequest): boolean {
  if (req.method === 'HEAD') {
    return true;
  }

  const purpose = `${req.headers.get('purpose') ?? ''} ${req.headers.get('sec-purpose') ?? ''}`
    .trim()
    .toLowerCase();
  return purpose.includes('prefetch') || purpose.includes('prerender');
}

export function paymentReturnProbeResponse(): NextResponse {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Cache-Control': PROBE_CACHE_CONTROL,
    },
  });
}

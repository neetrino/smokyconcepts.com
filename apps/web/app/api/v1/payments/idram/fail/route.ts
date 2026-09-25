import { NextRequest } from 'next/server';
import { resolveOrderNumberFromAccessCookie } from '@/lib/orders/resolve-order-number-from-access-cookie';
import { buildIdramFailureRedirect } from '@/lib/payments/idram/redirects';
import { isPaymentReturnProbe, paymentReturnProbeResponse } from '@/lib/payments/payment-return-probe';
import { createPaymentReturnResponse } from '@/lib/payments/idram/top-level-redirect';

function resolveOrderNumber(query: URLSearchParams): string | undefined {
  const candidates = [
    query.get('order_number'),
    query.get('orderNumber'),
    query.get('order'),
    query.get('EDP_BILL_NO'),
  ];
  for (const candidate of candidates) {
    const value = candidate?.trim();
    if (value) {
      return value;
    }
  }
  return undefined;
}

export function HEAD() {
  return paymentReturnProbeResponse();
}

export async function GET(req: NextRequest) {
  if (isPaymentReturnProbe(req)) {
    return paymentReturnProbeResponse();
  }

  const fromQuery = resolveOrderNumber(req.nextUrl.searchParams);
  const orderNumber = fromQuery ?? (await resolveOrderNumberFromAccessCookie(req));
  const targetUrl = buildIdramFailureRedirect(orderNumber, req.nextUrl.origin);
  return createPaymentReturnResponse(req, targetUrl);
}

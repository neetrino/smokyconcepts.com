import { NextRequest } from 'next/server';
import { buildIdramSuccessRedirect } from '@/lib/payments/idram/redirects';
import { createPaymentReturnResponse } from '@/lib/payments/idram/top-level-redirect';

function resolveOrderNumber(query: URLSearchParams): string {
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
  return '';
}

export async function GET(req: NextRequest) {
  const orderNumber = resolveOrderNumber(req.nextUrl.searchParams);
  const targetUrl = buildIdramSuccessRedirect(orderNumber || undefined, req.nextUrl.origin);
  return createPaymentReturnResponse(req, targetUrl);
}

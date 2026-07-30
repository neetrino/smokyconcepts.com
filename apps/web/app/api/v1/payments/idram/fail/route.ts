import { NextRequest } from 'next/server';
import { buildIdramFailureRedirect } from '@/lib/payments/idram/redirects';
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

export async function GET(req: NextRequest) {
  const targetUrl = buildIdramFailureRedirect(
    resolveOrderNumber(req.nextUrl.searchParams),
    req.nextUrl.origin,
  );
  return createPaymentReturnResponse(req, targetUrl);
}

import { NextRequest, NextResponse } from 'next/server';
import { buildIdramFailureRedirect } from '@/lib/payments/idram/redirects';
import { buildTopLevelRedirectHtml } from '@/lib/payments/idram/top-level-redirect';

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
  return new NextResponse(buildTopLevelRedirectHtml(targetUrl), {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}

import { NextRequest, NextResponse } from 'next/server';
import { paymentReturnProbeResponse } from '@/lib/payments/payment-return-probe';
import { getArcaOrderStatus } from './client';
import { normalizeArcaOrderStatus } from './response-codes';
import { isArcaStatusFailed, isArcaStatusInProgress, isArcaStatusPaid } from './status-checks';
import type { ArcaOrderStatusResponse } from './types';

const STATUS_POLL_ATTEMPTS = 3;
const STATUS_POLL_DELAY_MS = 600;
const CONFIRM_ATTEMPT_LIMIT = 3;
const ABANDONED_ORDER_STATUS = 0;

export type ArcaCallbackAction = 'paid' | 'failed' | 'retry' | 'hold' | 'ignore';

function wait(delayMs: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, delayMs);
  });
}

/**
 * Re-reads the bank status while 3DS is still settling.
 * A single immediate read often returns "started" and was marked failed.
 */
export async function readSettledArcaStatus(providerOrderId: string): Promise<ArcaOrderStatusResponse> {
  let latest = await getArcaOrderStatus(providerOrderId);
  for (let attempt = 1; attempt < STATUS_POLL_ATTEMPTS; attempt += 1) {
    if (!isArcaStatusInProgress(latest)) {
      return latest;
    }
    await wait(STATUS_POLL_DELAY_MS);
    latest = await getArcaOrderStatus(providerOrderId);
  }
  return latest;
}

export function resolveArcaCallbackAction(input: {
  status: ArcaOrderStatusResponse;
  confirmAttempt: number;
  isIframe: boolean;
}): ArcaCallbackAction {
  if (isArcaStatusPaid(input.status)) {
    return 'paid';
  }
  if (isArcaStatusFailed(input.status)) {
    return 'failed';
  }
  if (!isArcaStatusInProgress(input.status)) {
    return 'failed';
  }
  if (input.isIframe) {
    return 'ignore';
  }
  if (input.confirmAttempt < CONFIRM_ATTEMPT_LIMIT) {
    return 'retry';
  }
  if (normalizeArcaOrderStatus(input.status.orderStatus) === ABANDONED_ORDER_STATUS) {
    return 'failed';
  }
  return 'hold';
}

export function readConfirmAttempt(raw: string | null): number {
  const parsed = Number.parseInt(raw ?? '', 10);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return 0;
  }
  return parsed;
}

export function respondToUnsettledArcaCallback(input: {
  req: NextRequest;
  action: ArcaCallbackAction;
  confirmAttempt: number;
  orderNumber: string;
  origin: string;
}): NextResponse | null {
  if (input.action === 'ignore') {
    return paymentReturnProbeResponse();
  }
  if (input.action === 'retry') {
    const retryUrl = input.req.nextUrl.clone();
    retryUrl.searchParams.set('confirmAttempt', String(input.confirmAttempt + 1));
    return NextResponse.redirect(retryUrl);
  }
  if (input.action === 'hold') {
    const orderHref = `${input.origin}/orders/${encodeURIComponent(input.orderNumber)}`;
    return new NextResponse(buildArcaPaymentHoldHtml(orderHref), {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    });
  }
  return null;
}

function buildArcaPaymentHoldHtml(orderHref: string): string {
  const safeHref = orderHref.replace(/"/g, '&quot;').replace(/</g, '&lt;');
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Confirming payment</title>
</head>
<body>
  <p>Your bank is still confirming the payment. This page will not mark the order as failed.</p>
  <p><a href="${safeHref}">View order</a></p>
</body>
</html>`;
}

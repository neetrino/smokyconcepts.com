'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button, Card } from '@shop/ui';
import { breakOutOfPaymentIframeIfNeeded } from '@/lib/payments/break-out-of-payment-iframe';
import { resolvePaymentReturnOrderNumber } from '@/lib/payments/resolve-payment-return-order-number';

export default function CheckoutPaymentFailedPage() {
  const searchParams = useSearchParams();
  const orderNumber = resolvePaymentReturnOrderNumber(searchParams);
  const retryCheckoutHref = '/checkout';
  const orderHref = orderNumber ? `/orders/${encodeURIComponent(orderNumber)}` : '/profile';

  useEffect(() => {
    breakOutOfPaymentIframeIfNeeded();
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <Card className="p-8 text-center sm:p-10">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-700">
          <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-gray-900">Payment was not completed</h1>
        <p className="mt-3 text-base text-gray-600">
          We could not confirm your card payment.
          {orderNumber ? ` Order number: ${orderNumber}.` : ''} Please try again or choose another payment method.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href={retryCheckoutHref}>
            <Button variant="gold">Try payment again</Button>
          </Link>
          <Link href={orderHref}>
            <Button variant="outline">View order details</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}

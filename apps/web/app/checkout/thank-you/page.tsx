'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button, Card } from '@shop/ui';

export default function ThankYouPage() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('orderNumber');
  const orderHref = orderNumber ? `/orders/${encodeURIComponent(orderNumber)}` : '/profile';

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <Card className="p-8 text-center sm:p-10">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-700">
          <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M20 7L10 17L4 11" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-gray-900">Thank you for your order!</h1>
        <p className="mt-3 text-base text-gray-600">
          Your order has been placed successfully.
          {orderNumber ? ` Order number: ${orderNumber}.` : ''}
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href={orderHref}>
            <Button variant="gold">View order details</Button>
          </Link>
          <Link href="/products">
            <Button variant="outline">Continue shopping</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}

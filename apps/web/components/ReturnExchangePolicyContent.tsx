'use client';

import { Card } from '@shop/ui';
import { useTranslation } from '../lib/i18n-client';

export type ReturnPolicyNamespace = 'returns' | 'refund-policy';

type ReturnExchangePolicyContentProps = {
  namespace: ReturnPolicyNamespace;
};

/**
 * Shared return & exchange policy body for `/returns` and `/refund-policy`.
 */
export function ReturnExchangePolicyContent({ namespace }: ReturnExchangePolicyContentProps) {
  const { t } = useTranslation();
  const tp = (suffix: string) => t(`${namespace}.${suffix}`);

  return (
    <>
      <h1 className="text-4xl font-bold text-gray-900">{tp('title')}</h1>
      <p className="text-gray-600">
        {tp('lastUpdated')}{' '}
        {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
      </p>

      <div className="mt-8 space-y-6">
        <Card className="p-6 space-y-6">
          <p className="text-gray-600">{tp('intro')}</p>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900">{tp('exchange.title')}</h2>
            <ul className="mt-3 list-disc list-inside text-gray-600 ml-4 space-y-2">
              <li>{tp('exchange.bullet1')}</li>
              <li>{tp('exchange.bullet2')}</li>
              <li>{tp('exchange.bullet3')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900">{tp('productReturn.title')}</h2>
            <ul className="mt-3 list-disc list-inside text-gray-600 ml-4 space-y-2">
              <li>{tp('productReturn.bullet1')}</li>
              <li>{tp('productReturn.bullet2')}</li>
              <li>{tp('productReturn.bullet3')}</li>
              <li>{tp('productReturn.bullet4')}</li>
              <li>{tp('productReturn.bullet5')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900">{tp('moneyRefund.title')}</h2>
            <ul className="mt-3 list-disc list-inside text-gray-600 ml-4 space-y-2">
              <li>{tp('moneyRefund.bullet1')}</li>
              <li>{tp('moneyRefund.bullet2')}</li>
              <li>{tp('moneyRefund.bullet3')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900">{tp('orderCancellation.title')}</h2>
            <ul className="mt-3 list-disc list-inside text-gray-600 ml-4 space-y-2">
              <li>{tp('orderCancellation.bullet1')}</li>
              <li>{tp('orderCancellation.bullet2')}</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900">{tp('personalizedOrders.title')}</h2>
            <p className="mt-3 text-gray-600">{tp('personalizedOrders.description')}</p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900">{tp('nonReturnable.title')}</h2>
            <ul className="mt-3 list-disc list-inside text-gray-600 ml-4 space-y-2">
              <li>{tp('nonReturnable.bullet1')}</li>
              <li>{tp('nonReturnable.bullet2')}</li>
            </ul>
          </section>

          <section>
            <p className="text-gray-600">
              <span className="font-semibold text-gray-900">{tp('specialNote.label')}</span>{' '}
              {tp('specialNote.body')}
            </p>
          </section>
        </Card>
      </div>
    </>
  );
}

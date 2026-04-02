'use client';

import { Card } from '@shop/ui';
import { useTranslation } from '../../lib/i18n-client';

function getStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((item): item is string => typeof item === 'string');
}

/**
 * Terms of Service page - displays terms and conditions
 */
export default function TermsPage() {
  const { t } = useTranslation();

  const definitionItems = getStringArray(t('terms.useLicense.definitionItems'));
  const obligationItems = getStringArray(t('terms.accountRegistration.obligationItems'));
  const liabilityBullets = getStringArray(t('terms.productInformation.liabilityBullets'));
  const forceMajeureItems = getStringArray(t('terms.prohibitedUses.forceMajeureItems'));

  const paragraph43 = t('terms.productInformation.paragraph43');

  return (
    <div className="policy-page">
      <div className="policy-page-inner">
        <h1 className="text-4xl font-bold text-gray-900">{t('terms.title')}</h1>
        <p className="text-gray-600">
          {t('terms.lastUpdated')}{' '}
          {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>

        <div className="mt-8 space-y-6">
          <Card className="p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">{t('terms.agreementToTerms.title')}</h2>
            <p className="text-gray-600 mb-4">{t('terms.agreementToTerms.description1')}</p>
            <p className="text-gray-600">{t('terms.agreementToTerms.description2')}</p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4 mt-8">{t('terms.useLicense.title')}</h2>
            <p className="text-gray-600 mb-4">{t('terms.useLicense.description')}</p>
            <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
              {definitionItems.map((line, index) => (
                <li key={`def-${index}`}>{line}</li>
              ))}
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4 mt-8">{t('terms.accountRegistration.title')}</h2>
            <p className="text-gray-600 mb-4">{t('terms.accountRegistration.description')}</p>
            <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
              {obligationItems.map((line, index) => (
                <li key={`obl-${index}`}>{line}</li>
              ))}
            </ul>
            <p className="text-gray-600 mt-4">{t('terms.accountRegistration.paragraph32')}</p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4 mt-8">{t('terms.productInformation.title')}</h2>
            <p className="text-gray-600 mb-4">{t('terms.productInformation.paragraph41')}</p>
            <p className="text-gray-600 mb-2">{t('terms.productInformation.paragraph42Intro')}</p>
            <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
              {liabilityBullets.map((line, index) => (
                <li key={`lia-${index}`}>{line}</li>
              ))}
            </ul>
            {paragraph43.trim() !== '' ? (
              <p className="text-gray-600 mt-4">{paragraph43}</p>
            ) : null}

            <h2 className="text-2xl font-semibold text-gray-900 mb-4 mt-8">{t('terms.pricingAndPayment.title')}</h2>
            <p className="text-gray-600 mb-4">{t('terms.pricingAndPayment.description1')}</p>
            <p className="text-gray-600 mb-4">{t('terms.pricingAndPayment.description2')}</p>
            <p className="text-gray-600">{t('terms.pricingAndPayment.description3')}</p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4 mt-8">{t('terms.shippingAndDelivery.title')}</h2>
            <p className="text-gray-600 mb-4">{t('terms.shippingAndDelivery.description1')}</p>
            <p className="text-gray-600">{t('terms.shippingAndDelivery.description2')}</p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4 mt-8">{t('terms.returnsAndRefunds.title')}</h2>
            <p className="text-gray-600 mb-4">{t('terms.returnsAndRefunds.description1')}</p>
            <p className="text-gray-600">{t('terms.returnsAndRefunds.description2')}</p>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4 mt-8">{t('terms.prohibitedUses.title')}</h2>
            <p className="text-gray-600 mb-2">{t('terms.prohibitedUses.description')}</p>
            <ul className="list-disc list-inside text-gray-600 space-y-1 ml-4">
              {forceMajeureItems.map((line, index) => (
                <li key={`fm-${index}`}>{line}</li>
              ))}
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4 mt-8">{t('terms.limitationOfLiability.title')}</h2>
            <p className="text-gray-600">{t('terms.limitationOfLiability.description')}</p>
          </Card>
        </div>
      </div>
    </div>
  );
}

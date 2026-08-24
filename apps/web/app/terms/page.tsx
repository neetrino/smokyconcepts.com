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
  const intro = t('terms.intro');
  const sectionsList = t('terms.sectionsList');
  const hasStructuredPolicy = Array.isArray(sectionsList);

  if (hasStructuredPolicy) {
    return (
      <div className="policy-page">
        <div className="policy-page-inner">
          <h1 className="text-4xl font-bold text-gray-900">{t('terms.title')}</h1>

          <div className="mt-8 space-y-6">
            <Card variant="default" className="p-6 space-y-8">
              {Array.isArray(intro) &&
                intro.map((paragraph) => (
                  <p key={paragraph} className="text-gray-600">
                    {paragraph}
                  </p>
                ))}

              {(
                sectionsList as Array<{
                  title: string;
                  paragraphs?: string[];
                  list?: string[];
                  groups?: Array<{ title?: string; items: string[] }>;
                }>
              ).map((section) => (
                <section key={section.title} className="space-y-3">
                  <h2 className="text-2xl font-semibold text-gray-900">{section.title}</h2>

                  {Array.isArray(section.paragraphs) &&
                    section.paragraphs.map((paragraph) => (
                      <p
                        key={paragraph}
                        className={
                          paragraph.includes('\n')
                            ? 'whitespace-pre-line text-gray-600 leading-snug'
                            : 'text-gray-600'
                        }
                      >
                        {paragraph}
                      </p>
                    ))}

                  {Array.isArray(section.groups) &&
                    section.groups.map((group) => (
                      <div key={`${section.title}-${group.title || 'group'}`} className="space-y-2">
                        {group.title ? <p className="text-gray-700 font-medium">{group.title}</p> : null}
                        <ul className="ml-4 list-disc list-inside text-gray-600 space-y-1">
                          {group.items.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    ))}

                  {Array.isArray(section.list) && section.list.length > 0 ? (
                    <ul className="ml-4 list-disc list-inside text-gray-600 space-y-1">
                      {section.list.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  ) : null}
                </section>
              ))}
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const definitionItems = getStringArray(t('terms.useLicense.definitionItems'));
  const obligationItems = getStringArray(t('terms.accountRegistration.obligationItems'));
  const liabilityBullets = getStringArray(t('terms.productInformation.liabilityBullets'));
  const forceMajeureItems = getStringArray(t('terms.prohibitedUses.forceMajeureItems'));

  const paragraph43 = t('terms.productInformation.paragraph43');

  return (
    <div className="policy-page">
      <div className="policy-page-inner">
        <h1 className="text-4xl font-bold text-gray-900">{t('terms.title')}</h1>

        <div className="mt-8 space-y-6">
          <Card variant="default" className="p-6">
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

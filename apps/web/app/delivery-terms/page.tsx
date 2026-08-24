'use client';

import { Card } from '@shop/ui';
import { useTranslation } from '../../lib/i18n-client';

/**
 * Delivery Terms page — shipping and delivery conditions (hy/en/ru)
 */
export default function DeliveryTermsPage() {
  const { t } = useTranslation();
  const intro = t('delivery-terms.intro');
  const sectionsList = t('delivery-terms.sectionsList');
  const hasStructuredPolicy = Array.isArray(sectionsList);

  if (hasStructuredPolicy) {
    return (
      <div className="policy-page">
        <div className="policy-page-inner">
          <h1 className="text-4xl font-bold text-gray-900">{t('delivery-terms.title')}</h1>

          <div className="mt-8">
            <Card variant="default" className="p-6">
              <div className="space-y-8">
                {Array.isArray(intro) &&
                  intro.map((paragraph) => (
                    <section key={paragraph} className="space-y-3">
                      <p className="text-gray-600">{paragraph}</p>
                    </section>
                  ))}

                {(
                  sectionsList as Array<{
                    title: string;
                    paragraphs?: string[];
                    list?: string[];
                    trailingParagraphs?: string[];
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

                    {Array.isArray(section.list) && section.list.length > 0 ? (
                      <ul className="ml-4 list-disc list-inside text-gray-600 space-y-1">
                        {section.list.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    ) : null}

                    {Array.isArray(section.trailingParagraphs) &&
                      section.trailingParagraphs.map((paragraph) => (
                        <p key={paragraph} className="text-gray-600">
                          {paragraph}
                        </p>
                      ))}
                  </section>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="policy-page">
      <div className="policy-page-inner">
        <h1 className="text-4xl font-bold text-gray-900">{t('delivery-terms.title')}</h1>
        <p className="text-gray-600">
          {t('delivery-terms.lastUpdated')}{' '}
          {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>

        <div className="mt-8 space-y-6">
          <Card variant="default" className="p-6 space-y-6">
            <p className="text-gray-600">{t('delivery-terms.intro')}</p>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900">
                {t('delivery-terms.timeframes.title')}
              </h2>
              <ul className="mt-3 list-disc list-inside text-gray-600 ml-4 space-y-2">
                <li>{t('delivery-terms.timeframes.bullet1')}</li>
                <li>{t('delivery-terms.timeframes.bullet2')}</li>
                <li>{t('delivery-terms.timeframes.bullet3')}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900">
                {t('delivery-terms.options.title')}
              </h2>
              <p className="mt-3 text-gray-600">{t('delivery-terms.options.intro')}</p>
              <ul className="mt-2 list-disc list-inside text-gray-600 ml-4">
                <li>{t('delivery-terms.options.bullet1')}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900">{t('delivery-terms.fees.title')}</h2>
              <ul className="mt-3 list-disc list-inside text-gray-600 ml-4 space-y-2">
                <li>{t('delivery-terms.fees.bullet1')}</li>
                <li>{t('delivery-terms.fees.bullet2')}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900">{t('delivery-terms.delays.title')}</h2>
              <p className="mt-3 text-gray-600">{t('delivery-terms.delays.intro')}</p>
              <ul className="mt-2 list-disc list-inside text-gray-600 ml-4 space-y-2">
                <li>{t('delivery-terms.delays.bullet1')}</li>
                <li>{t('delivery-terms.delays.bullet2')}</li>
                <li>{t('delivery-terms.delays.bullet3')}</li>
              </ul>
              <p className="mt-3 text-gray-600">{t('delivery-terms.delays.outro')}</p>
            </section>
          </Card>
        </div>
      </div>
    </div>
  );
}

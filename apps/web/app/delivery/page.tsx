'use client';

import { Card } from '@shop/ui';
import { useEffect, useState } from 'react';
import shippingData from '../../../../json/shipping.json';
import { useTranslation } from '../../lib/i18n-client';
import { getStoredLanguage } from '../../lib/language';
import { loadTranslation } from '../../lib/i18n';

export default function DeliveryPage() {
  const { t } = useTranslation();
  const [lang, setLang] = useState<'en' | 'ru' | 'am'>('en');
  const intro = t('delivery.intro');
  const sectionsList = t('delivery.sectionsList');
  const hasStructuredPolicy = Array.isArray(sectionsList);

  useEffect(() => {
    const language = typeof window !== 'undefined' ? localStorage.getItem('language') || 'en' : 'en';
    const mappedLang = language === 'hy' ? 'am' : (language === 'ka' ? 'en' : language); // Map 'hy' to 'am' for config
    setLang(mappedLang as 'en' | 'ru' | 'am');
  }, []);

  if (hasStructuredPolicy) {
    return (
      <div className="policy-page">
        <div className="policy-page-inner">
          <h1 className="text-4xl font-bold text-gray-900">{t('delivery.title')}</h1>

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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('delivery.title')}</h1>
      
      <div className="space-y-6">
        {/* Delivery Information */}
        <Card variant="default" className="p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">{t('delivery.deliveryInformation.title')}</h2>
          <div className="space-y-4 text-gray-700">
            {shippingData.methods.map((method) => {
              if (!method.enabled) return null;
              const methodName = method.name[lang as keyof typeof method.name] || method.name.en;
              const freeAbove = method.freeAbove ? new Intl.NumberFormat('hy-AM', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 0,
              }).format(method.freeAbove) : null;
              
              return (
                <div key={method.id}>
                  <h3 className="font-semibold text-gray-900 mb-2">{methodName}</h3>
                  <p className="text-gray-600">
                    {method.price === 0 ? (
                      t('delivery.deliveryInformation.freeDelivery')
                    ) : (
                      <>
                        {t('delivery.deliveryInformation.deliveryCost').replace('{price}', new Intl.NumberFormat('hy-AM', {
                          style: 'currency',
                          currency: 'USD',
                          minimumFractionDigits: 0,
                        }).format(method.price))}
                        {freeAbove && ` (${t('delivery.deliveryInformation.freeForOrdersAbove').replace('{amount}', freeAbove)})`}
                      </>
                    )}
                  </p>
                  {method.estimatedDays > 0 && (
                    <p className="text-sm text-gray-500 mt-1">
                      {t('delivery.deliveryInformation.estimatedDelivery')
                        .replace('{days}', method.estimatedDays.toString())
                        .replace('{daysText}', method.estimatedDays === 1 ? t('delivery.deliveryInformation.day') : t('delivery.deliveryInformation.days'))}
                    </p>
                  )}
                  {method.locations && method.locations.length > 0 && (
                    <div className="mt-2 text-sm text-gray-600">
                      <p className="font-medium mb-1">{t('delivery.deliveryInformation.pickupLocations')}</p>
                      <ul className="list-disc list-inside space-y-1">
                        {method.locations.map((location, idx) => (
                          <li key={idx}>
                            {location.name[lang as keyof typeof location.name] || location.name.en} - {location.address}
                            {location.workingHours && (
                              <span className="text-gray-500">
                                {' '}({location.workingHours[lang as keyof typeof location.workingHours] || location.workingHours.en})
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        {/* Return Policy */}
        <Card variant="default" className="p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">{t('delivery.returnPolicy.title')}</h2>
          <div className="space-y-4 text-gray-700">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">{t('delivery.returnPolicy.thirtyDayPolicy.title')}</h3>
              <p className="text-gray-600">
                {t('delivery.returnPolicy.thirtyDayPolicy.description')}
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">{t('delivery.returnPolicy.returnConditions.title')}</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                {(() => {
                  const lang = getStoredLanguage();
                  const deliveryData = loadTranslation(lang, 'delivery');
                  const items = deliveryData?.returnPolicy?.returnConditions?.items || [];
                  return Array.isArray(items) ? items.map((item: string, idx: number) => (
                    <li key={idx}>{item}</li>
                  )) : null;
                })()}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">{t('delivery.returnPolicy.howToReturn.title')}</h3>
              <ol className="list-decimal list-inside text-gray-600 space-y-1">
                {(() => {
                  const lang = getStoredLanguage();
                  const deliveryData = loadTranslation(lang, 'delivery');
                  const steps = deliveryData?.returnPolicy?.howToReturn?.steps || [];
                  return Array.isArray(steps) ? steps.map((step: string, idx: number) => (
                    <li key={idx}>{step}</li>
                  )) : null;
                })()}
              </ol>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">{t('delivery.returnPolicy.refundProcess.title')}</h3>
              <p className="text-gray-600">
                {t('delivery.returnPolicy.refundProcess.description')}
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">{t('delivery.returnPolicy.nonReturnableItems.title')}</h3>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                {(() => {
                  const lang = getStoredLanguage();
                  const deliveryData = loadTranslation(lang, 'delivery');
                  const items = deliveryData?.returnPolicy?.nonReturnableItems?.items || [];
                  return Array.isArray(items) ? items.map((item: string, idx: number) => (
                    <li key={idx}>{item}</li>
                  )) : null;
                })()}
              </ul>
            </div>
          </div>
        </Card>

        {/* Contact Information */}
        <Card variant="default" className="p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">{t('delivery.contact.title')}</h2>
          <p className="text-gray-600 mb-4">
            {t('delivery.contact.description')}
          </p>
          <div className="space-y-2 text-gray-700">
            <p>
              <span className="font-semibold">{t('delivery.contact.email')}</span>{' '}
              <a href="mailto:support@whiteshop.com" className="text-blue-600 hover:underline">
                support@whiteshop.com
              </a>
            </p>
            <p>
              <span className="font-semibold">{t('delivery.contact.phone')}</span>{' '}
              <a href="tel:+1234567890" className="text-blue-600 hover:underline">
                +1 (234) 567-890
              </a>
            </p>
            <p>
              <span className="font-semibold">{t('delivery.contact.hours')}</span> {t('delivery.contact.hoursValue')}
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}


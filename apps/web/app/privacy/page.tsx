'use client';

import { Card } from '@shop/ui';
import { useTranslation } from '../../lib/i18n-client';

/**
 * Privacy Policy page - displays privacy policy information
 */
export default function PrivacyPage() {
  const { t } = useTranslation();

  const sections = [
    {
      title: t('privacy.sections.collectedData.title'),
      intro: t('privacy.sections.collectedData.intro'),
      bullets: [
        t('privacy.sections.collectedData.bullets.contact'),
        t('privacy.sections.collectedData.bullets.purchase'),
        t('privacy.sections.collectedData.bullets.technical'),
        t('privacy.sections.collectedData.bullets.cookies'),
      ],
      outro: '',
    },
    {
      title: t('privacy.sections.dataUsage.title'),
      intro: t('privacy.sections.dataUsage.intro'),
      bullets: [
        t('privacy.sections.dataUsage.bullets.orders'),
        t('privacy.sections.dataUsage.bullets.support'),
        t('privacy.sections.dataUsage.bullets.improve'),
        t('privacy.sections.dataUsage.bullets.legal'),
      ],
      outro: '',
    },
    {
      title: t('privacy.sections.retention.title'),
      intro: t('privacy.sections.retention.intro'),
      bullets: [
        t('privacy.sections.retention.bullets.account'),
        t('privacy.sections.retention.bullets.history'),
        t('privacy.sections.retention.bullets.marketing'),
      ],
      outro: '',
    },
    {
      title: t('privacy.sections.security.title'),
      intro: t('privacy.sections.security.intro'),
      bullets: [
        t('privacy.sections.security.bullets.ssl'),
        t('privacy.sections.security.bullets.access'),
        t('privacy.sections.security.bullets.audits'),
      ],
      outro: '',
    },
    {
      title: t('privacy.sections.sharing.title'),
      intro: t('privacy.sections.sharing.intro'),
      bullets: [
        t('privacy.sections.sharing.bullets.shipping'),
        t('privacy.sections.sharing.bullets.payment'),
        t('privacy.sections.sharing.bullets.law'),
      ],
      outro: t('privacy.sections.sharing.outro'),
    },
    {
      title: t('privacy.sections.rights.title'),
      intro: t('privacy.sections.rights.intro'),
      bullets: [
        t('privacy.sections.rights.bullets.copy'),
        t('privacy.sections.rights.bullets.editDelete'),
        t('privacy.sections.rights.bullets.unsubscribe'),
        t('privacy.sections.rights.bullets.restrict'),
      ],
      outro: '',
    },
    {
      title: t('privacy.sections.cookies.title'),
      intro: t('privacy.sections.cookies.intro'),
      bullets: [
        t('privacy.sections.cookies.bullets.functional'),
        t('privacy.sections.cookies.bullets.analytics'),
        t('privacy.sections.cookies.bullets.marketing'),
      ],
      outro: t('privacy.sections.cookies.outro'),
    },
    {
      title: t('privacy.sections.changes.title'),
      intro: t('privacy.sections.changes.intro'),
      bullets: [],
      outro: '',
    },
  ];

  return (
    <div className="policy-page">
      <div className="policy-page-inner">
        <h1 className="text-4xl font-bold text-gray-900">{t('privacy.title')}</h1>
        <div className="mt-8">
          <Card className="p-6">
            <div className="space-y-8">
              <section className="space-y-3">
                <p className="text-gray-600">{t('privacy.intro.p1')}</p>
                <p className="text-gray-600">{t('privacy.intro.p2')}</p>
                <p className="text-gray-600">{t('privacy.intro.p3')}</p>
              </section>
              {sections.map((section) => (
                <section key={section.title} className="space-y-3">
                  <h2 className="text-2xl font-semibold text-gray-900">{section.title}</h2>
                  <p className="text-gray-600">{section.intro}</p>
                  {section.bullets.length > 0 ? (
                    <ul className="ml-4 list-disc list-inside text-gray-600 space-y-1">
                      {section.bullets.map((bullet) => (
                        <li key={bullet}>{bullet}</li>
                      ))}
                    </ul>
                  ) : null}
                  {section.outro ? <p className="text-gray-600">{section.outro}</p> : null}
                </section>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}


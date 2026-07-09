'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useTranslation } from '@/lib/i18n-client';
import { apiClient } from '@/lib/api-client';
import { CONTACT_MESSAGE_MAX_LENGTH } from '@/lib/constants/contact-form.constants';
import { CONTACT_MESSAGE_SOURCES } from '@/lib/constants/contact-message-source.constants';
import { sanitizeContactPhoneInput } from '@/lib/utils/contact-phone-input';
import {
  PERSONALIZE_COMMENT_INPUT_CLASS,
  PERSONALIZE_CONTENT_COLUMN_CLASS,
  PERSONALIZE_DESCRIPTION_CLASS,
  PERSONALIZE_DESCRIPTION_TEXT_CLASS,
  PERSONALIZE_FIELD_LABEL_CLASS,
  PERSONALIZE_FORM_CLASS,
  PERSONALIZE_GALLERY_GAP_CLASS,
  PERSONALIZE_GALLERY_IMAGES,
  PERSONALIZE_GALLERY_IMAGE_CLASS,
  PERSONALIZE_GALLERY_WRAPPER_CLASS,
  PERSONALIZE_PAGE_SHELL_CLASS,
  PERSONALIZE_SUBMIT_BUTTON_CLASS,
  PERSONALIZE_TITLE_CLASS,
  PERSONALIZE_TITLE_DESCRIPTION_GAP_CLASS,
  PERSONALIZE_UNDERLINE_INPUT_CLASS,
} from './constants';

interface PersonalizeFormData {
  name: string;
  email: string;
  phone: string;
  message: string;
}

const INITIAL_FORM_DATA: PersonalizeFormData = {
  name: '',
  email: '',
  phone: '',
  message: '',
};

export default function PersonalizePage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [formData, setFormData] = useState<PersonalizeFormData>(INITIAL_FORM_DATA);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    const nextValue =
      name === 'message' ? value.slice(0, CONTACT_MESSAGE_MAX_LENGTH) : value;

    setFormData((prev) => ({
      ...prev,
      [name]: nextValue,
    }));
  };

  const handlePhoneChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      phone: sanitizeContactPhoneInput(event.target.value),
    }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      await apiClient.post(
        '/api/v1/contact',
        {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          message: formData.message,
          source: CONTACT_MESSAGE_SOURCES.PERSONALIZE,
        },
        { skipAuth: true },
      );

      setFormData(INITIAL_FORM_DATA);
      alert(t('personalize.form.submitSuccess'));
      router.push('/');
    } catch (error: unknown) {
      const detail = error instanceof Error ? error.message : '';
      alert(
        detail
          ? `${t('personalize.form.submitError')}: ${detail}`
          : t('personalize.form.submitError'),
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[#efefef]" data-personalize-page>
      <div className={PERSONALIZE_PAGE_SHELL_CLASS}>
        <div className={PERSONALIZE_GALLERY_WRAPPER_CLASS}>
          <div className={`mx-auto flex w-max lg:mx-0 ${PERSONALIZE_GALLERY_GAP_CLASS}`}>
            {PERSONALIZE_GALLERY_IMAGES.map((image) => (
              <div key={image.src} className={PERSONALIZE_GALLERY_IMAGE_CLASS}>
                <Image
                  src={image.src}
                  alt={t(image.altKey)}
                  fill
                  sizes="(max-width: 1023px) 140px, clamp(140px, 14.17vw, 272px)"
                  className="object-cover"
                  priority
                />
              </div>
            ))}
          </div>
        </div>

        <div className={PERSONALIZE_CONTENT_COLUMN_CLASS}>
          <div className={PERSONALIZE_DESCRIPTION_CLASS}>
            <h1 className={PERSONALIZE_TITLE_CLASS}>{t('personalize.title')}</h1>
            <p className={`${PERSONALIZE_DESCRIPTION_TEXT_CLASS} ${PERSONALIZE_TITLE_DESCRIPTION_GAP_CLASS}`}>
              {t('personalize.description')}
            </p>
          </div>

          <form onSubmit={handleSubmit} className={PERSONALIZE_FORM_CLASS}>
            <div>
              <label htmlFor="personalize-name" className={PERSONALIZE_FIELD_LABEL_CLASS}>
                {t('personalize.form.name')}
              </label>
              <input
                id="personalize-name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder={t('personalize.form.namePlaceholder')}
                className={PERSONALIZE_UNDERLINE_INPUT_CLASS}
              />
            </div>

            <div>
              <label htmlFor="personalize-phone" className={PERSONALIZE_FIELD_LABEL_CLASS}>
                {t('personalize.form.phone')}
              </label>
              <input
                id="personalize-phone"
                name="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                required
                value={formData.phone}
                onChange={handlePhoneChange}
                placeholder={t('personalize.form.phonePlaceholder')}
                className={PERSONALIZE_UNDERLINE_INPUT_CLASS}
              />
            </div>

            <div>
              <label htmlFor="personalize-email" className={PERSONALIZE_FIELD_LABEL_CLASS}>
                {t('personalize.form.email')}
              </label>
              <input
                id="personalize-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder={t('personalize.form.emailPlaceholder')}
                className={PERSONALIZE_UNDERLINE_INPUT_CLASS}
              />
            </div>

            <div>
              <label htmlFor="personalize-message" className={PERSONALIZE_FIELD_LABEL_CLASS}>
                {t('personalize.form.comment')}
              </label>
              <textarea
                id="personalize-message"
                name="message"
                rows={1}
                maxLength={CONTACT_MESSAGE_MAX_LENGTH}
                value={formData.message}
                onChange={handleChange}
                placeholder={t('personalize.form.commentPlaceholder')}
                className={PERSONALIZE_COMMENT_INPUT_CLASS}
              />
            </div>

            <button type="submit" disabled={submitting} className={PERSONALIZE_SUBMIT_BUTTON_CLASS}>
              {submitting ? t('personalize.form.submitting') : t('personalize.form.submit')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

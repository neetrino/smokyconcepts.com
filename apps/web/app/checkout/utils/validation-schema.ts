import { z } from 'zod';
import { useTranslation } from '../../../lib/i18n-client';
import { PHONE_NUMBER_PATTERN } from '../../../lib/utils/phone-validation';
import type { CheckoutFormData } from '../types';

export function useCheckoutSchema() {
  const { t } = useTranslation();

  return z.object({
    firstName: z.string().min(1, t('checkout.errors.firstNameRequired')),
    lastName: z.string().min(1, t('checkout.errors.lastNameRequired')),
    email: z.string().email(t('checkout.errors.invalidEmail')).min(1, t('checkout.errors.emailRequired')),
    phone: z
      .string()
      .min(1, t('checkout.errors.phoneRequired'))
      .regex(PHONE_NUMBER_PATTERN, t('checkout.errors.invalidPhone')),
    shippingMethod: z.enum(['pickup', 'delivery'], {
      message: t('checkout.errors.selectShippingMethod'),
    }),
    paymentMethod: z.enum(['idram', 'arca', 'cash_on_delivery'], {
      message: t('checkout.errors.selectPaymentMethod'),
    }),
    shippingAddress: z.string().optional(),
    shippingCountry: z.string().optional(),
    shippingRegion: z.string().optional(),
    cardNumber: z.string().optional(),
    cardExpiry: z.string().optional(),
    cardCvv: z.string().optional(),
    cardHolderName: z.string().optional(),
    acceptedPrivacyPolicy: z.boolean().refine((value) => value === true, {
      message: t('checkout.errors.privacyPolicyRequired'),
    }),
  }).refine((data) => {
    if (data.shippingMethod === 'delivery') {
      return data.shippingAddress && data.shippingAddress.trim().length > 0;
    }
    return true;
  }, {
    message: t('checkout.errors.addressRequired'),
    path: ['shippingAddress'],
  }).refine((data) => {
    if (data.shippingMethod === 'delivery') {
      return data.shippingCountry && data.shippingCountry.trim().length > 0;
    }
    return true;
  }, {
    message: t('checkout.errors.countryRequired'),
    path: ['shippingCountry'],
  }).refine((data) => {
    if (data.shippingMethod === 'delivery') {
      return data.shippingRegion && data.shippingRegion.trim().length > 0;
    }
    return true;
  }, {
    message: t('checkout.errors.regionRequired'),
    path: ['shippingRegion'],
  });
}





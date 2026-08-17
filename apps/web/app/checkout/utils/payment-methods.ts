import { useTranslation } from '../../../lib/i18n-client';

export type PaymentMethodId = 'idram' | 'arca' | 'cash_on_delivery';

export interface PaymentMethod {
  id: PaymentMethodId;
  name: string;
  description: string;
  logo: string | null;
  /** When true, option is visible but not selectable (e.g. ArCa live not ready). */
  disabled?: boolean;
}

/** Flip to false when ArCa live credentials are available. */
const IS_ARCA_PAYMENT_ENABLED = false;

export function usePaymentMethods(): PaymentMethod[] {
  const { t } = useTranslation();

  return [
    {
      id: 'cash_on_delivery',
      name: t('checkout.payment.cashOnDelivery'),
      description: t('checkout.payment.cashOnDeliveryDescription'),
      logo: '/assets/payments/dollar.svg',
    },
    {
      id: 'idram',
      name: t('checkout.payment.idram'),
      description: t('checkout.payment.idramDescription'),
      logo: '/assets/payments/idram.svg',
    },
    {
      id: 'arca',
      name: t('checkout.payment.arca'),
      description: IS_ARCA_PAYMENT_ENABLED
        ? t('checkout.payment.arcaDescription')
        : t('checkout.payment.arcaUnavailable'),
      logo: '/assets/payments/arca.svg',
      disabled: !IS_ARCA_PAYMENT_ENABLED,
    },
  ];
}





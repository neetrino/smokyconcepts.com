'use client';

import { useTranslation } from '../../../lib/i18n-client';
import { PageLoadingOverlay } from '../../../components/loading/PageLoadingOverlay';

interface CheckoutPlacingOrderOverlayProps {
  visible: boolean;
}

/**
 * Full-screen overlay while checkout completes — same glass spinner as page loading.
 */
export function CheckoutPlacingOrderOverlay({ visible }: CheckoutPlacingOrderOverlayProps) {
  const { t } = useTranslation();
  const statusLabel = `${t('checkout.placingOrder.title')} ${t('checkout.placingOrder.subtitle')}`;

  return <PageLoadingOverlay visible={visible} label={statusLabel} />;
}

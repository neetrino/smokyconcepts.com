import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '../../../lib/api-client';
import { useTranslation } from '../../../lib/i18n-client';
import type { UserCoupon } from '../types';

interface UseCouponsProps {
  isLoggedIn: boolean;
  authLoading: boolean;
  activeTab: string;
  onError: (error: string) => void;
}

export function useCoupons({ isLoggedIn, authLoading, activeTab, onError }: UseCouponsProps) {
  const { t } = useTranslation();
  const [coupons, setCoupons] = useState<UserCoupon[]>([]);
  const [couponsLoading, setCouponsLoading] = useState(false);

  const loadCoupons = useCallback(async () => {
    try {
      setCouponsLoading(true);
      onError('');
      const response = await apiClient.get<{ data: UserCoupon[] }>('/api/v1/users/coupons');
      setCoupons(Array.isArray(response.data) ? response.data : []);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      onError(errorMessage || t('profile.coupons.loadError'));
      setCoupons([]);
    } finally {
      setCouponsLoading(false);
    }
  }, [onError, t]);

  useEffect(() => {
    if (isLoggedIn && !authLoading && activeTab === 'coupons') {
      void loadCoupons();
    }
  }, [isLoggedIn, authLoading, activeTab, loadCoupons]);

  return {
    coupons,
    couponsLoading,
  };
}

'use client';

import { Card } from '@shop/ui';
import { useRouter } from 'next/navigation';
import { ADMIN_PRICE_CURRENCY } from '@/lib/currency';
import { useTranslation } from '../../../lib/i18n-client';
import { formatCurrency } from '../utils/dashboardUtils';

interface Stats {
  users: { total: number };
  products: { total: number; lowStock: number };
  orders: { total: number; recent: number; pending: number };
  revenue: { total: number; currency: string };
}

interface StatsGridProps {
  stats: Stats | null;
  statsLoading: boolean;
}

export function StatsGrid({ stats, statsLoading }: StatsGridProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const cardClassName =
    'border border-[#dcc090]/30 bg-white/90 p-6 cursor-pointer shadow-[0_8px_30px_rgba(18,42,38,0.06)] transition-all duration-200 hover:-translate-y-1 hover:border-[#dcc090] hover:shadow-[0_14px_34px_rgba(18,42,38,0.12)]';
  const labelClassName = 'text-sm font-semibold uppercase tracking-[0.08em] text-[#414141]/70';
  const valueClassName = 'mt-1 text-2xl font-black text-[#122a26]';
  const iconWrapClassName = 'flex h-12 w-12 items-center justify-center rounded-full bg-[#122a26] text-[#dcc090]';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card
        className={cardClassName}
        onClick={() => router.push('/supersudo/users')}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className={labelClassName}>{t('admin.dashboard.totalUsers')}</p>
            {statsLoading ? (
              <div className="mt-2 h-8 w-16 animate-pulse rounded bg-[#dcc090]/30"></div>
            ) : (
              <p className={valueClassName}>
                {stats?.users.total ?? 0}
              </p>
            )}
          </div>
          <div className={iconWrapClassName}>
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
        </div>
      </Card>

      <Card
        className={cardClassName}
        onClick={() => router.push('/supersudo/products')}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className={labelClassName}>{t('admin.dashboard.totalProducts')}</p>
            {statsLoading ? (
              <div className="mt-2 h-8 w-16 animate-pulse rounded bg-[#dcc090]/30"></div>
            ) : (
              <p className={valueClassName}>
                {stats?.products.total ?? 0}
              </p>
            )}
          </div>
          <div className={iconWrapClassName}>
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
        </div>
      </Card>

      <Card
        className={cardClassName}
        onClick={() => router.push('/supersudo/orders')}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className={labelClassName}>{t('admin.dashboard.totalOrders')}</p>
            {statsLoading ? (
              <div className="mt-2 h-8 w-16 animate-pulse rounded bg-[#dcc090]/30"></div>
            ) : (
              <p className={valueClassName}>
                {stats?.orders.total ?? 0}
              </p>
            )}
          </div>
          <div className={iconWrapClassName}>
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
        </div>
      </Card>

      <Card
        className={cardClassName}
        onClick={() => router.push('/supersudo/orders?filter=paid')}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className={labelClassName}>{t('admin.dashboard.revenue')}</p>
            {statsLoading ? (
              <div className="mt-2 h-8 w-24 animate-pulse rounded bg-[#dcc090]/30"></div>
            ) : (
              <p className={valueClassName}>
                {stats ? formatCurrency(stats.revenue.total, stats.revenue.currency) : formatCurrency(0, ADMIN_PRICE_CURRENCY)}
              </p>
            )}
          </div>
          <div className={iconWrapClassName}>
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </Card>
    </div>
  );
}


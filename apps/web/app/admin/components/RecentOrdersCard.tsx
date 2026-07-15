'use client';

import { Card, Button } from '@shop/ui';
import { useRouter } from 'next/navigation';
import { useTranslation } from '../../../lib/i18n-client';
import { useCurrencyRatesReady } from '../../../components/hooks/useCurrency';
import { ADMIN_PRICE_CURRENCY, type CurrencyCode } from '../../../lib/currency';
import {
  formatOrderListShippingDisplay,
  formatOrderListTotalDisplay,
} from '@/lib/orders/order-summary-display';
import { AdminNewBadge } from './AdminNewBadge';
import { useAdminLastSeen } from '../hooks/useAdminLastSeen';
import { getAdminNewBadgeLabel } from '../utils/adminNewBadgeLabel';
import { formatDate } from '../utils/dashboardUtils';

interface RecentOrder {
  id: string;
  number: string;
  status: string;
  paymentStatus: string;
  total: number;
  subtotal?: number;
  discountAmount?: number;
  shippingAmount?: number;
  taxAmount?: number;
  collectionPriceAmount?: number;
  currency: string;
  shippingPriceAmd?: number | null;
  summaryLines?: Array<{
    price: number;
    quantity: number;
    sizeCatalogCategoryPriceAmd?: number | null;
    variantBasePriceAmd?: number | null;
  }>;
  customerEmail?: string;
  customerPhone?: string;
  itemsCount: number;
  createdAt: string;
}

interface RecentOrdersCardProps {
  recentOrders: RecentOrder[];
  recentOrdersLoading: boolean;
}

export function RecentOrdersCard({ recentOrders, recentOrdersLoading }: RecentOrdersCardProps) {
  const { t } = useTranslation();
  const router = useRouter();
  useCurrencyRatesReady();
  const displayCurrency = ADMIN_PRICE_CURRENCY as CurrencyCode;
  const { isNew: isOrderNew } = useAdminLastSeen('orders');
  const newBadgeLabel = getAdminNewBadgeLabel(t);

  return (
    <Card className="border border-[#dcc090]/30 bg-white/90 p-6 shadow-[0_8px_30px_rgba(18,42,38,0.06)]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-black text-[#414141]">{t('admin.dashboard.recentOrders')}</h2>
        <Button
          variant="ghost"
          size="sm"
          className="text-[#122a26] hover:bg-[#dcc090]/15 hover:text-[#122a26]"
          onClick={() => router.push('/supersudo/orders')}
        >
          {t('admin.dashboard.viewAll')}
        </Button>
      </div>
      <div className="space-y-4">
        {recentOrdersLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 rounded bg-[#dcc090]/30" />
              </div>
            ))}
          </div>
        ) : recentOrders.length === 0 ? (
          <div className="py-8 text-center text-sm text-[#414141]/70">
            <p>{t('admin.dashboard.noRecentOrders')}</p>
          </div>
        ) : (
          recentOrders.map((order) => {
            const shippingDisplay = formatOrderListShippingDisplay(order, displayCurrency);
            return (
              <div
                key={order.id}
                className="cursor-pointer rounded-lg border border-[#dcc090]/25 bg-white/70 p-4 transition-colors hover:border-[#dcc090] hover:bg-[#dcc090]/10"
                onClick={() => router.push(`/supersudo/orders?search=${order.number}`)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <p className="text-sm font-bold text-[#122a26]">#{order.number}</p>
                      {isOrderNew(order.createdAt) ? <AdminNewBadge label={newBadgeLabel} /> : null}
                      <span
                        className={`px-2 py-0.5 text-xs rounded-full ${
                          order.paymentStatus === 'paid'
                            ? 'bg-[#122a26] text-[#dcc090]'
                            : order.paymentStatus === 'pending'
                              ? 'bg-[#dcc090]/35 text-[#122a26]'
                              : 'bg-[#414141]/10 text-[#414141]'
                        }`}
                      >
                        {order.paymentStatus}
                      </span>
                    </div>
                    <p className="text-xs text-[#414141]/75">
                      {order.customerEmail || order.customerPhone || t('admin.dashboard.guest')}
                    </p>
                    <p className="mt-1 text-xs text-[#414141]/55">
                      {order.itemsCount === 1
                        ? t('admin.dashboard.items').replace('{count}', order.itemsCount.toString())
                        : t('admin.dashboard.itemsPlural').replace('{count}', order.itemsCount.toString())}{' '}
                      • {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-[#122a26]">
                      {formatOrderListTotalDisplay(order, displayCurrency)}
                    </p>
                    {shippingDisplay ? (
                      <p className="mt-1 text-xs text-[#414141]/55">
                        {t('orders.orderSummary.shipping')}: {shippingDisplay}
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}

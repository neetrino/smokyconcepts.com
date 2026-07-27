import { useState, useEffect, useCallback, type MouseEvent } from 'react';
import { useRouter } from 'next/navigation';
import { dispatchCartDrawerOpen } from '../../cart/constants';
import { apiClient } from '../../../lib/api-client';
import { useTranslation } from '../../../lib/i18n-client';
import { logger } from '../../../lib/services/utils/logger';
import { addOrderItemToGuestCart } from '../utils/reorder-to-cart';
import type { OrderDetails, OrderListItem, ProfileTab } from '../types';

interface OrdersMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface UseOrdersProps {
  isLoggedIn: boolean;
  authLoading: boolean;
  activeTab: ProfileTab;
  onError: (error: string) => void;
  onSuccess: (message: string) => void;
}

export function useOrders({
  isLoggedIn,
  authLoading,
  activeTab,
  onError,
  onSuccess,
}: UseOrdersProps) {
  const router = useRouter();
  const { t } = useTranslation();
  
  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersPage, setOrdersPage] = useState(1);
  const [ordersMeta, setOrdersMeta] = useState<OrdersMeta | null>(null);

  // Order Details Modal
  const [selectedOrder, setSelectedOrder] = useState<OrderDetails | null>(null);
  const [orderDetailsLoading, setOrderDetailsLoading] = useState(false);
  const [orderDetailsError, setOrderDetailsError] = useState<string | null>(null);
  const [isReordering, setIsReordering] = useState(false);

  // Lock body scroll when order modal is open (loading, error, or loaded)
  useEffect(() => {
    const isModalOpen = orderDetailsLoading || orderDetailsError !== null || selectedOrder !== null;
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedOrder, orderDetailsLoading, orderDetailsError]);

  const loadOrders = useCallback(async () => {
    try {
      setOrdersLoading(true);
      onError('');
      const response = await apiClient.get<{
        data: OrderListItem[];
        meta: OrdersMeta;
      }>('/api/v1/orders', {
        params: {
          page: ordersPage.toString(),
          limit: '20',
        },
      });
      setOrders(response.data || []);
      setOrdersMeta(response.meta || null);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error('Error loading orders:', err);
      onError(errorMessage || t('profile.orders.failedToLoad'));
    } finally {
      setOrdersLoading(false);
    }
  }, [ordersPage, t, onError]);

  // Load orders when orders tab is active
  useEffect(() => {
    if (isLoggedIn && !authLoading && activeTab === 'orders') {
      loadOrders();
    }
  }, [isLoggedIn, authLoading, activeTab, loadOrders]);

  const closeOrderDetails = useCallback(() => {
    setSelectedOrder(null);
    setOrderDetailsError(null);
    setOrderDetailsLoading(false);
  }, []);

  const loadOrderDetails = async (orderNumber: string) => {
    try {
      setOrderDetailsLoading(true);
      setOrderDetailsError(null);
      setSelectedOrder(null);
      const data = await apiClient.get<OrderDetails>(`/api/v1/orders/${orderNumber}`);
      setSelectedOrder(data);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error('Error loading order details:', err);
      setSelectedOrder(null);
      setOrderDetailsError(errorMessage || t('profile.orderDetails.failedToLoad'));
    } finally {
      setOrderDetailsLoading(false);
    }
  };

  const handleOrderClick = (orderNumber: string, e: MouseEvent<HTMLAnchorElement>) => {
    if (window.innerWidth >= 1024) {
      e.preventDefault();
      loadOrderDetails(orderNumber);
    }
  };

  const handleReOrder = async () => {
    if (!selectedOrder || !isLoggedIn) {
      router.push('/login?redirect=/profile?tab=orders');
      return;
    }

    setIsReordering(true);
    try {
      let addedCount = 0;
      let skippedCount = 0;

      for (const item of selectedOrder.items) {
        try {
          const added = await addOrderItemToGuestCart(item);
          if (added) {
            addedCount++;
          } else {
            skippedCount++;
          }
        } catch (error: unknown) {
          logger.error('Error adding reorder item to cart', {
            error,
            variantId: item.variantId,
            productTitle: item.productTitle,
          });
          skippedCount++;
        }
      }

      if (addedCount > 0) {
        const skippedText = skippedCount > 0 ? `, ${skippedCount} ${t('profile.orderDetails.skipped')}` : '';
        onSuccess(`${addedCount} ${t('profile.orderDetails.itemsAdded')}${skippedText}`);
        setTimeout(() => {
          dispatchCartDrawerOpen();
        }, 1500);
      } else {
        onError(t('profile.orderDetails.failedToAdd'));
      }
    } catch (error: unknown) {
      logger.error('Error during reorder', { error, orderNumber: selectedOrder.number });
      onError(t('profile.orderDetails.failedToAdd'));
    } finally {
      setIsReordering(false);
    }
  };

  return {
    orders,
    ordersLoading,
    ordersPage,
    setOrdersPage,
    ordersMeta,
    selectedOrder,
    setSelectedOrder,
    orderDetailsLoading,
    orderDetailsError,
    isReordering,
    handleOrderClick,
    handleReOrder,
    closeOrderDetails,
  };
}


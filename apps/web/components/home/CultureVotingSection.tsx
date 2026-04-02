'use client';

import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '../../lib/auth/AuthContext';
import { apiClient } from '../../lib/api-client';
import { showToast } from '../Toast';
import { useTranslation } from '@/lib/i18n-client';

import { CultureVotingCard } from './CultureVotingCard';
import { HomeSectionTitle } from './HomeSectionTitle';

interface VotingItem {
  id: string;
  title: string;
  imageUrl: string;
  likeCount: number;
  likedByCurrentUser: boolean;
}

interface VotingResponse {
  data: VotingItem[];
}

interface VotingLikeResponse {
  data: {
    itemId: string;
    likeCount: number;
    likedByCurrentUser: boolean;
  };
}

export function CultureVotingSection() {
  const { t } = useTranslation();
  const { isLoggedIn } = useAuth();
  const [items, setItems] = useState<VotingItem[]>([]);
  const [earlyAccessItemId, setEarlyAccessItemId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingItemId, setPendingItemId] = useState<string | null>(null);

  const fetchVotingItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get<VotingResponse>('/api/v1/voting');
      setItems(Array.isArray(response.data) ? response.data : []);
    } catch {
      setError('load_error');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVotingItems().catch(() => undefined);
  }, [fetchVotingItems]);

  useEffect(() => {
    if (items.length === 0) {
      setEarlyAccessItemId(null);
      return;
    }

    const likedItem = items.find((item) => item.likedByCurrentUser);

    if (!earlyAccessItemId || !items.some((item) => item.id === earlyAccessItemId)) {
      setEarlyAccessItemId(likedItem?.id ?? items[0]?.id ?? null);
      return;
    }

    const activeEarlyAccessItem = items.find((item) => item.id === earlyAccessItemId);
    if (activeEarlyAccessItem && !activeEarlyAccessItem.likedByCurrentUser && likedItem) {
      setEarlyAccessItemId(likedItem.id);
    }
  }, [items, earlyAccessItemId]);

  const handleToggleLike = useCallback(
    async (itemId: string, likedByCurrentUser: boolean) => {
      if (pendingItemId) {
        return;
      }

      if (!isLoggedIn) {
        let nextEarlyAccessItemId: string | null = null;
        setItems((currentItems) => {
          const currentlyLikedItem = currentItems.find((item) => item.likedByCurrentUser);
          const updatedItems = currentItems.map((item) => {
            if (item.id === itemId) {
              const nextLikedState = !likedByCurrentUser;
              return {
                ...item,
                likedByCurrentUser: nextLikedState,
                likeCount: Math.max(0, item.likeCount + (nextLikedState ? 1 : -1)),
              };
            }

            if (item.id === currentlyLikedItem?.id && item.id !== itemId) {
              return {
                ...item,
                likedByCurrentUser: false,
                likeCount: Math.max(0, item.likeCount - 1),
              };
            }

            return item;
          });

          const activeLikedItem = updatedItems.find((item) => item.likedByCurrentUser);
          nextEarlyAccessItemId = activeLikedItem?.id ?? updatedItems[0]?.id ?? null;
          return updatedItems;
        });
        setEarlyAccessItemId(nextEarlyAccessItemId);
        return;
      }

      try {
        setPendingItemId(itemId);
        const updatesByItemId = new Map<string, VotingLikeResponse['data']>();

        if (likedByCurrentUser) {
          const unlikeResponse = await apiClient.delete<VotingLikeResponse>(`/api/v1/voting/${itemId}/like`);
          updatesByItemId.set(itemId, unlikeResponse.data);
        } else {
          const previouslyLikedItem = items.find((item) => item.likedByCurrentUser && item.id !== itemId);
          if (previouslyLikedItem) {
            const previousUnlikeResponse = await apiClient.delete<VotingLikeResponse>(
              `/api/v1/voting/${previouslyLikedItem.id}/like`,
            );
            updatesByItemId.set(previouslyLikedItem.id, previousUnlikeResponse.data);
          }

          const likeResponse = await apiClient.post<VotingLikeResponse>(`/api/v1/voting/${itemId}/like`);
          updatesByItemId.set(itemId, likeResponse.data);
        }

        let nextEarlyAccessItemId: string | null | undefined;
        setItems((currentItems) => {
          const updatedItems = currentItems.map((item) =>
            updatesByItemId.has(item.id)
              ? {
                  ...item,
                  likeCount: updatesByItemId.get(item.id)?.likeCount ?? item.likeCount,
                  likedByCurrentUser: updatesByItemId.get(item.id)?.likedByCurrentUser ?? item.likedByCurrentUser,
                }
              : item,
          );

          const selectedItemUpdate = updatesByItemId.get(itemId);
          if (selectedItemUpdate?.likedByCurrentUser) {
            nextEarlyAccessItemId = itemId;
          } else if (earlyAccessItemId === itemId) {
            const fallbackLikedItem = updatedItems.find((item) => item.likedByCurrentUser);
            nextEarlyAccessItemId = fallbackLikedItem?.id ?? updatedItems[0]?.id ?? null;
          }

          return updatedItems;
        });

        if (nextEarlyAccessItemId !== undefined) {
          setEarlyAccessItemId(nextEarlyAccessItemId);
        }
      } catch {
        showToast(t('home.homepage.culture.updateError'), 'error');
      } finally {
        setPendingItemId(null);
      }
    },
    [pendingItemId, isLoggedIn, t, items, earlyAccessItemId],
  );

  if (error) {
    return (
      <section className="flex flex-col gap-10">
        <div className="flex min-h-[4rem] items-center justify-center">
          <div className="w-full max-w-[52rem] px-4 pb-1 text-center sm:pb-2">
            <HomeSectionTitle
              title={t('home.homepage.culture.title')}
              description={t('home.homepage.culture.description')}
              centered
            />
          </div>
        </div>
        <div className="flex items-center justify-center gap-4 py-8">
          <p className="text-[#414141]">{error === 'load_error' ? t('home.homepage.culture.loadError') : error}</p>
          <button
            type="button"
            onClick={() => fetchVotingItems()}
            className="rounded-lg border-2 border-[#122a26] px-4 py-2 text-sm font-medium text-[#122a26] hover:bg-[#122a26]/5"
          >
            {t('home.homepage.common.retry')}
          </button>
        </div>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="flex flex-col gap-10">
        <div className="flex min-h-[4rem] items-center justify-center">
          <div className="w-full max-w-[52rem] px-4 pb-1 text-center sm:pb-2">
            <HomeSectionTitle
              title={t('home.homepage.culture.title')}
              description={t('home.homepage.culture.description')}
              centered
            />
          </div>
        </div>
        <div className="mx-auto w-full max-w-[80rem] px-4">
          <div className="grid grid-cols-1 gap-x-4 gap-y-10 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-80 w-full animate-pulse rounded-3xl bg-white/60" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <section className="flex flex-col gap-10 overflow-visible pb-10 sm:pb-6">
      <div className="flex min-h-[4rem] items-center justify-center">
        <div className="w-full max-w-[52rem] px-4 pb-1 text-center sm:pb-2">
          <HomeSectionTitle
            title={t('home.homepage.culture.title')}
            description={t('home.homepage.culture.description')}
            centered
          />
        </div>
      </div>
      <div className="mx-auto w-full max-w-[24rem] px-4 sm:max-w-[80rem]">
        <div className="mx-auto grid grid-cols-2 justify-items-center gap-x-3 gap-y-10 sm:grid-cols-3 sm:gap-x-4 sm:gap-y-10 lg:max-w-[52rem] lg:grid-cols-3 lg:[grid-template-columns:repeat(3,minmax(10rem,1fr))]">
          {items.map((item, index) => {
            const sizeLabel =
              index === 0 || index === 2
                ? t('home.homepage.culture.labels.kingSize')
                : index === 1
                  ? t('home.homepage.culture.labels.compact')
                  : undefined;
            const variantLabel =
              index === 0
                ? t('home.homepage.culture.labels.special')
                : index === 1
                  ? t('home.homepage.culture.labels.classic')
                  : index === 2
                    ? t('home.homepage.culture.labels.atelier')
                    : undefined;
            const showEarlyAccess = item.id === earlyAccessItemId;
            return (
              <div
                key={item.id}
                className={`w-full ${index === 1 ? 'lg:mt-8' : ''} ${
                  index % 3 === 2 ? 'col-span-2 flex justify-center sm:col-span-1 sm:block' : ''
                }`}
              >
                <CultureVotingCard
                  id={item.id}
                  title={item.title}
                  imageUrl={item.imageUrl}
                  likeCount={item.likeCount}
                  likedByCurrentUser={item.likedByCurrentUser}
                  pending={pendingItemId === item.id}
                  onToggleLike={handleToggleLike}
                  mobileLikeInside={item.likedByCurrentUser}
                  mobileCompactBack={index === 1}
                  sizeLabel={sizeLabel}
                  variantLabel={variantLabel}
                  showEarlyAccess={showEarlyAccess}
                  earlyAccessLabel={t('home.homepage.culture.labels.earlyAccess')}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

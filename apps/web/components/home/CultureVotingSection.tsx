'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import { useAuth } from '../../lib/auth/AuthContext';
import { apiClient } from '../../lib/api-client';
import { showToast } from '../Toast';
import { useTranslation } from '@/lib/i18n-client';

import { addCultureEarlyAccessLine } from './cultureEarlyAccessToCheckout';
import { CultureVotingCard } from './CultureVotingCard';
import { HomeSectionTitle } from './HomeSectionTitle';

interface VotingItem {
  id: string;
  title: string;
  imageUrl: string;
  images?: string[];
  productSlug?: string | null;
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

function applyOptimisticLike(
  currentItems: VotingItem[],
  itemId: string,
  nextLikedState: boolean,
): VotingItem[] {
  return currentItems.map((item) => {
    if (item.id === itemId) {
      return {
        ...item,
        likedByCurrentUser: nextLikedState,
        likeCount: Math.max(0, item.likeCount + (nextLikedState ? 1 : -1)),
      };
    }

    if (nextLikedState && item.likedByCurrentUser) {
      return {
        ...item,
        likedByCurrentUser: false,
        likeCount: Math.max(0, item.likeCount - 1),
      };
    }

    return item;
  });
}

const CULTURE_SECTION_TITLE_CLASS_NAME =
  'text-[2.125rem] font-extrabold leading-[1.235] tracking-normal sm:text-[2.1rem] sm:font-black sm:leading-[1.06] sm:tracking-[-0.01em]';
const CULTURE_SECTION_COPY_CLASS_NAME =
  'gap-[1.75rem] sm:gap-3 [&_p]:max-w-[24.125rem] [&_p]:text-base [&_p]:font-medium [&_p]:leading-[1.375] sm:[&_p]:max-w-[38rem] sm:[&_p]:text-[0.95rem] sm:[&_p]:font-semibold sm:[&_p]:leading-[1.42]';
/** Top-row cards: fill the grid column (width comes from reduced mobile padding/gap). */
const CULTURE_MOBILE_CARD_WRAPPER_CLASS_NAME =
  'max-sm:w-full max-sm:max-w-none max-sm:translate-y-3';
/** Bottom-row card: centered, can use full two-column span. */
const CULTURE_MOBILE_BOTTOM_CARD_WRAPPER_CLASS_NAME =
  'max-sm:mx-auto max-sm:w-full max-sm:max-w-[12rem]';
/** Extra space before the bottom-row card so hero overflow does not overlap the row above. */
const CULTURE_MOBILE_BOTTOM_ROW_CARD_CLASS_NAME = 'max-sm:mt-10';
const CULTURE_MOBILE_GRID_CLASS_NAME =
  'grid-cols-2 items-stretch justify-items-center gap-x-4 gap-y-7 max-sm:justify-items-stretch max-sm:gap-x-5 max-sm:gap-y-12 sm:grid-cols-3 sm:justify-items-center sm:gap-x-5 sm:gap-y-7';
/**
 * Full viewport bleed on mobile — escapes home `px-5` on both left and right
 * (`overflow-x-hidden` clips `-mx` alone; `w-screen` + centering fixes the right edge too).
 */
const CULTURE_MOBILE_BLEED_WRAPPER_CLASS_NAME =
  'flex w-full flex-col gap-10 max-sm:relative max-sm:left-1/2 max-sm:w-screen max-sm:-translate-x-1/2 max-sm:px-4 sm:static sm:left-auto sm:w-full sm:translate-x-0';
const CULTURE_MOBILE_GRID_CONTAINER_CLASS_NAME =
  'mx-auto w-full max-w-[30rem] pt-[0.5rem] max-sm:pt-[5.125rem] sm:max-w-[46rem] sm:pt-3';
const CULTURE_MOBILE_TITLE_CONTAINER_CLASS_NAME = 'w-full max-w-[52rem] pb-1 text-center sm:pb-2';

function getCultureVotingDisplayRank(item: VotingItem): number {
  const normalizedTitle = item.title.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

  if (normalizedTitle.includes('forest') || normalizedTitle.includes('green')) {
    return 0;
  }

  if (normalizedTitle.includes('red') || normalizedTitle.includes('black a')) {
    return 1;
  }

  if (normalizedTitle === 'black' || normalizedTitle.includes('mystique')) {
    return 2;
  }

  return 3;
}

function sortCultureVotingItems(items: VotingItem[]): VotingItem[] {
  return [...items].sort((firstItem, secondItem) => {
    const rankDifference = getCultureVotingDisplayRank(firstItem) - getCultureVotingDisplayRank(secondItem);
    return rankDifference || items.indexOf(firstItem) - items.indexOf(secondItem);
  });
}

export function CultureVotingSection() {
  const { t } = useTranslation();
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const [items, setItems] = useState<VotingItem[]>([]);
  const [earlyAccessItemId, setEarlyAccessItemId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingItemId, setPendingItemId] = useState<string | null>(null);
  const [earlyAccessPendingId, setEarlyAccessPendingId] = useState<string | null>(null);
  const displayItems = useMemo(() => sortCultureVotingItems(items), [items]);

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
    if (displayItems.length === 0) {
      setEarlyAccessItemId(null);
      return;
    }

    const likedItem = displayItems.find((item) => item.likedByCurrentUser);

    if (!likedItem) {
      setEarlyAccessItemId(null);
      return;
    }

    if (!earlyAccessItemId || !displayItems.some((item) => item.id === earlyAccessItemId)) {
      setEarlyAccessItemId(likedItem.id);
      return;
    }

    const activeEarlyAccessItem = displayItems.find((item) => item.id === earlyAccessItemId);
    if (activeEarlyAccessItem && !activeEarlyAccessItem.likedByCurrentUser) {
      setEarlyAccessItemId(likedItem.id);
    }
  }, [displayItems, earlyAccessItemId]);

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

          const sortedUpdatedItems = sortCultureVotingItems(updatedItems);
          const activeLikedItem = sortedUpdatedItems.find((item) => item.likedByCurrentUser);
          const toggledItem = updatedItems.find((item) => item.id === itemId);
          nextEarlyAccessItemId =
            toggledItem?.likedByCurrentUser ? itemId : activeLikedItem?.id ?? null;
          return updatedItems;
        });
        setEarlyAccessItemId(nextEarlyAccessItemId);
        return;
      }

      const previousItems = items;
      const previousEarlyAccessItemId = earlyAccessItemId;

      try {
        setPendingItemId(itemId);
        const nextLikedState = !likedByCurrentUser;
        const optimisticItems = applyOptimisticLike(items, itemId, nextLikedState);
        const sortedOptimisticItems = sortCultureVotingItems(optimisticItems);
        setItems(optimisticItems);
        setEarlyAccessItemId(
          nextLikedState
            ? itemId
            : sortedOptimisticItems.find((item) => item.likedByCurrentUser)?.id ?? null,
        );

        const updatesByItemId = new Map<string, VotingLikeResponse['data']>();

        if (!nextLikedState) {
          const unlikeResponse = await apiClient.delete<VotingLikeResponse>(`/api/v1/voting/${itemId}/like`);
          updatesByItemId.set(itemId, unlikeResponse.data);
        } else {
          const previouslyLikedItem = previousItems.find(
            (item) => item.likedByCurrentUser && item.id !== itemId,
          );
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
            const sortedUpdatedItems = sortCultureVotingItems(updatedItems);
            const fallbackLikedItem = sortedUpdatedItems.find((item) => item.likedByCurrentUser);
            nextEarlyAccessItemId = fallbackLikedItem?.id ?? null;
          }

          return updatedItems;
        });

        if (nextEarlyAccessItemId !== undefined) {
          setEarlyAccessItemId(nextEarlyAccessItemId);
        }
      } catch {
        setItems(previousItems);
        setEarlyAccessItemId(previousEarlyAccessItemId);
        showToast(t('home.homepage.culture.updateError'), 'error');
      } finally {
        setPendingItemId(null);
      }
    },
    [pendingItemId, isLoggedIn, t, items, earlyAccessItemId],
  );

  const handleEarlyAccessCheckout = useCallback(
    async (itemId: string) => {
      const item = items.find((row) => row.id === itemId);
      const slug = item?.productSlug?.trim();
      if (!slug) {
        showToast(t('home.homepage.culture.earlyAccessNoProduct'), 'warning');
        return;
      }
      setEarlyAccessPendingId(itemId);
      try {
        const result = await addCultureEarlyAccessLine(slug);
        if (!result.ok) {
          showToast(t(result.messageKey), 'error');
          return;
        }
        router.push('/checkout');
      } finally {
        setEarlyAccessPendingId(null);
      }
    },
    [items, router, t],
  );

  if (error) {
    return (
      <section className="flex flex-col gap-10">
        <div className="flex min-h-[4rem] items-center justify-center">
          <div className="w-full max-w-[52rem] px-4 pb-1 text-center sm:pb-2 md:-translate-y-5">
            <HomeSectionTitle
              title={t('home.homepage.culture.title')}
              titleMobile={t('home.homepage.culture.titleMobile')}
              description={t('home.homepage.culture.description')}
              descriptionMobile={t('home.homepage.culture.descriptionMobile')}
              centered
              className={CULTURE_SECTION_COPY_CLASS_NAME}
              titleClassName={CULTURE_SECTION_TITLE_CLASS_NAME}
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
          <div className="w-full max-w-[52rem] px-4 pb-1 text-center sm:pb-2 md:-translate-y-5">
            <HomeSectionTitle
              title={t('home.homepage.culture.title')}
              titleMobile={t('home.homepage.culture.titleMobile')}
              description={t('home.homepage.culture.description')}
              descriptionMobile={t('home.homepage.culture.descriptionMobile')}
              centered
              className={CULTURE_SECTION_COPY_CLASS_NAME}
              titleClassName={CULTURE_SECTION_TITLE_CLASS_NAME}
            />
          </div>
        </div>
        <div className="mx-auto w-full max-w-[80rem] px-4">
          <div className="grid grid-cols-1 gap-x-8 gap-y-10 sm:grid-cols-3 sm:gap-x-10 lg:gap-x-12">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-80 w-full animate-pulse rounded-3xl bg-white/60" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (displayItems.length === 0) {
    return null;
  }

  return (
    <section className="overflow-visible pb-10 sm:pb-6">
      <div className={CULTURE_MOBILE_BLEED_WRAPPER_CLASS_NAME}>
        <div className="flex min-h-[4rem] items-center justify-center">
        <div className={`${CULTURE_MOBILE_TITLE_CONTAINER_CLASS_NAME} md:-translate-y-5`}>
          <HomeSectionTitle
            title={t('home.homepage.culture.title')}
            titleMobile={t('home.homepage.culture.titleMobile')}
            description={t('home.homepage.culture.description')}
            descriptionMobile={t('home.homepage.culture.descriptionMobile')}
            centered
            className={CULTURE_SECTION_COPY_CLASS_NAME}
            titleClassName={CULTURE_SECTION_TITLE_CLASS_NAME}
          />
        </div>
      </div>
      <div className={CULTURE_MOBILE_GRID_CONTAINER_CLASS_NAME}>
        <div
          className={`mx-auto grid lg:max-w-[44rem] lg:[grid-template-columns:repeat(3,minmax(0,1fr))] ${CULTURE_MOBILE_GRID_CLASS_NAME}`}
        >
          {displayItems.map((item, index) => {
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
            const variantTone = index === 0 ? 'special' : index === 2 ? 'atelier' : 'classic';
            const showEarlyAccess = item.id === earlyAccessItemId && item.likedByCurrentUser;
            return (
              <div
                key={item.id}
                className={`flex h-full min-h-0 w-full ${
                  index === 2
                    ? `${CULTURE_MOBILE_BOTTOM_CARD_WRAPPER_CLASS_NAME} ${CULTURE_MOBILE_BOTTOM_ROW_CARD_CLASS_NAME}`
                    : CULTURE_MOBILE_CARD_WRAPPER_CLASS_NAME
                } ${index % 3 === 2 ? 'col-span-2 justify-center sm:col-span-1' : ''}`}
              >
                <CultureVotingCard
                  compactHero={index === 1}
                  id={item.id}
                  title={item.title}
                  images={
                    item.images?.length
                      ? item.images
                      : item.imageUrl
                        ? [item.imageUrl]
                        : []
                  }
                  likedByCurrentUser={item.likedByCurrentUser}
                  pending={pendingItemId === item.id}
                  earlyAccessPending={earlyAccessPendingId === item.id}
                  onToggleLike={handleToggleLike}
                  onEarlyAccess={handleEarlyAccessCheckout}
                  sizeLabel={sizeLabel}
                  variantLabel={variantLabel}
                  variantTone={variantTone}
                  showEarlyAccess={showEarlyAccess}
                  earlyAccessLabel={t('home.homepage.culture.labels.earlyAccess')}
                />
              </div>
            );
          })}
        </div>
      </div>
      </div>
    </section>
  );
}

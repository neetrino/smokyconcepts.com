'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { useAuth } from '../../lib/auth/AuthContext';
import { apiClient } from '../../lib/api-client';
import { showToast } from '../Toast';

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
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const [items, setItems] = useState<VotingItem[]>([]);
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
      setError('Failed to load voting items.');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVotingItems().catch(() => undefined);
  }, [fetchVotingItems]);

  const handleToggleLike = useCallback(
    async (itemId: string, likedByCurrentUser: boolean) => {
      if (!isLoggedIn) {
        showToast('Please log in to vote.', 'info');
        router.push('/login?redirect=/');
        return;
      }

      try {
        setPendingItemId(itemId);

        const response = likedByCurrentUser
          ? await apiClient.delete<VotingLikeResponse>(`/api/v1/voting/${itemId}/like`)
          : await apiClient.post<VotingLikeResponse>(`/api/v1/voting/${itemId}/like`);

        setItems((currentItems) =>
          currentItems.map((item) =>
            item.id === itemId
              ? {
                  ...item,
                  likeCount: response.data.likeCount,
                  likedByCurrentUser: response.data.likedByCurrentUser,
                }
              : item,
          ),
        );
      } catch {
        showToast('Failed to update vote.', 'error');
      } finally {
        setPendingItemId(null);
      }
    },
    [isLoggedIn, router],
  );

  if (error) {
    return (
      <section className="flex flex-col gap-8">
        <div className="flex min-h-[4rem] items-center justify-center">
          <div className="w-full max-w-[52rem] px-4 text-center">
            <HomeSectionTitle
              title="Your Voice Shapes Culture"
              description="Culture moves when people take part. Your choice brings concepts to life, be part of the creation and get early access."
              centered
            />
          </div>
        </div>
        <div className="flex items-center justify-center gap-4 py-8">
          <p className="text-[#414141]">{error}</p>
          <button
            type="button"
            onClick={() => fetchVotingItems()}
            className="rounded-lg border-2 border-[#122a26] px-4 py-2 text-sm font-medium text-[#122a26] hover:bg-[#122a26]/5"
          >
            Retry
          </button>
        </div>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="flex flex-col gap-8">
        <div className="flex min-h-[4rem] items-center justify-center">
          <div className="w-full max-w-[52rem] px-4 text-center">
            <HomeSectionTitle
              title="Your Voice Shapes Culture"
              description="Culture moves when people take part. Your choice brings concepts to life, be part of the creation and get early access."
              centered
            />
          </div>
        </div>
        <div className="mx-auto w-full max-w-[80rem] translate-x-44 px-4">
          <div className="grid grid-cols-2 justify-items-center gap-4 sm:grid-cols-3 lg:grid-cols-5 lg:[grid-template-columns:repeat(5,minmax(15rem,1fr))]">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="h-80 w-full max-w-[15rem] animate-pulse rounded-3xl bg-white/60 lg:max-w-none" />
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
    <section className="flex flex-col gap-8 overflow-hidden pb-6">
      <div className="flex min-h-[4rem] items-center justify-center">
        <div className="w-full max-w-[52rem] px-4 text-center">
          <HomeSectionTitle
            title="Your Voice Shapes Culture"
            description="Culture moves when people take part. Your choice brings concepts to life, be part of the creation and get early access."
            centered
          />
        </div>
      </div>
      <div className="mx-auto w-full max-w-[80rem] translate-x-64 px-4">
        <div className="grid grid-cols-2 justify-items-center gap-4 sm:grid-cols-3 lg:grid-cols-5 lg:[grid-template-columns:repeat(5,minmax(10rem,25fr))]">
          {items.map((item, index) => {
            const isMiddle = items.length >= 3 && index === Math.floor(items.length / 2);
            return (
              <CultureVotingCard
                key={item.id}
                id={item.id}
                title={item.title}
                imageUrl={item.imageUrl}
                likeCount={item.likeCount}
                likedByCurrentUser={item.likedByCurrentUser}
                pending={pendingItemId === item.id}
                onToggleLike={handleToggleLike}
                imageNudgeDown={isMiddle}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}

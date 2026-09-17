'use client';

import { useState, type Dispatch, type SetStateAction } from 'react';

import { showToast } from '@/components/Toast';
import { apiClient } from '@/lib/api-client';
import type { HomeHeroSlide } from '@/lib/types/home-hero.types';
import { logger } from '@/lib/utils/logger';
import type { HomeHeroImageField } from './components/HomeHeroSlideEditor';
import { remapIndexAfterMove, reorderByIndex } from './utils';

export async function persistHomeHeroSlides(slides: HomeHeroSlide[]): Promise<void> {
  await apiClient.put('/api/v1/admin/settings', {
    homeHero: { slides },
  });
}

type UploadingTarget = { index: number; field: HomeHeroImageField } | null;

interface UseHomeHeroSlideReorderParams {
  slides: HomeHeroSlide[];
  setSlides: Dispatch<SetStateAction<HomeHeroSlide[]>>;
  expandedSlideIndex: number | null;
  setExpandedSlideIndex: Dispatch<SetStateAction<number | null>>;
  uploadingTarget: UploadingTarget;
  setUploadingTarget: Dispatch<SetStateAction<UploadingTarget>>;
  t: (key: string) => string;
}

interface SlideDropContext extends UseHomeHeroSlideReorderParams {
  draggingIndex: number | null;
  reordering: boolean;
  clearDragState: () => void;
  setReordering: Dispatch<SetStateAction<boolean>>;
}

function remapTrackedIndexes(
  setExpandedSlideIndex: Dispatch<SetStateAction<number | null>>,
  setUploadingTarget: Dispatch<SetStateAction<UploadingTarget>>,
  fromIndex: number,
  targetIndex: number,
): void {
  setExpandedSlideIndex((prev) =>
    prev === null ? null : remapIndexAfterMove(prev, fromIndex, targetIndex),
  );
  setUploadingTarget((prev) =>
    prev ? { ...prev, index: remapIndexAfterMove(prev.index, fromIndex, targetIndex) } : prev,
  );
}

async function persistOrRollback(
  nextSlides: HomeHeroSlide[],
  restore: () => void,
  t: (key: string) => string,
): Promise<void> {
  try {
    await persistHomeHeroSlides(nextSlides);
    showToast(t('admin.homeHero.reorderSuccess'), 'success');
  } catch (error: unknown) {
    logger.error('Error reordering home hero slides', { error });
    restore();
    showToast(t('admin.homeHero.reorderFailed'), 'error');
  }
}

async function applySlideDrop(targetIndex: number, ctx: SlideDropContext): Promise<void> {
  if (ctx.reordering || ctx.draggingIndex === null) {
    ctx.clearDragState();
    return;
  }

  const fromIndex = ctx.draggingIndex;
  const nextSlides = reorderByIndex(ctx.slides, fromIndex, targetIndex);
  ctx.clearDragState();
  if (!nextSlides) {
    return;
  }

  const previousSlides = ctx.slides;
  const previousExpanded = ctx.expandedSlideIndex;
  const previousUploading = ctx.uploadingTarget;
  ctx.setSlides(nextSlides);
  remapTrackedIndexes(ctx.setExpandedSlideIndex, ctx.setUploadingTarget, fromIndex, targetIndex);
  ctx.setReordering(true);
  await persistOrRollback(nextSlides, () => {
    ctx.setSlides(previousSlides);
    ctx.setExpandedSlideIndex(previousExpanded);
    ctx.setUploadingTarget(previousUploading);
  }, ctx.t);
  ctx.setReordering(false);
}

export function useHomeHeroSlideReorder(params: UseHomeHeroSlideReorderParams) {
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);
  const [reordering, setReordering] = useState(false);

  const clearDragState = () => {
    setDraggingIndex(null);
    setDropTargetIndex(null);
  };

  return {
    draggingIndex,
    dropTargetIndex,
    reordering,
    setDraggingIndex,
    setDropTargetIndex,
    clearDragState,
    handleSlideDrop: (targetIndex: number) =>
      applySlideDrop(targetIndex, {
        ...params,
        draggingIndex,
        reordering,
        clearDragState,
        setReordering,
      }),
  };
}

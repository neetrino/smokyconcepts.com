'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { SIZE_MODAL_EXIT_DURATION_MS } from '../lib/size-modal-animation.constants';

interface UseSizeModalExitAnimationOptions {
  isOpen: boolean;
  /** Fired after the exit transition when close started while `isOpen` was still true */
  onExited?: () => void;
}

/**
 * Keeps the modal mounted during exit transition, then unmounts and optionally notifies parent.
 */
export function useSizeModalExitAnimation({
  isOpen,
  onExited,
}: UseSizeModalExitAnimationOptions) {
  const [isMounted, setIsMounted] = useState(isOpen);
  const [isExiting, setIsExiting] = useState(false);
  const [isEntered, setIsEntered] = useState(false);
  const onExitedRef = useRef(onExited);
  onExitedRef.current = onExited;

  useEffect(() => {
    if (isOpen && !isExiting) {
      setIsMounted(true);
      setIsExiting(false);
      return;
    }
    if (!isOpen && isMounted && !isExiting) {
      setIsEntered(false);
      setIsExiting(true);
    }
  }, [isOpen, isMounted, isExiting]);

  useEffect(() => {
    if (!isMounted || isExiting) {
      setIsEntered(false);
      return;
    }

    let visibleFrameId = 0;
    const enterFrameId = requestAnimationFrame(() => {
      visibleFrameId = requestAnimationFrame(() => {
        setIsEntered(true);
      });
    });

    return () => {
      cancelAnimationFrame(enterFrameId);
      if (visibleFrameId !== 0) {
        cancelAnimationFrame(visibleFrameId);
      }
    };
  }, [isMounted, isExiting]);

  const requestClose = useCallback(() => {
    if (!isMounted || isExiting) {
      return;
    }
    setIsEntered(false);
    setIsExiting(true);
  }, [isMounted, isExiting]);

  useEffect(() => {
    if (!isExiting) {
      return;
    }
    const timerId = window.setTimeout(() => {
      setIsMounted(false);
      setIsExiting(false);
      setIsEntered(false);
      if (isOpen) {
        onExitedRef.current?.();
      }
    }, SIZE_MODAL_EXIT_DURATION_MS);
    return () => window.clearTimeout(timerId);
  }, [isExiting, isOpen]);

  return { isMounted, isExiting, isEntered, requestClose };
}

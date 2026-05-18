'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import {
  SIZE_MODAL_EXIT_DURATION_MS,
  SIZE_MODAL_REDUCED_MOTION_EXIT_MS,
} from '../lib/size-modal-animation.constants';

interface UseSizeModalExitAnimationOptions {
  isOpen: boolean;
  /** Override total exit wait (e.g. 0 when reduced motion) */
  exitDurationMs?: number;
  /** Fired after the exit transition when close started via `requestClose` */
  onExited?: () => void;
}

/**
 * Keeps the modal mounted during exit transition, then unmounts and optionally notifies parent.
 */
export function useSizeModalExitAnimation({
  isOpen,
  exitDurationMs = SIZE_MODAL_EXIT_DURATION_MS,
  onExited,
}: UseSizeModalExitAnimationOptions) {
  const [isMounted, setIsMounted] = useState(isOpen);
  const [isExiting, setIsExiting] = useState(false);
  const [isEntered, setIsEntered] = useState(false);
  const onExitedRef = useRef(onExited);
  onExitedRef.current = onExited;

  const finishExit = useCallback(() => {
    setIsMounted(false);
    setIsExiting(false);
    setIsEntered(false);
  }, []);

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
    if (exitDurationMs <= SIZE_MODAL_REDUCED_MOTION_EXIT_MS) {
      finishExit();
      if (isOpen) {
        onExitedRef.current?.();
      }
      return;
    }
    const timerId = window.setTimeout(() => {
      finishExit();
      if (isOpen) {
        onExitedRef.current?.();
      }
    }, exitDurationMs);
    return () => window.clearTimeout(timerId);
  }, [isExiting, isOpen, exitDurationMs, finishExit]);

  return { isMounted, isExiting, isEntered, requestClose };
}

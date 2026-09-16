'use client';

import { useEffect, useState } from 'react';

const DRAWER_ENTER_FRAME_MS = 16 as const;

export function useCategoryFormDrawer(isOpen: boolean, onClose: () => void, canClose: boolean) {
  const [isEntered, setIsEntered] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setIsEntered(false);
      return undefined;
    }
    const frameId = window.setTimeout(() => setIsEntered(true), DRAWER_ENTER_FRAME_MS);
    return () => window.clearTimeout(frameId);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && canClose) {
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [canClose, isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  return { isEntered };
}

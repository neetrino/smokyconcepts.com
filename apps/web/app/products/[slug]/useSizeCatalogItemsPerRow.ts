'use client';

import { useEffect, useState } from 'react';

/** Matches legacy size grid: `grid-cols-3 md:grid-cols-4 lg:grid-cols-7`. */
const QUERY_MD_MIN_WIDTH = '(min-width: 768px)';
const QUERY_LG_MIN_WIDTH = '(min-width: 1024px)';

function readItemsPerRow(): number {
  if (typeof window === 'undefined') {
    return 3;
  }
  if (window.matchMedia(QUERY_LG_MIN_WIDTH).matches) {
    return 7;
  }
  if (window.matchMedia(QUERY_MD_MIN_WIDTH).matches) {
    return 4;
  }
  return 3;
}

/**
 * Responsive column count for the size catalog two-row band (same as previous grid breakpoints).
 */
export function useSizeCatalogItemsPerRow(): number {
  const [itemsPerRow, setItemsPerRow] = useState(3);

  useEffect(() => {
    const update = () => {
      setItemsPerRow(readItemsPerRow());
    };
    update();
    const mqLg = window.matchMedia(QUERY_LG_MIN_WIDTH);
    const mqMd = window.matchMedia(QUERY_MD_MIN_WIDTH);
    mqLg.addEventListener('change', update);
    mqMd.addEventListener('change', update);
    return () => {
      mqLg.removeEventListener('change', update);
      mqMd.removeEventListener('change', update);
    };
  }, []);

  return itemsPerRow;
}

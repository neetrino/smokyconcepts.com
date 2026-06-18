'use client';

import { useEffect, useState } from 'react';

/** Matches size grid: `grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-7`. */
const QUERY_MD_MIN_WIDTH = '(min-width: 768px)';
const QUERY_XL_MIN_WIDTH = '(min-width: 1280px)';
const QUERY_2XL_MIN_WIDTH = '(min-width: 1536px)';

function readItemsPerRow(): number {
  if (typeof window === 'undefined') {
    return 3;
  }
  if (window.matchMedia(QUERY_2XL_MIN_WIDTH).matches) {
    return 7;
  }
  if (window.matchMedia(QUERY_XL_MIN_WIDTH).matches) {
    return 5;
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
    const mq2Xl = window.matchMedia(QUERY_2XL_MIN_WIDTH);
    const mqXl = window.matchMedia(QUERY_XL_MIN_WIDTH);
    const mqMd = window.matchMedia(QUERY_MD_MIN_WIDTH);
    mq2Xl.addEventListener('change', update);
    mqXl.addEventListener('change', update);
    mqMd.addEventListener('change', update);
    return () => {
      mq2Xl.removeEventListener('change', update);
      mqXl.removeEventListener('change', update);
      mqMd.removeEventListener('change', update);
    };
  }, []);

  return itemsPerRow;
}

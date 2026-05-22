'use client';

import { useProductInfoAndActions } from './hooks/useProductInfoAndActions';
import { ProductInfoAndActionsView } from './ProductInfoAndActionsView';
import type { ProductInfoAndActionsProps } from './productInfoAndActions.types';

export type { ProductInfoAndActionsProps } from './productInfoAndActions.types';

export function ProductInfoAndActions(props: ProductInfoAndActionsProps) {
  const view = useProductInfoAndActions(props);
  return <ProductInfoAndActionsView {...props} view={view} />;
}

import { ProductPageSkeleton } from './ProductPageSkeleton';
import { PageLoadingCenter } from '../../../components/loading/PageLoadingCenter';

/**
 * Instant Loading UI while the PDP server payload is prepared.
 * Skeleton keeps layout; glass overlay matches storefront loading language.
 */
export default function ProductLoading() {
  return (
    <>
      <ProductPageSkeleton />
      <PageLoadingCenter reserveLayoutSpace={false} />
    </>
  );
}

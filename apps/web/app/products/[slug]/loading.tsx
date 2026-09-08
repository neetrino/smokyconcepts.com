import { ProductPagePreview } from './ProductPagePreview';

/**
 * Instant Loading UI while the PDP server payload is prepared.
 * Paints the catalog card snapshot (title, hero, price, badges) when the visitor
 * arrived from a card; otherwise falls back to the skeleton + glass overlay.
 */
export default function ProductLoading() {
  return <ProductPagePreview />;
}

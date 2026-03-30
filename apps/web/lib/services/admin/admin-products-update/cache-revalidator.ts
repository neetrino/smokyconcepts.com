import { revalidatePath, revalidateTag } from "next/cache";
import { logger } from "../../utils/logger";

/**
 * Revalidate cache for product and related pages
 */
export function revalidateProductCache(
  productId: string,
  productSlug: string | undefined
) {
  try {
    logger.debug('Revalidating paths for product', { productId });
    if (productSlug) {
      revalidatePath(`/products/${productSlug}`);
    }
    revalidatePath('/');
    revalidatePath('/products');
    // @ts-expect-error - revalidateTag type issue in Next.js
    revalidateTag('products');
    // @ts-expect-error - revalidateTag type issue in Next.js
    revalidateTag(`product-${productId}`);
  } catch (error: unknown) {
    // Revalidation might fail in some environments (e.g., during build)
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.warn('Revalidation failed (expected in some environments)', { error: errorMessage });
  }
}





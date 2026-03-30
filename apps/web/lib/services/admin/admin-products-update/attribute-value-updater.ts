import { Prisma } from "@prisma/client";
import { logger } from "../../utils/logger";

/**
 * Update attribute value imageUrls from variant images.
 * No-op: attribute_values and attributes tables were removed by migration (remove_attribute_variation).
 * Kept for API compatibility so callers do not need to change.
 */
export async function updateAttributeValueImageUrls(
  _productId: string,
  _tx: Prisma.TransactionClient
): Promise<void> {
  logger.debug('Attribute value imageUrl update skipped (attribute tables removed from schema)');
}





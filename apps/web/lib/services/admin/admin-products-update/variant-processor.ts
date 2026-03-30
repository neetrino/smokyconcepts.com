/**
 * Parse variant price, stock, and compareAtPrice
 */
export function parseVariantPrices(variant: {
  price: string | number;
  compareAtPrice?: string | number;
  stock: string | number;
}): {
  price: number;
  stock: number;
  compareAtPrice?: number;
} {
  const price = typeof variant.price === "number" ? variant.price : parseFloat(String(variant.price));
  const stock = typeof variant.stock === "number" ? variant.stock : parseInt(String(variant.stock), 10);
  const compareAtPrice =
    variant.compareAtPrice !== undefined &&
    variant.compareAtPrice !== null &&
    String(variant.compareAtPrice).trim() !== ""
      ? typeof variant.compareAtPrice === "number"
        ? variant.compareAtPrice
        : parseFloat(String(variant.compareAtPrice))
      : undefined;

  if (isNaN(price) || price < 0) {
    throw new Error(`Invalid price value: ${variant.price}`);
  }

  return { price, stock, compareAtPrice };
}

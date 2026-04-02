import { db } from "@white-shop/db";
import { deleteProduct as removeProductFromSearchIndex } from "@/lib/services/search.service";

class AdminProductsDeleteService {
  /**
   * Permanently removes the product from the database (variants, translations, labels cascade).
   * Order items keep title/sku snapshots; `variantId` is cleared in DB (ON DELETE SET NULL).
   */
  async deleteProduct(productId: string) {
    const result = await db.product.deleteMany({
      where: { id: productId },
    });

    if (result.count === 0) {
      throw {
        status: 404,
        type: "https://api.shop.am/problems/not-found",
        title: "Product not found",
        detail: `Product with id '${productId}' does not exist`,
      };
    }

    await removeProductFromSearchIndex(productId);

    return { success: true };
  }

  /**
   * Update product discount
   */
  async updateProductDiscount(productId: string, discountPercent: number) {
    console.log('💰 [ADMIN PRODUCTS DELETE SERVICE] updateProductDiscount called:', { productId, discountPercent });
    
    const product = await db.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      console.error('❌ [ADMIN PRODUCTS DELETE SERVICE] Product not found:', productId);
      throw {
        status: 404,
        type: "https://api.shop.am/problems/not-found",
        title: "Product not found",
        detail: `Product with id '${productId}' does not exist`,
      };
    }

    const clampedDiscount = Math.max(0, Math.min(100, discountPercent));
    console.log('💰 [ADMIN PRODUCTS DELETE SERVICE] Updating product discount:', {
      productId,
      oldDiscount: product.discountPercent,
      newDiscount: clampedDiscount,
    });

    const updated = await db.product.update({
      where: { id: productId },
      data: {
        discountPercent: clampedDiscount,
      },
    });

    console.log('✅ [ADMIN PRODUCTS DELETE SERVICE] Product discount updated successfully:', {
      productId,
      discountPercent: updated.discountPercent,
    });

    return { success: true, discountPercent: updated.discountPercent };
  }
}

export const adminProductsDeleteService = new AdminProductsDeleteService();







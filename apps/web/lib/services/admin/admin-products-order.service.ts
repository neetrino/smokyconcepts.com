import { revalidatePath, revalidateTag } from "next/cache";
import { db } from "@white-shop/db";
import {
  getProductCollectionOrderMap,
  saveProductCollectionOrderMap,
} from "@/lib/services/product-collection-order.service";

class AdminProductsOrderService {
  async reorderProductsInCategory(categoryId: string, orderedIds: string[]) {
    if (!categoryId.trim()) {
      throw {
        status: 400,
        type: "https://api.shop.am/problems/bad-request",
        title: "Invalid reorder payload",
        detail: "categoryId is required",
      };
    }

    if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
      throw {
        status: 400,
        type: "https://api.shop.am/problems/bad-request",
        title: "Invalid reorder payload",
        detail: "orderedIds must be a non-empty array",
      };
    }

    const uniqueIds = Array.from(new Set(orderedIds));
    if (uniqueIds.length !== orderedIds.length) {
      throw {
        status: 400,
        type: "https://api.shop.am/problems/bad-request",
        title: "Invalid reorder payload",
        detail: "orderedIds must not contain duplicates",
      };
    }

    const categoryExists = await db.category.findFirst({
      where: { id: categoryId, deletedAt: null },
      select: { id: true },
    });
    if (!categoryExists) {
      throw {
        status: 404,
        type: "https://api.shop.am/problems/not-found",
        title: "Category not found",
        detail: "Collection does not exist",
      };
    }

    const productsInCategory = await db.product.findMany({
      where: {
        deletedAt: null,
        OR: [
          { primaryCategoryId: categoryId },
          { categoryIds: { has: categoryId } },
          { categories: { some: { id: categoryId } } },
        ],
      },
      select: { id: true },
      orderBy: { createdAt: "desc" },
    });

    const productIdsInCategory = productsInCategory.map((product: { id: string }) => product.id);
    if (productIdsInCategory.length !== orderedIds.length) {
      throw {
        status: 400,
        type: "https://api.shop.am/problems/bad-request",
        title: "Invalid reorder payload",
        detail: "orderedIds must include every product for this collection",
      };
    }

    const productIdSet = new Set(productIdsInCategory);
    const hasForeignProduct = orderedIds.some((id) => !productIdSet.has(id));
    if (hasForeignProduct) {
      throw {
        status: 400,
        type: "https://api.shop.am/problems/bad-request",
        title: "Invalid reorder payload",
        detail: "Some products are not part of the selected collection",
      };
    }

    const orderMap = await getProductCollectionOrderMap();
    orderMap[categoryId] = orderedIds;
    await saveProductCollectionOrderMap(orderMap);

    revalidatePath("/products");
    // @ts-expect-error - Next.js tag typing mismatch in this repo
    revalidateTag("products");

    return { success: true };
  }
}

export const adminProductsOrderService = new AdminProductsOrderService();

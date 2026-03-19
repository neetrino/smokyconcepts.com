import { db } from "@white-shop/db";
import { revalidatePath, revalidateTag } from "next/cache";
import {
  processImageUrl,
  smartSplitUrls,
  cleanImageUrls,
  separateMainAndVariantImages,
} from "../utils/image-utils";

class AdminProductsCreateService {
  /**
   * Generate unique SKU for product variant
   * Checks database to ensure uniqueness
   */
  private async generateUniqueSku(
    tx: any,
    baseSku: string | undefined,
    productSlug: string,
    variantIndex: number,
    usedSkus: Set<string>
  ): Promise<string> {
    // If base SKU is provided and unique, use it
    if (baseSku && baseSku.trim() !== '') {
      const trimmedSku = baseSku.trim();
      
      // Check if already used in this transaction
      if (!usedSkus.has(trimmedSku)) {
        // Check if exists in database
        const existing = await tx.productVariant.findUnique({
          where: { sku: trimmedSku },
        });
        
        if (!existing) {
          usedSkus.add(trimmedSku);
          console.log(`✅ [ADMIN PRODUCTS CREATE SERVICE] Using provided SKU: ${trimmedSku}`);
          return trimmedSku;
        } else {
          console.log(`⚠️ [ADMIN PRODUCTS CREATE SERVICE] SKU already exists in DB: ${trimmedSku}, generating new one`);
        }
      } else {
        console.log(`⚠️ [ADMIN PRODUCTS CREATE SERVICE] SKU already used in transaction: ${trimmedSku}, generating new one`);
      }
    }

    // Generate new unique SKU
    const baseSlug = productSlug || 'PROD';
    let attempt = 0;
    let newSku: string;
    
    do {
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 6).toUpperCase();
      const suffix = attempt > 0 ? `-${attempt}` : '';
      newSku = `${baseSlug.toUpperCase()}-${timestamp}-${variantIndex + 1}${suffix}-${random}`;
      attempt++;
      
      // Check if already used in this transaction
      if (usedSkus.has(newSku)) {
        continue;
      }
      
      // Check if exists in database
      const existing = await tx.productVariant.findUnique({
        where: { sku: newSku },
      });
      
      if (!existing) {
        usedSkus.add(newSku);
        console.log(`✅ [ADMIN PRODUCTS CREATE SERVICE] Generated unique SKU: ${newSku}`);
        return newSku;
      }
      
      console.log(`⚠️ [ADMIN PRODUCTS CREATE SERVICE] Generated SKU exists in DB: ${newSku}, trying again...`);
    } while (attempt < 100); // Safety limit
    
    // Fallback: use timestamp + random if all attempts failed
    const finalSku = `${baseSlug.toUpperCase()}-${Date.now()}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    usedSkus.add(finalSku);
    console.log(`✅ [ADMIN PRODUCTS CREATE SERVICE] Using fallback SKU: ${finalSku}`);
    return finalSku;
  }

  /**
   * Create product
   */
  async createProduct(data: {
    title: string;
    slug: string;
    subtitle?: string;
    descriptionHtml?: string;
    primaryCategoryId?: string;
    categoryIds?: string[];
    published: boolean;
    featured?: boolean;
    upcoming?: boolean;
    locale: string;
    media?: any[];
    mainProductImage?: string;
    labels?: Array<{
      type: string;
      value: string;
      position: string;
      color?: string | null;
    }>;
    variants: Array<{
      price: string | number;
      compareAtPrice?: string | number;
      stock: string | number;
      sku?: string;
      imageUrl?: string;
      published?: boolean;
    }>;
  }) {
    try {
      console.log('🆕 [ADMIN PRODUCTS CREATE SERVICE] Creating product:', data.title);

      const result = await db.$transaction(async (tx: any) => {
        // Track used SKUs within this transaction to ensure uniqueness
        const usedSkus = new Set<string>();
        
        const variantsData = await Promise.all(
          data.variants.map(async (variant: { price: string | number; compareAtPrice?: string | number; stock: string | number; sku?: string; imageUrl?: string; published?: boolean }, variantIndex: number) => {
            const price = typeof variant.price === 'number' ? variant.price : parseFloat(String(variant.price));
            const stock = typeof variant.stock === 'number' ? variant.stock : parseInt(String(variant.stock), 10);
            const compareAtPrice = variant.compareAtPrice !== undefined && variant.compareAtPrice !== null && String(variant.compareAtPrice).trim() !== ''
              ? (typeof variant.compareAtPrice === 'number' ? variant.compareAtPrice : parseFloat(String(variant.compareAtPrice)))
              : undefined;

            const uniqueSku = await this.generateUniqueSku(
              tx,
              variant.sku,
              data.slug,
              variantIndex,
              usedSkus
            );

            let processedVariantImageUrl: string | undefined;
            if (variant.imageUrl) {
              const urls = smartSplitUrls(variant.imageUrl);
              const processedUrls = urls.map((url: string) => processImageUrl(url)).filter((url: string | null): url is string => url !== null);
              processedVariantImageUrl = processedUrls.length > 0 ? processedUrls.join(',') : undefined;
            } else {
              processedVariantImageUrl = undefined;
            }

            return {
              sku: uniqueSku,
              price,
              compareAtPrice,
              stock: isNaN(stock) ? 0 : stock,
              imageUrl: processedVariantImageUrl,
              published: variant.published !== false,
            };
          })
        );

        // Final validation: log all SKUs to ensure uniqueness
        const allSkus = variantsData.map(v => v.sku).filter(Boolean);
        const uniqueSkus = new Set(allSkus);
        console.log(`📋 [ADMIN PRODUCTS CREATE SERVICE] Generated ${variantsData.length} variants with SKUs:`, allSkus);
        
        if (allSkus.length !== uniqueSkus.size) {
          console.error('❌ [ADMIN PRODUCTS CREATE SERVICE] Duplicate SKUs detected!', {
            total: allSkus.length,
            unique: uniqueSkus.size,
            duplicates: allSkus.filter((sku, index) => allSkus.indexOf(sku) !== index)
          });
          throw new Error('Duplicate SKUs detected in variants. This should not happen.');
        }
        
        console.log('✅ [ADMIN PRODUCTS CREATE SERVICE] All variant SKUs are unique');

        // Collect all variant images to exclude from main media
        const allVariantImages: any[] = [];
        variantsData.forEach((variant: any) => {
          if (variant.imageUrl) {
            const urls = smartSplitUrls(variant.imageUrl);
            allVariantImages.push(...urls);
          }
        });

        // Prepare media array - use mainProductImage if provided and media is empty
        let rawMedia = data.media || [];
        if (data.mainProductImage && rawMedia.length === 0) {
          // If mainProductImage is provided but media is empty, use mainProductImage as first media item
          rawMedia = [data.mainProductImage];
          console.log('📸 [ADMIN PRODUCTS CREATE SERVICE] Using mainProductImage as media:', data.mainProductImage.substring(0, 50) + '...');
        } else if (data.mainProductImage && rawMedia.length > 0) {
          // If both are provided, ensure mainProductImage is first in media array
          const mainImageIndex = rawMedia.findIndex((m: any) => {
            const url = typeof m === 'string' ? m : m.url;
            return url === data.mainProductImage;
          });
          if (mainImageIndex === -1) {
            // mainProductImage not in media array, add it as first
            rawMedia = [data.mainProductImage, ...rawMedia];
            console.log('📸 [ADMIN PRODUCTS CREATE SERVICE] Added mainProductImage as first media item');
          } else if (mainImageIndex > 0) {
            // mainProductImage is in media but not first, move it to first
            const mainImage = rawMedia[mainImageIndex];
            rawMedia.splice(mainImageIndex, 1);
            rawMedia.unshift(mainImage);
            console.log('📸 [ADMIN PRODUCTS CREATE SERVICE] Moved mainProductImage to first position in media');
          }
        }

        // Separate main images from variant images and clean them
        const { main } = separateMainAndVariantImages(rawMedia, allVariantImages);
        const finalMedia = cleanImageUrls(main);
        
        console.log('📸 [ADMIN PRODUCTS CREATE SERVICE] Final main media count:', finalMedia.length);
        console.log('📸 [ADMIN PRODUCTS CREATE SERVICE] Variant images excluded:', allVariantImages.length);

        const product = await tx.product.create({
          data: {
            primaryCategoryId: data.primaryCategoryId || undefined,
            categoryIds: data.categoryIds || [],
            media: finalMedia,
            published: data.published,
            featured: data.featured ?? false,
            upcoming: data.upcoming ?? false,
            publishedAt: data.published ? new Date() : undefined,
            translations: {
              create: {
                locale: data.locale || "en",
                title: data.title,
                slug: data.slug,
                subtitle: data.subtitle || undefined,
                descriptionHtml: data.descriptionHtml || undefined,
              },
            },
            variants: {
              create: variantsData,
            },
            labels: data.labels && data.labels.length > 0
              ? {
                  create: data.labels.map((label) => ({
                    type: label.type,
                    value: label.value,
                    position: label.position,
                    color: label.color || undefined,
                  })),
                }
              : undefined,
          },
        });

        return await tx.product.findUnique({
          where: { id: product.id },
          include: {
            translations: true,
            variants: true,
            labels: true,
          },
        });
      });

      // Revalidate cache
      try {
        console.log('🧹 [ADMIN PRODUCTS CREATE SERVICE] Revalidating paths for new product');
        revalidatePath('/');
        revalidatePath('/products');
        // @ts-expect-error - revalidateTag type issue in Next.js
        revalidateTag('products');
      } catch (e) {
        console.warn('⚠️ [ADMIN PRODUCTS CREATE SERVICE] Revalidation failed:', e);
      }

      return result;
    } catch (error: any) {
      console.error("❌ [ADMIN PRODUCTS CREATE SERVICE] createProduct error:", error);
      throw error;
    }
  }
}

export const adminProductsCreateService = new AdminProductsCreateService();







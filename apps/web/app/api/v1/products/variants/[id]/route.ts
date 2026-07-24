import { NextRequest, NextResponse } from "next/server";
import { db } from "@white-shop/db";
import { catalogPriceForStorefront } from "@/lib/currency";

type MediaEntry = string | { url?: string; src?: string } | null | undefined;

type VariantRow = {
  id: string;
  productId: string;
  stock: number;
  published: boolean;
  sku: string | null;
  price: number;
  compareAtPrice: number | null;
  imageUrl: string | null;
  product: {
    media: unknown;
    translations: Array<{ locale: string; title: string; slug: string }>;
  };
};

function resolveFirstMediaUrl(media: unknown): string | null {
  if (!Array.isArray(media) || media.length === 0) {
    return null;
  }
  const first = media[0] as MediaEntry;
  if (typeof first === "string" && first.trim()) {
    return first.trim();
  }
  if (first && typeof first === "object") {
    const url = typeof first.url === "string" ? first.url.trim() : "";
    if (url) return url;
    const src = typeof first.src === "string" ? first.src.trim() : "";
    if (src) return src;
  }
  return null;
}

function pickTranslation(
  translations: Array<{ locale: string; title: string; slug: string }>
): { title: string; slug: string } | null {
  if (translations.length === 0) {
    return null;
  }
  const preferred =
    translations.find((row) => row.locale === "en") ??
    translations.find((row) => row.locale === "hy") ??
    translations[0];
  const title = preferred.title?.trim() ?? "";
  const slug = preferred.slug?.trim() ?? "";
  if (!title || !slug) {
    return null;
  }
  return { title, slug };
}

function buildVariantCartPayload(variant: VariantRow) {
  const translation = pickTranslation(variant.product.translations);
  const compareAtPrice =
    variant.compareAtPrice != null
      ? catalogPriceForStorefront(variant.compareAtPrice)
      : null;

  return {
    id: variant.id,
    productId: variant.productId,
    stock: variant.stock,
    available: variant.stock > 0 && variant.published === true,
    sku: variant.sku,
    price: catalogPriceForStorefront(variant.price),
    compareAtPrice,
    imageUrl: variant.imageUrl?.trim() || null,
    product: {
      title: translation?.title ?? "",
      slug: translation?.slug ?? "",
      image: resolveFirstMediaUrl(variant.product.media),
    },
  };
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const variant = await db.productVariant.findUnique({
      where: { id },
      select: {
        id: true,
        productId: true,
        stock: true,
        published: true,
        sku: true,
        price: true,
        compareAtPrice: true,
        imageUrl: true,
        product: {
          select: {
            media: true,
            translations: {
              select: { locale: true, title: true, slug: true },
            },
          },
        },
      },
    });

    if (!variant) {
      return NextResponse.json(
        {
          type: "https://api.shop.am/problems/not-found",
          title: "Variant not found",
          status: 404,
          detail: `Variant with id '${id}' not found`,
          instance: req.url,
        },
        { status: 404 }
      );
    }

    return NextResponse.json(buildVariantCartPayload(variant));
  } catch (error: unknown) {
    const err = error as {
      type?: string;
      title?: string;
      status?: number;
      detail?: string;
      message?: string;
    };
    console.error("❌ [PRODUCTS] Get variant error:", error);
    return NextResponse.json(
      {
        type: err.type || "https://api.shop.am/problems/internal-error",
        title: err.title || "Internal Server Error",
        status: err.status || 500,
        detail: err.detail || err.message || "An error occurred",
        instance: req.url,
      },
      { status: err.status || 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { productsService } from "@/lib/services/products.service";

export const revalidate = 60;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const filters = {
      category: searchParams.get("category") || undefined,
      search: searchParams.get("search") || undefined,
      filter: searchParams.get("filter") || searchParams.get("filters") || undefined,
      minPrice: searchParams.get("minPrice")
        ? parseFloat(searchParams.get("minPrice")!)
        : undefined,
      maxPrice: searchParams.get("maxPrice")
        ? parseFloat(searchParams.get("maxPrice")!)
        : undefined,
      sort: searchParams.get("sort") || "createdAt",
      page: searchParams.get("page")
        ? parseInt(searchParams.get("page")!)
        : 1,
      limit: searchParams.get("limit")
        ? parseInt(searchParams.get("limit")!)
        : 24,
      lang: searchParams.get("lang") || "en",
    };

    const result = await productsService.findAll(filters);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("❌ [PRODUCTS] Error:", error);
    return NextResponse.json(
      {
        type: error.type || "https://api.shop.am/problems/internal-error",
        title: error.title || "Internal Server Error",
        status: error.status || 500,
        detail: error.detail || error.message || "An error occurred",
        instance: req.url,
      },
      { status: error.status || 500 }
    );
  }
}


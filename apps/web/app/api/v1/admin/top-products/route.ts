import { NextRequest, NextResponse } from "next/server";
import { authenticateToken, requireAdmin } from "@/lib/middleware/auth";
import { adminService } from "@/lib/services/admin.service";

/**
 * GET /api/v1/admin/top-products
 * Get top products for admin dashboard
 */
export async function GET(req: NextRequest) {
  try {
    console.log("📊 [TOP-PRODUCTS] Request received");
    const user = await authenticateToken(req);

    if (!user || !requireAdmin(user)) {
      console.log("❌ [TOP-PRODUCTS] Unauthorized or not admin");
      return NextResponse.json(
        {
          type: "https://api.shop.am/problems/forbidden",
          title: "Forbidden",
          status: 403,
          detail: "Admin access required",
          instance: req.url,
        },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "5", 10);

    console.log(`✅ [TOP-PRODUCTS] User authenticated: ${user.id}, limit: ${limit}`);
    const result = await adminService.getTopProducts(limit);
    console.log("✅ [TOP-PRODUCTS] Top products retrieved successfully");

    return NextResponse.json({ data: result });
  } catch (error: unknown) {
    const errorData = error as {
      type?: string;
      title?: string;
      status?: number;
      detail?: string;
      message?: string;
    };
    console.error("❌ [TOP-PRODUCTS] Error:", error);
    return NextResponse.json(
      {
        type: errorData.type || "https://api.shop.am/problems/internal-error",
        title: errorData.title || "Internal Server Error",
        status: errorData.status || 500,
        detail: errorData.detail || errorData.message || "An error occurred",
        instance: req.url,
      },
      { status: errorData.status || 500 }
    );
  }
}

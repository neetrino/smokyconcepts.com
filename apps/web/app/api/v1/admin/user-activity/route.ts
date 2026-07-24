import { NextRequest, NextResponse } from "next/server";
import { authenticateToken, requireAdmin } from "@/lib/middleware/auth";
import { adminService } from "@/lib/services/admin.service";

/**
 * GET /api/v1/admin/user-activity
 * Get user activity statistics (recent registrations and active users)
 */
export async function GET(req: NextRequest) {
  try {
    console.log("👥 [USER-ACTIVITY] Request received");
    const user = await authenticateToken(req);

    if (!user || !requireAdmin(user)) {
      console.log("❌ [USER-ACTIVITY] Unauthorized or not admin");
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
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    console.log(`✅ [USER-ACTIVITY] User authenticated: ${user.id}, limit: ${limit}`);
    const result = await adminService.getUserActivity(limit);
    console.log("✅ [USER-ACTIVITY] User activity data retrieved successfully");

    return NextResponse.json({ data: result });
  } catch (error: unknown) {
    const errorData = error as {
      type?: string;
      title?: string;
      status?: number;
      detail?: string;
      message?: string;
    };
    console.error("❌ [USER-ACTIVITY] Error:", error);
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

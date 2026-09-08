import { NextRequest, NextResponse } from "next/server";
import { authenticateToken, requireAdmin } from "@/lib/middleware/auth";
import { adminService } from "@/lib/services/admin.service";

function parsePositiveInt(value: string | null): number | undefined {
  if (value == null || value === "") {
    return undefined;
  }
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed >= 1 ? parsed : undefined;
}

export async function GET(req: NextRequest) {
  try {
    const user = await authenticateToken(req);
    if (!user || !requireAdmin(user)) {
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
    const search = searchParams.get("search") ?? undefined;
    const roleRaw = searchParams.get("role");
    const role =
      roleRaw === "admin" || roleRaw === "customer" || roleRaw === "all" ? roleRaw : undefined;
    const take = parsePositiveInt(searchParams.get("take"));
    const page = parsePositiveInt(searchParams.get("page"));
    const limit = parsePositiveInt(searchParams.get("limit"));

    const result = await adminService.getUsers({
      ...(search != null && search !== "" ? { search } : {}),
      ...(role != null ? { role } : {}),
      ...(take != null ? { take } : {}),
      ...(page != null ? { page } : {}),
      ...(limit != null ? { limit } : {}),
    });
    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error("❌ [ADMIN] Error:", error);
    const err = error as { status?: number; type?: string; title?: string; detail?: string; message?: string };
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


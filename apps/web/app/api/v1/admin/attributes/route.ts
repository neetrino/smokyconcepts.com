import { NextRequest, NextResponse } from "next/server";
import { authenticateToken, requireAdmin } from "@/lib/middleware/auth";
import { adminService } from "@/lib/services/admin.service";

function forbiddenResponse(req: NextRequest) {
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

function errorResponse(req: NextRequest, error: unknown) {
  const normalizedError =
    typeof error === "object" && error !== null
      ? (error as { type?: string; title?: string; status?: number; detail?: string; message?: string })
      : {};

  return NextResponse.json(
    {
      type: normalizedError.type || "https://api.shop.am/problems/internal-error",
      title: normalizedError.title || "Internal Server Error",
      status: normalizedError.status || 500,
      detail: normalizedError.detail || normalizedError.message || "An error occurred",
      instance: req.url,
    },
    { status: normalizedError.status || 500 }
  );
}

export async function GET(req: NextRequest) {
  try {
    const user = await authenticateToken(req);
    if (!user || !requireAdmin(user)) {
      return forbiddenResponse(req);
    }

    const result = await adminService.getGlobalAttributes();
    return NextResponse.json(result);
  } catch (error: unknown) {
    return errorResponse(req, error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await authenticateToken(req);
    if (!user || !requireAdmin(user)) {
      return forbiddenResponse(req);
    }

    const body = await req.json();
    const result = await adminService.createGlobalAttribute(body);
    return NextResponse.json(result, { status: 201 });
  } catch (error: unknown) {
    return errorResponse(req, error);
  }
}

import { NextRequest, NextResponse } from "next/server";
import { db } from "@white-shop/db";
import { authenticateToken, requireAdmin } from "@/lib/middleware/auth";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const { id } = await params;
    if (!id?.trim()) {
      return NextResponse.json(
        {
          type: "https://api.shop.am/problems/bad-request",
          title: "Bad Request",
          status: 400,
          detail: "Message ID is required",
          instance: req.url,
        },
        { status: 400 }
      );
    }

    const existing = await db.contactMessage.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        {
          type: "https://api.shop.am/problems/not-found",
          title: "Not Found",
          status: 404,
          detail: "Message not found",
          instance: req.url,
        },
        { status: 404 }
      );
    }

    await db.contactMessage.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An unexpected error occurred";
    return NextResponse.json(
      {
        type: "https://api.shop.am/problems/internal-error",
        title: "Internal Server Error",
        status: 500,
        detail: message,
        instance: req.url,
      },
      { status: 500 }
    );
  }
}

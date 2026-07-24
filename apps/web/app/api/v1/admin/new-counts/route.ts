import { NextRequest, NextResponse } from "next/server";
import { db } from "@white-shop/db";
import { authenticateToken, requireAdmin } from "@/lib/middleware/auth";

function parseSinceTimestamp(rawValue: string | null): Date | null {
  if (!rawValue?.trim()) {
    return null;
  }
  const parsed = new Date(rawValue);
  if (!Number.isFinite(parsed.getTime())) {
    return null;
  }
  return parsed;
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

    const ordersSince = parseSinceTimestamp(req.nextUrl.searchParams.get("ordersSince"));
    const messagesSince = parseSinceTimestamp(req.nextUrl.searchParams.get("messagesSince"));

    const [orders, messages] = await Promise.all([
      ordersSince
        ? db.order.count({ where: { createdAt: { gt: ordersSince } } })
        : Promise.resolve(0),
      messagesSince
        ? db.contactMessage.count({ where: { createdAt: { gt: messagesSince } } })
        : Promise.resolve(0),
    ]);

    return NextResponse.json({ orders, messages });
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

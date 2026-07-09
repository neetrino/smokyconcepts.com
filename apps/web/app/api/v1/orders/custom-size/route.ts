import { NextRequest, NextResponse } from "next/server";
import { authenticateToken } from "@/lib/middleware/auth";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import {
  CONTACT_RATE_LIMIT_WINDOW_SECONDS,
  CUSTOM_SIZE_ORDER_MAX_ATTEMPTS,
} from "@/lib/security/rate-limit.constants";
import { createCustomSizeOrder, type CreateCustomSizeOrderInput } from "@/lib/services/custom-size-order.service";

export async function POST(req: NextRequest) {
  const rateLimited = await enforceRateLimit(req, {
    scope: "orders:custom-size",
    limit: CUSTOM_SIZE_ORDER_MAX_ATTEMPTS,
    windowSeconds: CONTACT_RATE_LIMIT_WINDOW_SECONDS,
  });
  if (rateLimited) {
    return rateLimited;
  }

  try {
    const user = await authenticateToken(req);
    const body = (await req.json()) as CreateCustomSizeOrderInput;
    const order = await createCustomSizeOrder(body, user?.id);
    return NextResponse.json({ order }, { status: 201 });
  } catch (error: unknown) {
    const typedError = error as {
      type?: string;
      title?: string;
      status?: number;
      detail?: string;
      message?: string;
    };
    return NextResponse.json(
      {
        type: typedError.type || "https://api.shop.am/problems/internal-error",
        title: typedError.title || "Internal Server Error",
        status: typedError.status || 500,
        detail: typedError.detail || typedError.message || "An error occurred",
        instance: req.url,
      },
      { status: typedError.status || 500 }
    );
  }
}

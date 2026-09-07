import { NextRequest, NextResponse } from "next/server";
import { authenticateToken } from "@/lib/middleware/auth";
import { appendOrderAccessCookie } from "@/lib/orders/order-access-cookie.server";
import { ordersService } from "@/lib/services/orders.service";
import { toApiError } from "@/lib/types/errors";
import { logger } from "@/lib/utils/logger";

export async function POST(req: NextRequest) {
  try {
    logger.info("Checkout request received");
    const user = await authenticateToken(req);
    const data = await req.json();

    logger.debug("Checkout data", {
      userId: user?.id,
      itemsCount: data.items?.length || 0,
      email: data.email,
      phone: data.phone,
      paymentMethod: data.paymentMethod,
      shippingMethod: data.shippingMethod,
    });

    const result = await ordersService.checkout(data, user?.id);

    logger.info("Checkout successful", {
      orderNumber: result.order?.number,
      orderId: result.order?.id,
      total: result.order?.total,
    });

    const response = NextResponse.json(result, { status: 201 });
    if (result.order?.id) {
      appendOrderAccessCookie(response, req, result.order.id);
    }
    return response;
  } catch (error: unknown) {
    logger.error("Checkout error", { error });
    if (error instanceof Error) {
      logger.error("Checkout error details", {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
    }
    const apiError = toApiError(error, req.url);
    return NextResponse.json(apiError, { status: apiError.status || 500 });
  }
}

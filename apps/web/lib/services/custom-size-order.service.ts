import { db } from "@white-shop/db";
import { Prisma } from "@prisma/client";
import { parseDataImageUrl } from "@/lib/services/utils/data-url-image";
import { isR2Configured, uploadSizeCatalogImageToR2 } from "@/lib/services/r2.service";

const ORDER_NUMBER_START = 100;
const ORDER_NUMBER_RETRY_LIMIT = 5;

export const CUSTOM_SIZE_ORDER_NOTE_MARKER = "CUSTOM_SIZE_REQUEST";
const CUSTOM_SIZE_ORDER_SKU = "CUSTOM-SIZE";
const CUSTOM_SIZE_ORDER_PRODUCT_TITLE = "Custom Size Request";

export interface CreateCustomSizeOrderInput {
  name: string;
  phone: string;
  email: string;
  description: string;
  imageDataUrl: string;
  productId?: string;
  productTitle?: string;
}

function isP2002Error(error: unknown): error is { code: string; meta?: { target?: string[] } } {
  if (!error || typeof error !== "object" || !("code" in error)) {
    return false;
  }
  const prismaError = error as { code?: string; meta?: { target?: string[] } };
  if (prismaError.code !== "P2002") {
    return false;
  }
  const target = prismaError.meta?.target ?? [];
  return target.length === 0 || target.some((field) => field.includes("number"));
}

async function getNextSequentialOrderNumber(tx: Prisma.TransactionClient): Promise<string> {
  try {
    const [row] = await tx.$queryRaw<Array<{ max_number: number | null }>>`
      SELECT MAX(CAST("number" AS INTEGER)) AS max_number
      FROM "orders"
      WHERE "number" ~ '^[0-9]+$'
    `;
    const maxNumber = Number(row?.max_number ?? 0);
    return String(Math.max(ORDER_NUMBER_START, maxNumber + 1));
  } catch {
    const recentOrders = await tx.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      select: { number: true },
    });
    const maxNumber = recentOrders.reduce((currentMax, order) => {
      if (!/^\d+$/.test(order.number)) {
        return currentMax;
      }
      return Math.max(currentMax, Number(order.number));
    }, 0);
    return String(Math.max(ORDER_NUMBER_START, maxNumber + 1));
  }
}

function validateCustomSizeOrderInput(input: CreateCustomSizeOrderInput): CreateCustomSizeOrderInput {
  const name = input.name.trim();
  const phone = input.phone.trim();
  const email = input.email.trim();
  const description = input.description.trim();
  const imageDataUrl = input.imageDataUrl.trim();

  if (!name || !phone || !email || !description || !imageDataUrl) {
    throw {
      status: 400,
      type: "https://api.shop.am/problems/validation-error",
      title: "Validation Error",
      detail: "name, phone, email, description and imageDataUrl are required",
    };
  }

  if (!imageDataUrl.startsWith("data:image/")) {
    throw {
      status: 400,
      type: "https://api.shop.am/problems/validation-error",
      title: "Validation Error",
      detail: "imageDataUrl must be a valid data:image/* base64 payload",
    };
  }

  return {
    ...input,
    name,
    phone,
    email,
    description,
    imageDataUrl,
    productId: input.productId?.trim() || undefined,
    productTitle: input.productTitle?.trim() || undefined,
  };
}

export async function createCustomSizeOrder(
  rawInput: CreateCustomSizeOrderInput,
  userId?: string
): Promise<{ id: string; number: string }> {
  const input = validateCustomSizeOrderInput(rawInput);

  if (!isR2Configured()) {
    throw {
      status: 503,
      type: "https://api.shop.am/problems/config-error",
      title: "Configuration Error",
      detail:
        "R2 storage is not configured. Set R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_ENDPOINT, R2_PUBLIC_URL in .env",
    };
  }

  const parsedImage = parseDataImageUrl(input.imageDataUrl);
  if (!parsedImage) {
    throw {
      status: 400,
      type: "https://api.shop.am/problems/validation-error",
      title: "Validation Error",
      detail: "Failed to parse imageDataUrl",
    };
  }

  const uploadedImageUrl = await uploadSizeCatalogImageToR2(parsedImage.buffer, parsedImage.contentType);
  const productTitle = input.productTitle || CUSTOM_SIZE_ORDER_PRODUCT_TITLE;
  const notePayload = JSON.stringify({
    marker: CUSTOM_SIZE_ORDER_NOTE_MARKER,
    name: input.name,
    description: input.description,
    productId: input.productId || null,
  });

  for (let attempt = 0; attempt < ORDER_NUMBER_RETRY_LIMIT; attempt += 1) {
    try {
      const order = await db.$transaction(async (tx: Prisma.TransactionClient) => {
        const orderNumber = await getNextSequentialOrderNumber(tx);
        return tx.order.create({
          data: {
            number: orderNumber,
            userId: userId || null,
            status: "pending",
            paymentStatus: "pending",
            fulfillmentStatus: "unfulfilled",
            subtotal: 0,
            discountAmount: 0,
            shippingAmount: 0,
            taxAmount: 0,
            total: 0,
            currency: "USD",
            customerEmail: input.email,
            customerPhone: input.phone,
            customerLocale: "en",
            shippingMethod: "pickup",
            notes: notePayload,
            items: {
              create: {
                variantId: null,
                productTitle,
                variantTitle: `Custom request by ${input.name}`,
                sku: CUSTOM_SIZE_ORDER_SKU,
                quantity: 1,
                price: 0,
                total: 0,
                sizeCatalogTitle: input.description,
                sizeCatalogImageUrl: uploadedImageUrl,
                customizePlain: input.description,
                customizeHtml: null,
              },
            },
            events: {
              create: {
                type: "custom_size_order_created",
                data: {
                  marker: CUSTOM_SIZE_ORDER_NOTE_MARKER,
                  source: userId ? "user" : "guest",
                  name: input.name,
                },
              },
            },
          },
          select: {
            id: true,
            number: true,
          },
        });
      });
      return order;
    } catch (error) {
      if (isP2002Error(error) && attempt < ORDER_NUMBER_RETRY_LIMIT - 1) {
        continue;
      }
      throw error;
    }
  }

  throw {
    status: 500,
    type: "https://api.shop.am/problems/internal-error",
    title: "Internal Server Error",
    detail: "Failed to generate unique order number for custom size order",
  };
}

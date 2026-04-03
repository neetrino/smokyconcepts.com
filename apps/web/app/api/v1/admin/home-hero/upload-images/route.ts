import { NextRequest, NextResponse } from "next/server";
import { authenticateToken, requireAdmin } from "@/lib/middleware/auth";
import { isR2Configured, uploadHomeHeroImageToR2 } from "@/lib/services/r2.service";
import { parseDataImageUrl } from "@/lib/services/utils/data-url-image";
import { logger } from "@/lib/utils/logger";

/**
 * POST /api/v1/admin/home-hero/upload-images
 * Upload hero slide images to R2 (prefix home-hero/YYYY/MM/).
 *
 * Request body: { images: string[] } — base64 data URLs (data:image/...)
 * Response: { urls: string[] }
 */
export async function POST(req: NextRequest) {
  const requestStartTime = Date.now();
  logger.debug("Home hero upload images API: POST received", { url: req.url });

  try {
    const user = await authenticateToken(req);
    if (!user || !requireAdmin(user)) {
      logger.warn("Home hero upload images: unauthorized", { userId: user?.id });
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

    if (!isR2Configured()) {
      logger.error("Home hero upload images: R2 not configured");
      return NextResponse.json(
        {
          type: "https://api.shop.am/problems/config-error",
          title: "Configuration Error",
          status: 503,
          detail:
            "R2 storage is not configured. Set R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_ENDPOINT, R2_PUBLIC_URL in .env",
          instance: req.url,
        },
        { status: 503 }
      );
    }

    let body: { images?: unknown };
    try {
      body = await req.json();
    } catch (parseError) {
      logger.error("Home hero upload images: JSON parse error", { error: parseError });
      return NextResponse.json(
        {
          type: "https://api.shop.am/problems/validation-error",
          title: "Validation Error",
          status: 400,
          detail: "Invalid JSON in request body",
          instance: req.url,
        },
        { status: 400 }
      );
    }

    if (!Array.isArray(body.images) || body.images.length === 0) {
      return NextResponse.json(
        {
          type: "https://api.shop.am/problems/validation-error",
          title: "Validation Error",
          status: 400,
          detail: "Field 'images' is required and must be a non-empty array",
          instance: req.url,
        },
        { status: 400 }
      );
    }

    const validImages: string[] = [];
    for (let i = 0; i < body.images.length; i++) {
      const image = body.images[i];
      if (typeof image !== "string") {
        return NextResponse.json(
          {
            type: "https://api.shop.am/problems/validation-error",
            title: "Validation Error",
            status: 400,
            detail: `Image at index ${i} must be a string`,
            instance: req.url,
          },
          { status: 400 }
        );
      }
      if (!image.startsWith("data:image/")) {
        return NextResponse.json(
          {
            type: "https://api.shop.am/problems/validation-error",
            title: "Validation Error",
            status: 400,
            detail: `Image at index ${i} must be a valid base64 image (data:image/...)`,
            instance: req.url,
          },
          { status: 400 }
        );
      }
      validImages.push(image);
    }

    logger.debug("Home hero upload images: uploading to R2", { count: validImages.length });

    const uploadResults = await Promise.all(
      validImages.map(async (dataUrl, i) => {
        const parsed = parseDataImageUrl(dataUrl);
        if (!parsed) {
          logger.warn("Home hero upload images: skip invalid data URL", { index: i });
          return null;
        }
        return uploadHomeHeroImageToR2(parsed.buffer, parsed.contentType);
      })
    );
    const urls = uploadResults.filter((u): u is string => u !== null);

    const totalTime = Date.now() - requestStartTime;
    logger.info("Home hero upload images: R2 upload complete", {
      count: urls.length,
      timeMs: totalTime,
    });

    return NextResponse.json({ urls }, { status: 200 });
  } catch (error: unknown) {
    const totalTime = Date.now() - requestStartTime;
    const err = error as {
      message?: string;
      status?: number;
      type?: string;
      title?: string;
      detail?: string;
    };
    logger.error("Home hero upload images: POST error", {
      message: err?.message,
      status: err?.status,
      timeMs: totalTime,
    });

    return NextResponse.json(
      {
        type: err?.type ?? "https://api.shop.am/problems/internal-error",
        title: err?.title ?? "Internal Server Error",
        status: err?.status ?? 500,
        detail: err?.detail ?? err?.message ?? "An error occurred",
        instance: req.url,
      },
      { status: err?.status ?? 500 }
    );
  }
}

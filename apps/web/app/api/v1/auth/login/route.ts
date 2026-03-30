import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/lib/services/auth.service";
import { toApiError } from "@/lib/types/errors";
import { logger } from "@/lib/utils/logger";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const result = await authService.login(data);
    return NextResponse.json(result);
  } catch (error: unknown) {
    logger.error("Login error", { error });
    const apiError = toApiError(error, req.url);
    return NextResponse.json(apiError, { status: apiError.status || 500 });
  }
}


import { NextRequest, NextResponse } from "next/server";

import { authenticateToken } from "@/lib/middleware/auth";
import { votingService } from "@/lib/services/voting.service";

function createErrorResponse(error: unknown, url: string) {
  const problem = error as Partial<{
    type: string;
    title: string;
    status: number;
    detail: string;
    message: string;
  }>;

  return NextResponse.json(
    {
      type: problem.type || "https://api.shop.am/problems/internal-error",
      title: problem.title || "Internal Server Error",
      status: problem.status || 500,
      detail: problem.detail || problem.message || "An error occurred",
      instance: url,
    },
    { status: problem.status || 500 },
  );
}

export async function GET(req: NextRequest) {
  try {
    const user = await authenticateToken(req);
    const result = await votingService.getVotingItems(user?.id);
    return NextResponse.json(result);
  } catch (error: unknown) {
    return createErrorResponse(error, req.url);
  }
}

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

async function getAuthenticatedUser(req: NextRequest) {
  const user = await authenticateToken(req);

  if (!user) {
    return NextResponse.json(
      {
        type: "https://api.shop.am/problems/unauthorized",
        title: "Unauthorized",
        status: 401,
        detail: "Authentication required",
        instance: req.url,
      },
      { status: 401 },
    );
  }

  return user;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const userOrResponse = await getAuthenticatedUser(req);

  if (userOrResponse instanceof NextResponse) {
    return userOrResponse;
  }

  try {
    const { id } = await params;
    const result = await votingService.likeItem(id, userOrResponse.id);
    return NextResponse.json(result);
  } catch (error: unknown) {
    return createErrorResponse(error, req.url);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const userOrResponse = await getAuthenticatedUser(req);

  if (userOrResponse instanceof NextResponse) {
    return userOrResponse;
  }

  try {
    const { id } = await params;
    const result = await votingService.unlikeItem(id, userOrResponse.id);
    return NextResponse.json(result);
  } catch (error: unknown) {
    return createErrorResponse(error, req.url);
  }
}

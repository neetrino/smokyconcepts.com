import { NextRequest } from "next/server";
import * as jwt from "jsonwebtoken";
import { Prisma } from "@prisma/client";
import { db } from "@white-shop/db";
import { getTokenFromRequest } from "@/lib/auth/auth-cookie.server";
import { resolveCachedAuthUser } from "./auth-user-cache";

export interface AuthUser {
  id: string;
  email: string | null;
  phone: string | null;
  locale: string;
  roles: string[];
}

function isPrismaInitializationError(error: unknown): boolean {
  if (error instanceof Prisma.PrismaClientInitializationError) {
    return true;
  }

  if (typeof error !== "object" || error === null) {
    return false;
  }

  const maybePrismaError = error as { name?: string };
  return maybePrismaError.name === "PrismaClientInitializationError";
}

async function loadAuthUser(userId: string): Promise<AuthUser | null> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      phone: true,
      locale: true,
      roles: true,
      blocked: true,
      deletedAt: true,
    },
  });

  if (!user || user.blocked || user.deletedAt) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    phone: user.phone,
    locale: user.locale,
    roles: user.roles,
  };
}

/**
 * Authenticate JWT token from request headers
 */
export async function authenticateToken(
  request: NextRequest
): Promise<AuthUser | null> {
  try {
    const token = getTokenFromRequest(request);

    if (!token) {
      return null;
    }

    if (!process.env.JWT_SECRET) {
      console.error("❌ [AUTH] JWT_SECRET is not set!");
      return null;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as {
      userId: string;
    };

    return await resolveCachedAuthUser(token, () => loadAuthUser(decoded.userId));
  } catch (error) {
    if (
      error instanceof jwt.JsonWebTokenError ||
      error instanceof jwt.TokenExpiredError
    ) {
      return null;
    }

    if (isPrismaInitializationError(error)) {
      throw {
        type: "https://api.shop.am/problems/service-unavailable",
        title: "Service Unavailable",
        status: 503,
        detail:
          "Authentication service is temporarily unavailable. Please try again later.",
      };
    }

    throw error;
  }
}

/**
 * Check if user is admin
 */
export function requireAdmin(user: AuthUser | null): boolean {
  if (!user) {
    return false;
  }
  return user.roles.includes("admin");
}


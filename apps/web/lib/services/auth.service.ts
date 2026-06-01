import * as jwt from "jsonwebtoken";
import { db } from "@white-shop/db";
import {
  hashPassword,
  shouldUpgradePasswordHash,
  validateNewPasswordPolicy,
  verifyPassword,
} from "@/lib/security/password";
import { PASSWORD_POLICY_DETAIL } from "@/lib/security/password.constants";
import { logger } from "@/lib/utils/logger";

export interface RegisterData {
  email?: string;
  phone?: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface LoginData {
  email?: string;
  phone?: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string | null;
    phone: string | null;
    firstName: string | null;
    lastName: string | null;
    roles: string[];
  };
  token: string;
}

class AuthService {
  private ensureJwtSecret(): string {
    const secret = process.env.JWT_SECRET?.trim();
    if (!secret) {
      logger.error("JWT_SECRET is not set");
      throw {
        status: 500,
        type: "https://api.shop.am/problems/internal-error",
        title: "Internal Server Error",
        detail: "Server configuration error",
      };
    }
    return secret;
  }

  private signToken(userId: string): string {
    const secret = this.ensureJwtSecret();
    return jwt.sign(
      { userId },
      secret,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" } as jwt.SignOptions,
    );
  }

  private async upgradePasswordHashIfNeeded(
    userId: string,
    plainPassword: string,
    storedHash: string,
  ): Promise<void> {
    if (!shouldUpgradePasswordHash(storedHash)) {
      return;
    }

    try {
      const passwordHash = await hashPassword(plainPassword);
      await db.user.update({
        where: { id: userId },
        data: { passwordHash },
      });
      logger.info("Password hash upgraded to Argon2id", { userId });
    } catch (error: unknown) {
      logger.warn("Password hash upgrade failed", { userId, error });
    }
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    if (!data.email && !data.phone) {
      throw {
        status: 400,
        type: "https://api.shop.am/problems/validation-error",
        title: "Validation failed",
        detail: "Either email or phone is required",
      };
    }

    const passwordError = validateNewPasswordPolicy(data.password);
    if (passwordError) {
      throw {
        status: 400,
        type: "https://api.shop.am/problems/validation-error",
        title: "Validation failed",
        detail: passwordError === "Password is required"
          ? PASSWORD_POLICY_DETAIL
          : passwordError,
      };
    }

    const existingUser = await db.user.findFirst({
      where: {
        OR: [
          ...(data.email ? [{ email: data.email }] : []),
          ...(data.phone ? [{ phone: data.phone }] : []),
        ],
        deletedAt: null,
      },
      select: { id: true },
    });

    if (existingUser) {
      throw {
        status: 409,
        type: "https://api.shop.am/problems/conflict",
        title: "User already exists",
        detail: "User with this email or phone already exists",
      };
    }

    const passwordHash = await hashPassword(data.password);

    let user;
    try {
      user = await db.user.create({
        data: {
          email: data.email || null,
          phone: data.phone || null,
          passwordHash,
          firstName: data.firstName || null,
          lastName: data.lastName || null,
          locale: "en",
          roles: ["customer"],
        },
        select: {
          id: true,
          email: true,
          phone: true,
          firstName: true,
          lastName: true,
          roles: true,
        },
      });
    } catch (error: unknown) {
      const prismaError = error as { code?: string };
      if (prismaError.code === "P2002") {
        throw {
          status: 409,
          type: "https://api.shop.am/problems/conflict",
          title: "User already exists",
          detail: "User with this email or phone already exists",
        };
      }
      throw error;
    }

    const token = this.signToken(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roles,
      },
      token,
    };
  }

  async login(data: LoginData): Promise<AuthResponse> {
    if (!data.email && !data.phone) {
      throw {
        status: 400,
        type: "https://api.shop.am/problems/validation-error",
        title: "Validation failed",
        detail: "Either email or phone is required",
      };
    }

    if (!data.password) {
      throw {
        status: 400,
        type: "https://api.shop.am/problems/validation-error",
        title: "Validation failed",
        detail: "Password is required",
      };
    }

    const user = await db.user.findFirst({
      where: {
        OR: [
          ...(data.email ? [{ email: data.email }] : []),
          ...(data.phone ? [{ phone: data.phone }] : []),
        ],
        deletedAt: null,
      },
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
        passwordHash: true,
        roles: true,
        blocked: true,
      },
    });

    if (!user || !user.passwordHash) {
      throw {
        status: 401,
        type: "https://api.shop.am/problems/unauthorized",
        title: "Invalid credentials",
        detail: "Invalid email/phone or password",
      };
    }

    const isValidPassword = await verifyPassword(data.password, user.passwordHash);

    if (!isValidPassword) {
      throw {
        status: 401,
        type: "https://api.shop.am/problems/unauthorized",
        title: "Invalid credentials",
        detail: "Invalid email/phone or password",
      };
    }

    if (user.blocked) {
      throw {
        status: 403,
        type: "https://api.shop.am/problems/forbidden",
        title: "Account blocked",
        detail: "Your account has been blocked",
      };
    }

    await this.upgradePasswordHashIfNeeded(user.id, data.password, user.passwordHash);

    const token = this.signToken(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roles,
      },
      token,
    };
  }
}

export const authService = new AuthService();

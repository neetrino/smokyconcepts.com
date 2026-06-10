import { NextRequest, NextResponse } from "next/server";
import { db } from "@white-shop/db";
import { logger } from "@/lib/utils/logger";
import { isContactPhoneAllowedCharacterSet } from "@/lib/utils/contact-phone-input";
import { enforceRateLimit } from "@/lib/security/rate-limit";
import {
  CONTACT_MAX_ATTEMPTS,
  CONTACT_RATE_LIMIT_WINDOW_SECONDS,
} from "@/lib/security/rate-limit.constants";

/** Stored in DB `subject` column (schema); form field is the visitor's phone. */
const CONTACT_PHONE_MIN_LENGTH = 3;
const CONTACT_PHONE_MAX_LENGTH = 40;

/**
 * POST /api/v1/contact
 * Submit contact form
 */
export async function POST(req: NextRequest) {
  const rateLimited = await enforceRateLimit(req, {
    scope: 'contact:submit',
    limit: CONTACT_MAX_ATTEMPTS,
    windowSeconds: CONTACT_RATE_LIMIT_WINDOW_SECONDS,
  });
  if (rateLimited) {
    return rateLimited;
  }

  try {
    const body = await req.json();
    const { name, email, message } = body;
    const phoneRaw = body.phone ?? body.subject;
    const phone =
      typeof phoneRaw === "string" ? phoneRaw.trim() : "";

    // Validation
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        {
          type: "https://api.shop.am/problems/validation-error",
          title: "Validation Error",
          status: 400,
          detail: "Field 'name' is required",
          instance: req.url,
        },
        { status: 400 }
      );
    }

    if (!email || typeof email !== 'string' || email.trim().length === 0) {
      return NextResponse.json(
        {
          type: "https://api.shop.am/problems/validation-error",
          title: "Validation Error",
          status: 400,
          detail: "Field 'email' is required",
          instance: req.url,
        },
        { status: 400 }
      );
    }

    if (
      phone.length < CONTACT_PHONE_MIN_LENGTH ||
      phone.length > CONTACT_PHONE_MAX_LENGTH
    ) {
      return NextResponse.json(
        {
          type: "https://api.shop.am/problems/validation-error",
          title: "Validation Error",
          status: 400,
          detail: "Field 'phone' is required and must be a valid length",
          instance: req.url,
        },
        { status: 400 }
      );
    }

    if (!isContactPhoneAllowedCharacterSet(phone)) {
      return NextResponse.json(
        {
          type: "https://api.shop.am/problems/validation-error",
          title: "Validation Error",
          status: 400,
          detail: "Field 'phone' may only contain digits and phone formatting characters",
          instance: req.url,
        },
        { status: 400 }
      );
    }

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        {
          type: "https://api.shop.am/problems/validation-error",
          title: "Validation Error",
          status: 400,
          detail: "Field 'message' is required",
          instance: req.url,
        },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          type: "https://api.shop.am/problems/validation-error",
          title: "Validation Error",
          status: 400,
          detail: "Invalid email format",
          instance: req.url,
        },
        { status: 400 }
      );
    }

    // Create contact message
    const contactMessage = await db.contactMessage.create({
      data: {
        name: name.trim(),
        email: email.trim(),
        subject: phone,
        message: message.trim(),
      },
    });

    logger.info("Contact message created", { id: contactMessage.id });

    return NextResponse.json(
      {
        data: {
          id: contactMessage.id,
          name: contactMessage.name,
          email: contactMessage.email,
          phone: contactMessage.subject,
          subject: contactMessage.subject,
          message: contactMessage.message,
          createdAt: contactMessage.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    logger.error("Contact form error", { error });
    return NextResponse.json(
      {
        type: "https://api.shop.am/problems/internal-error",
        title: "Internal Server Error",
        status: 500,
        detail: "An error occurred while submitting the contact form",
        instance: req.url,
      },
      { status: 500 }
    );
  }
}




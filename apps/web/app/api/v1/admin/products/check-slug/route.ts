import { NextRequest, NextResponse } from "next/server";
import { authenticateToken, requireAdmin } from "@/lib/middleware/auth";
import { db } from "@white-shop/db";

/**
 * GET /api/v1/admin/products/check-slug?slug=my-product&excludeId=xxx
 *
 * Returns { available: boolean, suggestion: string }
 */
export async function GET(req: NextRequest) {
  try {
    const user = await authenticateToken(req);
    if (!user || !requireAdmin(user)) {
      return NextResponse.json({ status: 403, detail: "Admin access required" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug")?.trim();
    const excludeId = searchParams.get("excludeId")?.trim() || null;

    if (!slug) {
      return NextResponse.json({ status: 400, detail: "slug param is required" }, { status: 400 });
    }

    const isTaken = async (candidate: string): Promise<boolean> => {
      const existing = await db.productTranslation.findFirst({
        where: {
          slug: candidate,
          ...(excludeId ? { product: { id: { not: excludeId } } } : {}),
        },
        select: { id: true },
      });
      return existing !== null;
    };

    if (!(await isTaken(slug))) {
      return NextResponse.json({ available: true, suggestion: slug });
    }

    let counter = 2;
    let candidate = `${slug}-${counter}`;
    while (await isTaken(candidate)) {
      counter++;
      candidate = `${slug}-${counter}`;
    }

    return NextResponse.json({ available: false, suggestion: candidate });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ status: 500, detail: message }, { status: 500 });
  }
}

/**
 * POST /api/v1/admin/products/check-slug
 *
 * Finds all duplicate slugs in ProductTranslation and renames them
 * by appending -2, -3, … keeping the first occurrence untouched.
 *
 * Returns { fixed: number, details: { id, oldSlug, newSlug }[] }
 */
export async function POST(req: NextRequest) {
  try {
    const user = await authenticateToken(req);
    if (!user || !requireAdmin(user)) {
      return NextResponse.json({ status: 403, detail: "Admin access required" }, { status: 403 });
    }

    // Load all translations ordered oldest-first so the first one keeps its slug.
    const all = await db.productTranslation.findMany({
      select: { id: true, slug: true, locale: true },
      orderBy: { id: "asc" },
    });

    // Build a map: slug → list of translation ids that use it.
    const slugMap = new Map<string, string[]>();
    for (const row of all) {
      const key = `${row.slug}::${row.locale}`;
      if (!slugMap.has(key)) slugMap.set(key, []);
      slugMap.get(key)!.push(row.id);
    }

    // Collect all currently used slugs (per locale) for uniqueness check.
    const usedSlugs = new Map<string, Set<string>>();
    for (const row of all) {
      if (!usedSlugs.has(row.locale)) usedSlugs.set(row.locale, new Set());
      usedSlugs.get(row.locale)!.add(row.slug);
    }

    const fixed: { id: string; oldSlug: string; newSlug: string }[] = [];

    for (const [key, ids] of slugMap.entries()) {
      if (ids.length <= 1) continue;

      // Keep first; rename the rest.
      const [, ...duplicates] = ids;
      const [baseSlug, locale] = key.split("::");
      const localeSet = usedSlugs.get(locale) ?? new Set<string>();

      for (const dupId of duplicates) {
        let counter = 2;
        let candidate = `${baseSlug}-${counter}`;
        while (localeSet.has(candidate)) {
          counter++;
          candidate = `${baseSlug}-${counter}`;
        }

        await db.productTranslation.update({
          where: { id: dupId },
          data: { slug: candidate },
        });

        localeSet.add(candidate);
        fixed.push({ id: dupId, oldSlug: baseSlug, newSlug: candidate });
      }
    }

    return NextResponse.json({ fixed: fixed.length, details: fixed });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ status: 500, detail: message }, { status: 500 });
  }
}

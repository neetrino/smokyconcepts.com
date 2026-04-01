/**
 * One-off: physically remove products that were soft-deleted from admin.
 * Run: npx tsx scripts/purge-soft-deleted-products.ts
 */
import { config } from "dotenv";
import { resolve } from "node:path";
import { PrismaClient } from "@prisma/client";

config({ path: resolve(process.cwd(), ".env") });

async function main(): Promise<void> {
  const prisma = new PrismaClient();
  try {
    const before = await prisma.product.count();
    const softDeleted = await prisma.product.count({
      where: { deletedAt: { not: null } },
    });
    const result = await prisma.product.deleteMany({
      where: { deletedAt: { not: null } },
    });
    const after = await prisma.product.count();
    console.log(
      JSON.stringify(
        {
          productsBefore: before,
          softDeletedRows: softDeleted,
          deleted: result.count,
          productsAfter: after,
        },
        null,
        2
      )
    );
  } finally {
    await prisma.$disconnect();
  }
}

void main();

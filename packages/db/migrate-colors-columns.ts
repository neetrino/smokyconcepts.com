/**
 * Runtime migration script to add colors and imageUrl columns
 * This script can be run while the server is running
 */

import { db } from "./client";

export async function ensureColorsColumnsExist() {
  try {
    const tableCheck = (await db.$queryRawUnsafe(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'attribute_values'
      ) as exists;
    `)) as Array<{ exists: boolean }>;
    if (!tableCheck[0]?.exists) {
      return;
    }

    console.log("🔄 [MIGRATION] Checking if colors and imageUrl columns exist...");

    // Check if colors column exists
    const colorsCheck = (await db.$queryRawUnsafe(`
      SELECT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public'
        AND table_name = 'attribute_values' 
        AND column_name = 'colors'
      ) as exists;
    `)) as Array<{ exists: boolean }>;

    const colorsExists = colorsCheck[0]?.exists || false;

    // Check if imageUrl column exists
    const imageUrlCheck = (await db.$queryRawUnsafe(`
      SELECT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public'
        AND table_name = 'attribute_values' 
        AND column_name = 'imageUrl'
      ) as exists;
    `)) as Array<{ exists: boolean }>;

    const imageUrlExists = imageUrlCheck[0]?.exists || false;

    if (colorsExists && imageUrlExists) {
      console.log("✅ [MIGRATION] colors and imageUrl columns already exist");
      return;
    }

    console.log("📝 [MIGRATION] Adding missing columns...");

    // Add colors column if it doesn't exist
    if (!colorsExists) {
      await db.$executeRawUnsafe(`
        ALTER TABLE "attribute_values" ADD COLUMN IF NOT EXISTS "colors" JSONB DEFAULT '[]'::jsonb;
      `);
      console.log("✅ [MIGRATION] Added 'colors' column");
    }

    // Add imageUrl column if it doesn't exist
    if (!imageUrlExists) {
      await db.$executeRawUnsafe(`
        ALTER TABLE "attribute_values" ADD COLUMN IF NOT EXISTS "imageUrl" TEXT;
      `);
      console.log("✅ [MIGRATION] Added 'imageUrl' column");
    }

    // Create index if it doesn't exist
    await db.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS "attribute_values_colors_idx" 
      ON "attribute_values" USING GIN ("colors");
    `);

    console.log("✅ [MIGRATION] Migration completed successfully!");
  } catch (error: any) {
    console.error("❌ [MIGRATION] Error:", error.message);
    // Don't throw - let the application continue
  }
}




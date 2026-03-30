import { NextResponse } from "next/server";
import { adminService } from "@/lib/services/admin.service";

/**
 * Get currency exchange rates (public endpoint)
 */
export async function GET() {
  try {
    const settings = await adminService.getSettings();
    const rates = settings.currencyRates || {
      USD: 1,
    };
    
    return NextResponse.json(rates);
  } catch (error: any) {
    console.error("❌ [CURRENCY RATES] Error:", error);
    // Return default rates on error
    return NextResponse.json({
      USD: 1,
    });
  }
}


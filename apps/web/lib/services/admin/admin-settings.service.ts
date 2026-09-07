import { db } from "@white-shop/db";

import {
  parseHomeHeroConfigForAdmin,
  resolveHomeHeroInlineImagesForR2,
} from "@/lib/services/home-hero.service";
import { invalidateDiscountSettingsCache } from "@/lib/services/discount-settings-cache";
import { homeHeroConfigSchema } from "@/lib/validation/home-hero.schema";

class AdminSettingsService {
  /**
   * Get settings
   */
  async getSettings() {
    const settings = await db.settings.findMany({
      where: {
        key: {
          in: [
            "globalDiscount",
            "categoryDiscounts",
            "brandDiscounts",
            "defaultCurrency",
            "currencyRates",
            "homeHero",
          ],
        },
      },
    });

    const homeHeroRow = settings.find((s: { key: string }) => s.key === "homeHero");
    
    const globalDiscountSetting = settings.find((s: { key: string; value: string }) => s.key === 'globalDiscount');
    const categoryDiscountsSetting = settings.find((s: { key: string; value: string }) => s.key === 'categoryDiscounts');
    const brandDiscountsSetting = settings.find((s: { key: string; value: string }) => s.key === 'brandDiscounts');
    const defaultCurrencySetting = settings.find((s: { key: string; value: string }) => s.key === 'defaultCurrency');
    const currencyRatesSetting = settings.find((s: { key: string; value: string }) => s.key === 'currencyRates');
    
    // Default currency rates (fallback)
    const defaultCurrencyRates = {
      AMD: 1,
      USD: 1 / 400,
      RUB: 0.2,
    };
    
    return {
      globalDiscount: globalDiscountSetting ? Number(globalDiscountSetting.value) : 0,
      categoryDiscounts: categoryDiscountsSetting ? (categoryDiscountsSetting.value as Record<string, number>) : {},
      brandDiscounts: brandDiscountsSetting ? (brandDiscountsSetting.value as Record<string, number>) : {},
      defaultCurrency: defaultCurrencySetting ? (defaultCurrencySetting.value as string) : 'AMD',
      currencyRates: currencyRatesSetting ? (currencyRatesSetting.value as Record<string, number>) : defaultCurrencyRates,
      homeHero: parseHomeHeroConfigForAdmin(homeHeroRow?.value),
    };
  }

  /**
   * Update settings
   */
  async updateSettings(data: {
    globalDiscount?: number;
    categoryDiscounts?: Record<string, number>;
    brandDiscounts?: Record<string, number>;
    defaultCurrency?: string;
    currencyRates?: Record<string, number>;
    homeHero?: unknown;
  }) {
    console.log('⚙️ [ADMIN SERVICE] Updating settings...', data);
    
    // Update global discount
    if (data.globalDiscount !== undefined) {
      const globalDiscountValue = Number(data.globalDiscount) || 0;
      await db.settings.upsert({
        where: { key: 'globalDiscount' },
        update: {
          value: globalDiscountValue,
          updatedAt: new Date(),
        },
        create: {
          key: 'globalDiscount',
          value: globalDiscountValue,
          description: 'Global discount percentage for all products',
        },
      });
      console.log('✅ [ADMIN SERVICE] Global discount updated:', globalDiscountValue);
    }
    
    // Update category discounts
    if (data.categoryDiscounts !== undefined) {
      await db.settings.upsert({
        where: { key: 'categoryDiscounts' },
        update: {
          value: data.categoryDiscounts,
          updatedAt: new Date(),
        },
        create: {
          key: 'categoryDiscounts',
          value: data.categoryDiscounts,
          description: 'Discount percentages by category ID',
        },
      });
      console.log('✅ [ADMIN SERVICE] Category discounts updated:', data.categoryDiscounts);
    }
    
    // Update brand discounts
    if (data.brandDiscounts !== undefined) {
      await db.settings.upsert({
        where: { key: 'brandDiscounts' },
        update: {
          value: data.brandDiscounts,
          updatedAt: new Date(),
        },
        create: {
          key: 'brandDiscounts',
          value: data.brandDiscounts,
          description: 'Discount percentages by brand ID',
        },
      });
      console.log('✅ [ADMIN SERVICE] Brand discounts updated:', data.brandDiscounts);
    }
    
    // Update default currency
    if (data.defaultCurrency !== undefined) {
      const currencyValue = String(data.defaultCurrency).toUpperCase();
      await db.settings.upsert({
        where: { key: 'defaultCurrency' },
        update: {
          value: currencyValue,
          updatedAt: new Date(),
        },
        create: {
          key: 'defaultCurrency',
          value: currencyValue,
          description: 'Default storefront currency (AMD/USD/RUB)',
        },
      });
      console.log('✅ [ADMIN SERVICE] Default currency updated:', currencyValue);
    }
    
    // Update currency rates
    if (data.currencyRates !== undefined) {
      const rawRates = data.currencyRates;
      const normalizedRates: Record<string, number> = { AMD: 1 };
      const usd = Number(rawRates.USD);
      const rub = Number(rawRates.RUB);
      normalizedRates.USD = Number.isFinite(usd) && usd > 0 ? usd : 1 / 400;
      normalizedRates.RUB = Number.isFinite(rub) && rub > 0 ? rub : 0.2;

      await db.settings.upsert({
        where: { key: 'currencyRates' },
        update: {
          value: normalizedRates,
          updatedAt: new Date(),
        },
        create: {
          key: 'currencyRates',
          value: normalizedRates,
          description: 'Currency exchange rates using AMD as base (1 AMD = X)',
        },
      });
      console.log('✅ [ADMIN SERVICE] Currency rates updated:', normalizedRates);
    }

    if (data.homeHero !== undefined) {
      const withR2Urls = await resolveHomeHeroInlineImagesForR2(data.homeHero);
      const parsed = homeHeroConfigSchema.parse(withR2Urls);
      await db.settings.upsert({
        where: { key: "homeHero" },
        update: {
          value: parsed,
          updatedAt: new Date(),
        },
        create: {
          key: "homeHero",
          value: parsed,
          description: "Homepage hero carousel (images, copy, CTA per slide)",
        },
      });
      console.log("✅ [ADMIN SERVICE] Home hero updated:", parsed.slides.length, "slides");
    }

    if (data.globalDiscount !== undefined || data.categoryDiscounts !== undefined) {
      invalidateDiscountSettingsCache();
    }

    return { success: true };
  }

  /**
   * Get price filter settings
   */
  async getPriceFilterSettings() {
    console.log('⚙️ [ADMIN SERVICE] Fetching price filter settings...');
    const setting = await db.settings.findUnique({
      where: { key: 'price-filter' },
    });

    if (!setting) {
      console.log('✅ [ADMIN SERVICE] Price filter settings not found, returning defaults');
      return {
        minPrice: null,
        maxPrice: null,
        stepSize: null,
        stepSizePerCurrency: null,
      };
    }

    const value = setting.value as {
      minPrice?: number;
      maxPrice?: number;
      stepSize?: number;
      stepSizePerCurrency?: {
        RUB?: number;
        USD?: number;
      };
    };
    console.log('✅ [ADMIN SERVICE] Price filter settings loaded:', value);
    return {
      minPrice: value.minPrice ?? null,
      maxPrice: value.maxPrice ?? null,
      stepSize: value.stepSize ?? null,
      stepSizePerCurrency: value.stepSizePerCurrency ?? null,
    };
  }

  /**
   * Update price filter settings
   */
  async updatePriceFilterSettings(data: {
    minPrice?: number | null;
    maxPrice?: number | null;
    stepSize?: number | null;
    stepSizePerCurrency?: {
      USD?: number | null;
      /** Legacy stored settings only; new admin UI saves USD. */
      RUB?: number | null;
    } | null;
  }) {
    console.log('⚙️ [ADMIN SERVICE] Updating price filter settings...', data);
    
    const value: {
      minPrice?: number;
      maxPrice?: number;
      stepSize?: number;
      stepSizePerCurrency?: {
        USD?: number;
        RUB?: number;
      };
    } = {};
    
    if (data.minPrice !== null && data.minPrice !== undefined) {
      value.minPrice = data.minPrice;
    }
    if (data.maxPrice !== null && data.maxPrice !== undefined) {
      value.maxPrice = data.maxPrice;
    }
    if (data.stepSize !== null && data.stepSize !== undefined) {
      value.stepSize = data.stepSize;
    }
    if (data.stepSizePerCurrency) {
      const cleaned: { RUB?: number; USD?: number } = {};
      if (data.stepSizePerCurrency.RUB !== null && data.stepSizePerCurrency.RUB !== undefined) {
        cleaned.RUB = data.stepSizePerCurrency.RUB;
      }
      if (data.stepSizePerCurrency.USD !== null && data.stepSizePerCurrency.USD !== undefined) {
        cleaned.USD = data.stepSizePerCurrency.USD;
      }
      if (Object.keys(cleaned).length > 0) {
        value.stepSizePerCurrency = cleaned;
      }
    }

    const setting = await db.settings.upsert({
      where: { key: 'price-filter' },
      update: {
        value: value,
        updatedAt: new Date(),
      },
      create: {
        key: 'price-filter',
        value: value,
        description: 'Price filter default range and step size settings',
      },
    });

    console.log('✅ [ADMIN SERVICE] Price filter settings updated:', setting);
    const stored = setting.value as any;
    return {
      success: true,
      minPrice: stored.minPrice ?? null,
      maxPrice: stored.maxPrice ?? null,
      stepSize: stored.stepSize ?? null,
      stepSizePerCurrency: stored.stepSizePerCurrency ?? null,
    };
  }
}

export const adminSettingsService = new AdminSettingsService();




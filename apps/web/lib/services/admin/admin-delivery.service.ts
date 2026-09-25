import { db } from "@white-shop/db";
import { convertPrice } from "@/lib/currency";

/** Persisted shape for `delivery-locations` settings value. */
export type StoredDeliveryLocation = {
  id?: string;
  country: string;
  city: string;
  price: number;
  /** Minimum merchandise subtotal in AMD for free delivery; omit or 0 = disabled. */
  freeDeliveryFromAmd?: number;
};

function parseLocations(value: unknown): StoredDeliveryLocation[] {
  if (!value || typeof value !== "object") {
    return [];
  }
  const raw = (value as { locations?: unknown }).locations;
  return Array.isArray(raw) ? (raw as StoredDeliveryLocation[]) : [];
}

function findLocation(
  locations: StoredDeliveryLocation[],
  city: string,
  country: string,
): StoredDeliveryLocation | undefined {
  const cityNorm = city.toLowerCase().trim();
  const countryNorm = country.toLowerCase().trim();
  const exact = locations.find(
    (loc) =>
      loc.city.toLowerCase().trim() === cityNorm && loc.country.toLowerCase().trim() === countryNorm,
  );
  if (exact) {
    return exact;
  }
  return locations.find((loc) => loc.city.toLowerCase().trim() === cityNorm);
}

function applyFreeDeliveryThreshold(
  basePriceAmd: number,
  location: StoredDeliveryLocation,
  orderSubtotalUsd: number | undefined,
): number {
  const threshold = location.freeDeliveryFromAmd;
  if (
    orderSubtotalUsd === undefined ||
    !Number.isFinite(orderSubtotalUsd) ||
    orderSubtotalUsd < 0 ||
    typeof threshold !== "number" ||
    !Number.isFinite(threshold) ||
    threshold <= 0
  ) {
    return basePriceAmd;
  }
  const subtotalAmd = convertPrice(orderSubtotalUsd, "USD", "AMD");
  if (subtotalAmd >= threshold) {
    return 0;
  }
  return basePriceAmd;
}

class AdminDeliveryService {
  /**
   * Get delivery settings
   */
  async getDeliverySettings() {
    const setting = await db.settings.findUnique({
      where: { key: "delivery-locations" },
    });

    if (!setting) {
      return {
        locations: [] as StoredDeliveryLocation[],
      };
    }

    const value = setting.value as { locations?: StoredDeliveryLocation[] };
    return {
      locations: value.locations || [],
    };
  }

  /** Loads delivery cities once so checkout can overlap this read with cart pricing. */
  async loadLocations(): Promise<StoredDeliveryLocation[]> {
    const { locations } = await this.getDeliverySettings();
    return locations;
  }

  /**
   * Price in AMD for an already loaded location list.
   * When `orderSubtotalUsd` is set, free delivery may apply.
   */
  quotePrice(
    locations: StoredDeliveryLocation[],
    city: string,
    country: string = "Armenia",
    orderSubtotalUsd?: number,
  ): number {
    const location = findLocation(locations, city, country);
    if (!location) {
      return 0;
    }
    return applyFreeDeliveryThreshold(location.price, location, orderSubtotalUsd);
  }

  /**
   * Get delivery price for a specific city (AMD). When `orderSubtotalUsd` is set, free delivery may apply.
   */
  async getDeliveryPrice(city: string, country: string = "Armenia", orderSubtotalUsd?: number): Promise<number> {
    const locations = await this.loadLocations();
    return this.quotePrice(locations, city, country, orderSubtotalUsd);
  }

  /**
   * Update delivery settings
   */
  async updateDeliverySettings(data: { locations: StoredDeliveryLocation[] }) {
    if (!Array.isArray(data.locations)) {
      throw {
        status: 400,
        type: "https://api.shop.am/problems/validation-error",
        title: "Validation Error",
        detail: "Locations must be an array",
      };
    }

    for (const location of data.locations) {
      if (!location.country || !location.city) {
        throw {
          status: 400,
          type: "https://api.shop.am/problems/validation-error",
          title: "Validation Error",
          detail: "Each location must have country and city",
        };
      }
      if (typeof location.price !== "number" || location.price < 0 || !Number.isFinite(location.price)) {
        throw {
          status: 400,
          type: "https://api.shop.am/problems/validation-error",
          title: "Validation Error",
          detail: "Price must be a non-negative number",
        };
      }
      const free = location.freeDeliveryFromAmd;
      if (
        free !== undefined &&
        free !== null &&
        (typeof free !== "number" || !Number.isFinite(free) || free < 0)
      ) {
        throw {
          status: 400,
          type: "https://api.shop.am/problems/validation-error",
          title: "Validation Error",
          detail: "freeDeliveryFromAmd must be a non-negative number when provided",
        };
      }
    }

    const locationsWithIds = data.locations.map((location, index) => ({
      ...location,
      id: location.id || `location-${Date.now()}-${index}`,
    }));

    const setting = await db.settings.upsert({
      where: { key: "delivery-locations" },
      update: {
        value: { locations: locationsWithIds },
        updatedAt: new Date(),
      },
      create: {
        key: "delivery-locations",
        value: { locations: locationsWithIds },
        description: "Delivery prices by country and city",
      },
    });

    return {
      locations: (setting.value as { locations: StoredDeliveryLocation[] }).locations,
    };
  }
}

export const adminDeliveryService = new AdminDeliveryService();

import { t } from "../../i18n";

/**
 * Get "Out of Stock" translation for a given language
 */
export function getOutOfStockLabel(lang: string = "en"): string {
  return t(lang as "en" | "hy" | "ru", "common.stock.outOfStock");
}





/** True when the shopper saved PDP customize text on the line item. */
export function orderItemHasSavedCustomize(item: {
  customizePlain?: string | null;
  customizeHtml?: string | null;
}): boolean {
  return Boolean(item.customizePlain?.trim() || item.customizeHtml?.trim());
}

/** Orders stay "new" until fulfillment status leaves pending. */
export function isAdminOrderNew(status: string): boolean {
  return status === 'pending';
}

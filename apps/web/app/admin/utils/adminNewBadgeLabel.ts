export function getAdminNewBadgeLabel(
  t: (path: string) => string,
  fallback = 'New'
): string {
  const value = t('admin.common.newBadge');
  return value === 'admin.common.newBadge' ? fallback : value;
}

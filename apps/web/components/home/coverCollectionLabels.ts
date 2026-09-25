const COVER_COLLECTION_TITLE_PATH_BY_KEY: Record<string, string> = {
  classic: 'home.homepage.coverCollections.items.classic',
  premium: 'home.homepage.coverCollections.items.premium',
  atelier: 'home.homepage.coverCollections.items.atelier',
  'special-edition': 'home.homepage.coverCollections.items.specialEdition',
  special: 'home.homepage.coverCollections.items.specialEdition',
  Classic: 'home.homepage.coverCollections.items.classic',
  Premium: 'home.homepage.coverCollections.items.premium',
  Atelier: 'home.homepage.coverCollections.items.atelier',
  Special: 'home.homepage.coverCollections.items.specialEdition',
  'Special Edition': 'home.homepage.coverCollections.items.specialEdition',
};

/**
 * Homepage collection names from Figma. Unknown keys keep the source label
 * (DB title). Missing locale keys also keep the source label.
 */
export function resolveCoverCollectionTitle(
  key: string,
  fallback: string,
  translate: (path: string) => string,
): string {
  const path = COVER_COLLECTION_TITLE_PATH_BY_KEY[key];
  if (!path) {
    return fallback;
  }
  const label = translate(path);
  return label && label !== path ? label : fallback;
}

/**
 * Card → PDP handoff: the catalog card stores what it already renders (title, hero
 * image, price, badges) so the product page can paint real above-the-fold content
 * before the server payload resolves. Live data replaces it as soon as it arrives.
 */

/** Single sessionStorage entry — bounded blob instead of one key per product. */
const PRODUCT_PREVIEW_STORE_KEY = 'product-preview:v1';

/** Same window as the related-products cache; snapshots are display-only. */
const PRODUCT_PREVIEW_TTL_MS = 30 * 60 * 1000;

/** Keeps sessionStorage bounded during long catalog sessions (oldest evicted first). */
const MAX_PRODUCT_PREVIEW_ENTRIES = 24;

export interface ProductPreviewSnapshot {
  slug: string;
  title: string;
  price: number;
  image: string | null;
  images: string[];
  inStock: boolean;
  /** Collection key driving badge colors (`Classic`, `Special`, ...). */
  sectionLabel: string;
  /** Collection badge text as shown on the card. */
  categoryLabel: string;
}

interface ProductPreviewEntry {
  savedAt: number;
  snapshot: ProductPreviewSnapshot;
}

type ProductPreviewStore = Record<string, ProductPreviewEntry>;

const memoryStore = new Map<string, ProductPreviewEntry>();

function isFresh(entry: ProductPreviewEntry): boolean {
  return Date.now() - entry.savedAt < PRODUCT_PREVIEW_TTL_MS;
}

function isValidEntry(value: unknown): value is ProductPreviewEntry {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const entry = value as Partial<ProductPreviewEntry>;
  const snapshot = entry.snapshot;
  return (
    typeof entry.savedAt === 'number' &&
    Boolean(snapshot) &&
    typeof snapshot?.slug === 'string' &&
    typeof snapshot.title === 'string' &&
    typeof snapshot.price === 'number' &&
    typeof snapshot.inStock === 'boolean' &&
    Array.isArray(snapshot.images)
  );
}

function readStore(): ProductPreviewStore {
  if (typeof window === 'undefined') {
    return {};
  }

  try {
    const raw = window.sessionStorage.getItem(PRODUCT_PREVIEW_STORE_KEY);
    if (!raw) {
      return {};
    }
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      return {};
    }
    const store: ProductPreviewStore = {};
    for (const [slug, entry] of Object.entries(parsed as Record<string, unknown>)) {
      if (isValidEntry(entry) && isFresh(entry)) {
        store[slug] = entry;
      }
    }
    return store;
  } catch {
    return {};
  }
}

function writeStore(store: ProductPreviewStore): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.sessionStorage.setItem(PRODUCT_PREVIEW_STORE_KEY, JSON.stringify(store));
  } catch {
    // Quota / private mode — the in-memory store still serves this session.
  }
}

function pruneOldestEntries(store: ProductPreviewStore): ProductPreviewStore {
  const slugs = Object.keys(store);
  if (slugs.length <= MAX_PRODUCT_PREVIEW_ENTRIES) {
    return store;
  }

  const keptSlugs = slugs
    .sort((left, right) => store[right].savedAt - store[left].savedAt)
    .slice(0, MAX_PRODUCT_PREVIEW_ENTRIES);

  const pruned: ProductPreviewStore = {};
  for (const slug of keptSlugs) {
    pruned[slug] = store[slug];
  }
  return pruned;
}

/**
 * Persists the card's rendered product data for the PDP it links to.
 * Reload-safe (sessionStorage) and mirrored in memory for same-session navigations.
 */
export function saveProductPreview(snapshot: ProductPreviewSnapshot): void {
  const slug = snapshot.slug.trim();
  if (!slug) {
    return;
  }

  const entry: ProductPreviewEntry = { savedAt: Date.now(), snapshot: { ...snapshot, slug } };
  memoryStore.set(slug, entry);
  writeStore(pruneOldestEntries({ ...readStore(), [slug]: entry }));
}

/** Fresh card snapshot for the slug, or null when the PDP was opened without one. */
export function getProductPreview(slug: string): ProductPreviewSnapshot | null {
  const key = slug.trim();
  if (!key) {
    return null;
  }

  const memoryEntry = memoryStore.get(key);
  if (memoryEntry && isFresh(memoryEntry)) {
    return memoryEntry.snapshot;
  }

  const sessionEntry = readStore()[key];
  if (!sessionEntry) {
    return null;
  }

  memoryStore.set(key, sessionEntry);
  return sessionEntry.snapshot;
}

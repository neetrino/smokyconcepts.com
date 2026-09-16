export interface Category {
  id: string;
  slug: string;
  title: string;
  parentId: string | null;
  position?: number;
  requiresSizes?: boolean;
  priceAmd?: number;
  imageUrl?: string;
  children?: Category[];
}

export interface CategoryWithLevel extends Category {
  level: number;
}

export interface CategoryFormData {
  title: string;
  parentId: string;
  requiresSizes: boolean;
  priceAmd: string;
  imageUrl: string;
  subcategoryIds: string[];
}





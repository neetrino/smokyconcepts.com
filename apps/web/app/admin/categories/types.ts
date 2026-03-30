export interface Category {
  id: string;
  slug: string;
  title: string;
  parentId: string | null;
  requiresSizes?: boolean;
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
  imageUrl: string;
  subcategoryIds: string[];
}





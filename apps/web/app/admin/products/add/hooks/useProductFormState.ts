import { useState, useRef } from 'react';
import type { Category, Variant, ProductLabel, GeneratedVariant } from '../types';
import type { CurrencyCode } from '@/lib/currency';
import type { CategoryAttribute } from '@/lib/category-attributes';

export function useProductFormState() {
  const [loading, setLoading] = useState(false);
  const [loadingProduct, setLoadingProduct] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    descriptionHtml: '',
    primaryCategoryId: '',
    categoryIds: [] as string[],
    published: false,
    featured: false,
    upcoming: false,
    imageUrls: [] as string[],
    featuredImageIndex: 0,
    mainProductImage: '' as string,
    variants: [] as Variant[],
    labels: [] as ProductLabel[],
  });
  const [categoriesExpanded, setCategoriesExpanded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const variantImageInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [colorImageTarget, setColorImageTarget] = useState<{ variantId: string; colorValue: string } | null>(null);
  const [imageUploadLoading, setImageUploadLoading] = useState(false);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [useNewCategory, setUseNewCategory] = useState(false);
  const [defaultCurrency, setDefaultCurrency] = useState<CurrencyCode>('USD');
  const [productType, setProductType] = useState<'simple' | 'variable'>('variable');
  const [simpleProductData, setSimpleProductData] = useState({
    price: '',
    compareAtPrice: '',
    sku: '',
    quantity: '',
  });
  const [generatedVariants, setGeneratedVariants] = useState<GeneratedVariant[]>([]);
  const [hasVariantsToLoad, setHasVariantsToLoad] = useState(false);
  const [categoryAttributes, setCategoryAttributes] = useState<CategoryAttribute[]>([]);
  const [selectedAttributeValueIds, setSelectedAttributeValueIds] = useState<Record<string, string[]>>({});
  /** Which global attributes participate in this product (checkbox in Select attributes). */
  const [enabledAttributeIds, setEnabledAttributeIds] = useState<Record<string, boolean>>({});

  return {
    loading,
    setLoading,
    loadingProduct,
    setLoadingProduct,
    categories,
    setCategories,
    formData,
    setFormData,
    categoriesExpanded,
    setCategoriesExpanded,
    fileInputRef,
    variantImageInputRefs,
    colorImageTarget,
    setColorImageTarget,
    imageUploadLoading,
    setImageUploadLoading,
    imageUploadError,
    setImageUploadError,
    newCategoryName,
    setNewCategoryName,
    useNewCategory,
    setUseNewCategory,
    defaultCurrency,
    setDefaultCurrency,
    productType,
    setProductType,
    simpleProductData,
    setSimpleProductData,
    generatedVariants,
    setGeneratedVariants,
    hasVariantsToLoad,
    setHasVariantsToLoad,
    categoryAttributes,
    setCategoryAttributes,
    selectedAttributeValueIds,
    setSelectedAttributeValueIds,
    enabledAttributeIds,
    setEnabledAttributeIds,
  };
}


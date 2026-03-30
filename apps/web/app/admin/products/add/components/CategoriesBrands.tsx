'use client';

import { useState } from 'react';
import { Input } from '@shop/ui';
import { useTranslation } from '../../../../../lib/i18n-client';
import type { Category, Variant } from '../types';

interface CategoriesBrandsProps {
  categories: Category[];
  categoryIds: string[];
  categoriesExpanded: boolean;
  useNewCategory: boolean;
  newCategoryName: string;
  onCategoriesExpandedChange: (expanded: boolean) => void;
  onUseNewCategoryChange: (useNew: boolean) => void;
  onNewCategoryNameChange: (name: string) => void;
  onCategoryIdsChange: (ids: string[]) => void;
  onPrimaryCategoryIdChange: (id: string) => void;
  onCreateCategory: (name: string) => Promise<void>;
  isClothingCategory: () => boolean;
  onVariantsUpdate?: (updater: (prev: Variant[]) => Variant[]) => void;
}

export function CategoriesBrands({
  categories,
  categoryIds,
  categoriesExpanded,
  useNewCategory,
  newCategoryName,
  onCategoriesExpandedChange,
  onUseNewCategoryChange,
  onNewCategoryNameChange,
  onCategoryIdsChange,
  onPrimaryCategoryIdChange,
  onCreateCategory,
  isClothingCategory,
  onVariantsUpdate,
}: CategoriesBrandsProps) {
  const { t } = useTranslation();
  const [creatingCategory, setCreatingCategory] = useState(false);

  const parseCategoryNames = (rawValue: string): string[] => {
    const parsed = rawValue
      .split(/[,\n;]+/)
      .map((name) => name.trim())
      .filter((name) => name.length > 0);

    return Array.from(new Set(parsed.map((name) => name.toLocaleLowerCase()))).map(
      (normalizedName) =>
        parsed.find((name) => name.toLocaleLowerCase() === normalizedName) ?? normalizedName
    );
  };

  const handleCreateCategory = async () => {
    const categoryNames = parseCategoryNames(newCategoryName);
    if (creatingCategory || categoryNames.length === 0) {
      return;
    }

    setCreatingCategory(true);
    try {
      for (const categoryName of categoryNames) {
        const existingCategory = categories.find(
          (category) => category.title.trim().toLocaleLowerCase() === categoryName.toLocaleLowerCase()
        );
        if (existingCategory) {
          if (!categoryIds.includes(existingCategory.id)) {
            handleCategoryChange(existingCategory.id, true);
          }
          continue;
        }

        await onCreateCategory(categoryName);
      }
      onNewCategoryNameChange('');
      onUseNewCategoryChange(false);
      onCategoriesExpandedChange(true);
    } catch {
      // Keep current input so user can retry.
    } finally {
      setCreatingCategory(false);
    }
  };

  const buildCategoryTree = () => {
    const categoryMap = new Map<string, Category & { children: Category[] }>();
    const rootCategories: (Category & { children: Category[] })[] = [];

    categories.forEach((category) => {
      categoryMap.set(category.id, { ...category, children: [] });
    });

    categories.forEach((category) => {
      if (category.parentId && categoryMap.has(category.parentId)) {
        const parent = categoryMap.get(category.parentId)!;
        const child = categoryMap.get(category.id)!;
        parent.children.push(child);
      } else {
        rootCategories.push(categoryMap.get(category.id)!);
      }
    });

    const flattenTree = (
      nodes: (Category & { children: Category[] })[],
      result: (Category & { isSubcategory: boolean })[] = []
    ): (Category & { isSubcategory: boolean })[] => {
      nodes.forEach((node) => {
        result.push({ ...node, isSubcategory: false });
        if (node.children && node.children.length > 0) {
          node.children.forEach((child) => {
            result.push({ ...child, isSubcategory: true });
          });
        }
      });
      return result;
    };

    return flattenTree(rootCategories);
  };

  const displayCategories = buildCategoryTree();
  const selectedCategories = categories.filter((category) => categoryIds.includes(category.id));

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    const newCategoryIds = checked
      ? [...categoryIds, categoryId]
      : categoryIds.filter((id) => id !== categoryId);

    const newPrimaryCategoryId = newCategoryIds.length > 0 ? newCategoryIds[0] : '';
    const selectedCategory = categories.find((cat) => cat.id === categoryId);
    const newIsSizeRequired = selectedCategory?.requiresSizes ?? false;

    onCategoryIdsChange(newCategoryIds);
    onPrimaryCategoryIdChange(newPrimaryCategoryId);

    if (onVariantsUpdate) {
      const wasSizeRequired = isClothingCategory();
      if (wasSizeRequired && !newIsSizeRequired && newCategoryIds.length === 0) {
        onVariantsUpdate((prev) =>
          prev.map((v) => ({
            ...v,
            sizes: [],
            sizeStocks: {},
          }))
        );
      }
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('admin.products.add.categoriesAndBrands')}</h2>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t('admin.products.add.categories')} <span className="text-gray-500 font-normal">{t('admin.products.add.selectMultiple')}</span>
        </label>
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <input
              type="radio"
              id="select-category"
              name="category-mode"
              checked={!useNewCategory}
              onChange={() => {
                onUseNewCategoryChange(false);
                onNewCategoryNameChange('');
              }}
              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <label htmlFor="select-category" className="text-sm text-gray-700">
              {t('admin.products.add.selectExistingCategories')}
            </label>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <input
              type="radio"
              id="new-category"
              name="category-mode"
              checked={useNewCategory}
              onChange={() => onUseNewCategoryChange(true)}
              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <label htmlFor="new-category" className="text-sm text-gray-700">
              {t('admin.products.add.addNewCategory')}
            </label>
          </div>
          {!useNewCategory ? (
            <div className="relative" data-category-dropdown>
              <button
                type="button"
                onClick={() => onCategoriesExpandedChange(!categoriesExpanded)}
                className="w-full px-3 py-2 text-left border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm flex items-center justify-between"
              >
                <span className="text-gray-700">
                  {categoryIds.length === 0
                    ? t('admin.products.add.selectCategories')
                    : categoryIds.length === 1
                      ? t('admin.products.add.categorySelected').replace('{count}', categoryIds.length.toString())
                      : t('admin.products.add.categoriesSelected').replace('{count}', categoryIds.length.toString())}
                </span>
                <svg
                  className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${categoriesExpanded ? 'transform rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {categoriesExpanded && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  <div className="p-2">
                    <div className="space-y-1">
                      {displayCategories.map((category) => (
                        <label
                          key={category.id}
                          className={`flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded ${category.isSubcategory ? 'pl-6' : ''}`}
                        >
                          <input
                            type="checkbox"
                            checked={categoryIds.includes(category.id)}
                            onChange={(e) => handleCategoryChange(category.id, e.target.checked)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className={`text-gray-700 ${category.isSubcategory ? 'text-xs' : 'text-sm font-semibold'}`}>
                            {category.title}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex w-full items-center gap-3">
                <Input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => onNewCategoryNameChange(e.target.value)}
                  placeholder={t('admin.products.add.enterNewCategoryName')}
                  className="w-full"
                />
                <button
                  type="button"
                  onClick={() => {
                    void handleCreateCategory();
                  }}
                  disabled={creatingCategory || !newCategoryName.trim()}
                  className="h-10 rounded-md bg-slate-900 px-6 text-sm font-semibold text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {creatingCategory ? t('admin.products.add.creating') : t('admin.products.add.addCategoryButton')}
                </button>
              </div>
            </div>
          )}
        </div>
        {selectedCategories.length > 0 && (
          <div className="mt-4">
            <p className="mb-2 text-sm text-gray-600">{t('admin.products.add.addedCategories')}</p>
            <div className="flex flex-wrap gap-2">
              {selectedCategories.map((category) => (
                <span
                  key={category.id}
                  className="inline-flex items-center gap-2 rounded-xl border border-blue-400 bg-white px-4 py-1.5 text-sm font-medium text-slate-900"
                >
                  {category.title}
                  <button
                    type="button"
                    onClick={() => handleCategoryChange(category.id, false)}
                    className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs text-white hover:bg-blue-700"
                    aria-label={`Remove ${category.title}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

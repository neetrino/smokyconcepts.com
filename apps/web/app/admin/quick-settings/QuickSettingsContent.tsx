'use client';

import { Card } from '@shop/ui';
import { useRouter } from 'next/navigation';
import { useTranslation } from '../../../lib/i18n-client';
import { AdminSidebar } from './components/AdminSidebar';
import { GlobalDiscountCard } from './components/GlobalDiscountCard';
import { QuickInfoCard } from './components/QuickInfoCard';
import { CategoryDiscountsCard } from './components/CategoryDiscountsCard';
import { ProductDiscountsCard, type Product } from './components/ProductDiscountsCard';
import { ADMIN_PAGE_SHELL_CLASS } from '../constants/adminShell.constants';

interface AdminCategory {
  id: string;
  title: string;
  parentId: string | null;
}

interface QuickSettingsContentProps {
  currentPath: string;
  router: ReturnType<typeof useRouter>;
  t: ReturnType<typeof useTranslation>['t'];
  globalDiscount: number;
  setGlobalDiscount: (value: number) => void;
  discountLoading: boolean;
  discountSaving: boolean;
  handleDiscountSave: () => void;
  categories: AdminCategory[];
  categoriesLoading: boolean;
  categoryDiscounts: Record<string, number>;
  updateCategoryDiscountValue: (categoryId: string, value: string) => void;
  clearCategoryDiscount: (categoryId: string) => void;
  handleCategoryDiscountSave: () => void;
  categorySaving: boolean;
  products: Product[];
  productsLoading: boolean;
  productDiscounts: Record<string, number>;
  setProductDiscounts: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  handleProductDiscountSave: (productId: string) => void;
  savingProductId: string | null;
}

export function QuickSettingsContent({
  currentPath,
  router,
  t,
  globalDiscount,
  setGlobalDiscount,
  discountLoading,
  discountSaving,
  handleDiscountSave,
  categories,
  categoriesLoading,
  categoryDiscounts,
  updateCategoryDiscountValue,
  clearCategoryDiscount,
  handleCategoryDiscountSave,
  categorySaving,
  products,
  productsLoading,
  productDiscounts,
  setProductDiscounts,
  handleProductDiscountSave,
  savingProductId,
}: QuickSettingsContentProps) {
  return (
    <div className={ADMIN_PAGE_SHELL_CLASS}>
      <div className="w-full px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{t('admin.quickSettings.title')}</h1>
          <p className="text-gray-600 mt-2">{t('admin.quickSettings.subtitle')}</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <AdminSidebar currentPath={currentPath} router={router} t={t} />

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Quick Settings - Discount Management */}
            <Card className="p-6 mb-8 bg-white border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{t('admin.quickSettings.quickSettingsTitle')}</h2>
                  <p className="text-sm text-gray-600 mt-1">{t('admin.quickSettings.quickSettingsSubtitle')}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <GlobalDiscountCard
                  globalDiscount={globalDiscount}
                  setGlobalDiscount={setGlobalDiscount}
                  discountLoading={discountLoading}
                  discountSaving={discountSaving}
                  handleDiscountSave={handleDiscountSave}
                />

                <QuickInfoCard />
              </div>
            </Card>

            <CategoryDiscountsCard
              categories={categories}
              categoriesLoading={categoriesLoading}
              categoryDiscounts={categoryDiscounts}
              updateCategoryDiscountValue={updateCategoryDiscountValue}
              clearCategoryDiscount={clearCategoryDiscount}
              handleCategoryDiscountSave={handleCategoryDiscountSave}
              categorySaving={categorySaving}
            />

            <ProductDiscountsCard
              products={products}
              productsLoading={productsLoading}
              productDiscounts={productDiscounts}
              setProductDiscounts={setProductDiscounts}
              handleProductDiscountSave={handleProductDiscountSave}
              savingProductId={savingProductId}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

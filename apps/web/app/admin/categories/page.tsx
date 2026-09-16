'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/auth/AuthContext';
import { useTranslation } from '../../../lib/i18n-client';
import { useCategories } from './hooks/useCategories';
import { useCategoryActions } from './hooks/useCategoryActions';
import { AdminShell } from '../components/AdminShell';
import { CategoriesList } from './components/CategoriesList';
import { AddCategoryDrawer } from './components/AddCategoryDrawer';
import { EditCategoryDrawer } from './components/EditCategoryDrawer';
import { ADMIN_CENTERED_LOADING_CLASS, ADMIN_PAGE_SHELL_CLASS } from '../constants/adminShell.constants';

export default function CategoriesPage() {
  const { t } = useTranslation();
  const { isLoggedIn, isAdmin, isLoading } = useAuth();
  const router = useRouter();
  const { categories, loading, reordering, fetchCategories, reorderSiblings } = useCategories();
  const {
    showAddModal,
    showEditModal,
    editingCategory,
    formData,
    saving,
    setShowAddModal,
    setShowEditModal,
    setFormData,
    handleAddCategory,
    handleEditCategory,
    handleUpdateCategory,
    handleDeleteCategory,
    resetForm,
  } = useCategoryActions();

  useEffect(() => {
    if (!isLoading) {
      if (!isLoggedIn || !isAdmin) {
        router.push('/supersudo');
        return;
      }
    }
  }, [isLoggedIn, isAdmin, isLoading, router]);

  if (isLoading) {
    return (
      <div className={ADMIN_CENTERED_LOADING_CLASS}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#122a26] mx-auto mb-4" />
          <p className="text-[#414141]/70">{t('admin.common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn || !isAdmin) {
    return null;
  }

  return (
    <div className={ADMIN_PAGE_SHELL_CLASS}>
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <AdminShell>
          <div className="overflow-hidden rounded-2xl border border-[#dcc090]/30 bg-white/90 shadow-[0_8px_30px_rgba(18,42,38,0.06)]">
            <div className="flex items-center justify-between border-b border-[#dcc090]/20 bg-[#122a26] px-6 py-4">
              <h2 className="text-base font-black uppercase tracking-[0.1em] text-[#dcc090]">
                {t('admin.categories.title')}
              </h2>
              <button
                type="button"
                onClick={() => { resetForm(); setShowAddModal(true); }}
                className="flex items-center gap-2 rounded-lg border border-[#dcc090]/40 bg-[#dcc090]/15 px-4 py-2 text-xs font-bold text-[#dcc090] transition-all hover:bg-[#dcc090]/25 hover:border-[#dcc090]"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {t('admin.categories.addCategory')}
              </button>
            </div>

            <div className="p-6">
              {loading ? (
                <div className="py-8 text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#122a26] mx-auto mb-3" />
                  <p className="text-sm text-[#414141]/60">{t('admin.categories.loadingCategories')}</p>
                </div>
              ) : (
                <CategoriesList
                  categories={categories}
                  reordering={reordering}
                  onEdit={handleEditCategory}
                  onDelete={(categoryId, categoryTitle) =>
                    handleDeleteCategory(categoryId, categoryTitle, fetchCategories)
                  }
                  onReorderSiblings={reorderSiblings}
                />
              )}
            </div>
          </div>
        </AdminShell>
      </div>

      <AddCategoryDrawer
        isOpen={showAddModal}
        formData={formData}
        categories={categories}
        saving={saving}
        onClose={() => { setShowAddModal(false); resetForm(); }}
        onFormDataChange={setFormData}
        onSubmit={() => handleAddCategory(fetchCategories)}
      />

      <EditCategoryDrawer
        isOpen={showEditModal}
        editingCategory={editingCategory}
        formData={formData}
        categories={categories}
        saving={saving}
        onClose={() => { setShowEditModal(false); resetForm(); }}
        onFormDataChange={setFormData}
        onSubmit={() => handleUpdateCategory(fetchCategories)}
      />
    </div>
  );
}

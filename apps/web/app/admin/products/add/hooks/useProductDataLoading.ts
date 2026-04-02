import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { apiClient } from '@/lib/api-client';
import type { Category } from '../types';

interface UseProductDataLoadingProps {
  isLoggedIn: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  setCategories: (categories: Category[]) => void;
  categoriesExpanded: boolean;
  setCategoriesExpanded: (expanded: boolean) => void;
}

export function useProductDataLoading({
  isLoggedIn,
  isAdmin,
  isLoading,
  setCategories,
  categoriesExpanded,
  setCategoriesExpanded,
}: UseProductDataLoadingProps) {
  const router = useRouter();

  // Auth check
  useEffect(() => {
    if (!isLoading) {
      if (!isLoggedIn || !isAdmin) {
        router.push('/admin');
        return;
      }
    }
  }, [isLoggedIn, isAdmin, isLoading, router]);

  // Fetch categories once when admin is ready (setCategories is stable from useState)
  useEffect(() => {
    if (!isLoggedIn || !isAdmin) return;
    const fetchData = async () => {
      try {
        const categoriesRes = await apiClient.get<{ data: Category[] }>('/api/v1/admin/categories');
        setCategories(categoriesRes.data || []);
      } catch (err: unknown) {
        console.error('❌ [ADMIN] Error fetching data:', err);
      }
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only run when auth is ready
  }, [isLoggedIn, isAdmin]);

  // Close category dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (categoriesExpanded && !target.closest('[data-category-dropdown]')) {
        setCategoriesExpanded(false);
      }
    };

    if (categoriesExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [categoriesExpanded, setCategoriesExpanded]);
}



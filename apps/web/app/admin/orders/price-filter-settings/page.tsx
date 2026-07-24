'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { Card, Button, Input } from '@shop/ui';
import { apiClient } from '@/lib/api-client';
import { AdminMenuDrawer, type AdminMenuItem } from '@/components/AdminMenuDrawer';
import { getAdminMenuTABS } from '../../admin-menu.config';
import {
  ADMIN_FIXED_SIDEBAR_CLASS,
  ADMIN_FIXED_SIDEBAR_SPACER_CLASS,
} from '../../constants/adminShell.constants';
import { getAdminSidebarNavIndentClass } from '../../utils/adminMenuIndent';
import { useTranslation } from '@/lib/i18n-client';

export default function PriceFilterSettingsPage() {
  const { t } = useTranslation();
  const { isLoggedIn, isAdmin, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [stepSizeUsd, setStepSizeUsd] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Храним предыдущее значение stepSize для расчета разницы
  const prevStepSizeRef = useRef<string>('');
  const isUpdatingRef = useRef<boolean>(false);

  const fetchSettings = useCallback(async () => {
    try {
      console.log('⚙️ [PRICE FILTER SETTINGS] Fetching settings...');
      setLoading(true);
      const response = await apiClient.get<{
        minPrice?: number;
        maxPrice?: number;
        stepSize?: number;
        stepSizePerCurrency?: {
          RUB?: number;
          USD?: number;
        };
      }>('/api/v1/admin/settings/price-filter');
      const minPriceStr = response.minPrice?.toString() || '';
      const maxPriceStr = response.maxPrice?.toString() || '';
      const per = response.stepSizePerCurrency || {};
      const fallbackStep = response.stepSize?.toString() || '';
      
      setMinPrice(minPriceStr);
      setMaxPrice(maxPriceStr);
      const stepFromPer = per.USD !== undefined ? per.USD : per.RUB;
      setStepSizeUsd(stepFromPer !== undefined ? stepFromPer.toString() : fallbackStep);
      prevStepSizeRef.current = fallbackStep;
      
      console.log('✅ [PRICE FILTER SETTINGS] Settings loaded:', response);
    } catch (err: any) {
      console.error('❌ [PRICE FILTER SETTINGS] Error fetching settings:', err);
      // If settings don't exist, use empty values
      setMinPrice('');
      setMaxPrice('');
      setStepSizeUsd('');
      prevStepSizeRef.current = '';
    } finally {
      setLoading(false);
    }
  }, []);

  // Base step size (USD) — syncs minPrice / maxPrice when both are set
  const handleStepSizeChange = (newValue: string) => {
    if (isUpdatingRef.current) return;
    
    const prevStep = prevStepSizeRef.current;
    
    // Если предыдущее значение пустое, просто обновляем
    if (!prevStep) {
      prevStepSizeRef.current = newValue;
      setStepSizeUsd(newValue);
      return;
    }
    
    const prevStepNum = parseFloat(prevStep);
    const newStepNum = parseFloat(newValue);
    
    // Если новое значение невалидно, просто обновляем stepSize
    if (isNaN(newStepNum) || newValue.trim() === '') {
      prevStepSizeRef.current = newValue;
      setStepSizeUsd(newValue);
      return;
    }
    
    // Вычисляем разницу
    const difference = newStepNum - prevStepNum;
    
    // Применяем разницу к minPrice и maxPrice, если они заполнены
    const prevMin = minPrice.trim();
    const prevMax = maxPrice.trim();
    
    if (prevMin && prevMax) {
      const prevMinNum = parseFloat(prevMin);
      const prevMaxNum = parseFloat(prevMax);
      
      if (!isNaN(prevMinNum) && !isNaN(prevMaxNum)) {
        const newMinNum = prevMinNum + difference;
        const newMaxNum = prevMaxNum + difference;
        
        // Обновляем все значения
        isUpdatingRef.current = true;
        setStepSizeUsd(newValue);
        setMinPrice(newMinNum > 0 ? newMinNum.toString() : '');
        setMaxPrice(newMaxNum > 0 ? newMaxNum.toString() : '');
        prevStepSizeRef.current = newValue;
        
        console.log('🔄 [PRICE FILTER] StepSize changed:', {
          prevStep: prevStepNum,
          newStep: newStepNum,
          difference,
          prevMin: prevMinNum,
          newMin: newMinNum,
          prevMax: prevMaxNum,
          newMax: newMaxNum
        });
        
        // Сбрасываем флаг после небольшой задержки
        setTimeout(() => {
          isUpdatingRef.current = false;
        }, 0);
        return;
      }
    }
    
    // Если min/max не заполнены, просто обновляем stepSize
    prevStepSizeRef.current = newValue;
    setStepSizeUsd(newValue);
  };

  const handleSave = async () => {
    const minValue = minPrice.trim() ? parseFloat(minPrice) : null;
    const maxValue = maxPrice.trim() ? parseFloat(maxPrice) : null;
    const stepValueUsd = stepSizeUsd.trim() ? parseFloat(stepSizeUsd) : null;

    if (minValue !== null && (isNaN(minValue) || minValue < 0)) {
      alert(t('admin.priceFilter.minPriceInvalid'));
      return;
    }

    if (maxValue !== null && (isNaN(maxValue) || maxValue < 0)) {
      alert(t('admin.priceFilter.maxPriceInvalid'));
      return;
    }

    const validateStep = (value: number | null, label: string) => {
      if (value !== null && (isNaN(value) || value <= 0)) {
        alert(t('admin.priceFilter.stepSizeInvalid').replace('{label}', label));
        return false;
      }
      return true;
    };

    if (!validateStep(stepValueUsd, t('admin.priceFilter.stepSizeUsd'))) return;

    if (minValue !== null && maxValue !== null && minValue >= maxValue) {
      alert(t('admin.priceFilter.minMustBeLess'));
      return;
    }

    setSaving(true);
    try {
      console.log('⚙️ [PRICE FILTER SETTINGS] Saving settings...', {
        minValue,
        maxValue,
        stepValueUsd,
      });

      const stepSizePerCurrency: {
        USD?: number;
      } = {};

      if (stepValueUsd !== null) stepSizePerCurrency.USD = stepValueUsd;
      await apiClient.put('/api/v1/admin/settings/price-filter', {
        minPrice: minValue,
        maxPrice: maxValue,
        stepSize: stepValueUsd,
        stepSizePerCurrency: Object.keys(stepSizePerCurrency).length ? stepSizePerCurrency : null,
      });
      
      alert(t('admin.priceFilter.savedSuccess'));
      console.log('✅ [PRICE FILTER SETTINGS] Settings saved');
    } catch (err: any) {
      console.error('❌ [PRICE FILTER SETTINGS] Error saving settings:', err);
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to save';
      alert(t('admin.priceFilter.errorSaving').replace('{message}', errorMessage));
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (!isLoading && isLoggedIn && isAdmin) {
      fetchSettings();
    }
  }, [isLoading, isLoggedIn, isAdmin, fetchSettings]);

  useEffect(() => {
    if (!isLoading) {
      if (!isLoggedIn) {
        console.log('❌ [PRICE FILTER SETTINGS] User not logged in, redirecting to login...');
        router.push('/login');
        return;
      }
      if (!isAdmin) {
        console.log('❌ [PRICE FILTER SETTINGS] User is not admin, redirecting to home...');
        router.push('/');
        return;
      }
    }
  }, [isLoggedIn, isAdmin, isLoading, router]);

  // Get current path to highlight active tab
  const [currentPath, setCurrentPath] = useState(pathname || '/supersudo');
  
  useEffect(() => {
    if (pathname) {
      setCurrentPath(pathname);
    }
  }, [pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('admin.common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn || !isAdmin) {
    return null; // Will redirect
  }

  const adminTabs = getAdminMenuTABS(t);

  return (
    <div className="min-h-screen bg-[#efefef] pt-[3.75rem] pb-8">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:hidden mb-6">
            <AdminMenuDrawer tabs={adminTabs} currentPath={currentPath} />
          </div>
          {/* Sidebar Navigation */}
          <aside className={ADMIN_FIXED_SIDEBAR_CLASS}>
            <nav className="h-full space-y-1 overflow-y-auto border-r border-[#dcc090]/25 bg-[#122a26] p-3">
              {adminTabs.map((tab: AdminMenuItem) => {
                const isActive = currentPath === tab.path || 
                  (tab.path === '/supersudo' && currentPath === '/supersudo') ||
                  (tab.path !== '/supersudo' && currentPath.startsWith(tab.path));
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      router.push(tab.path);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-all ${getAdminSidebarNavIndentClass(
                      tab
                    )} ${
                      isActive
                        ? 'bg-[#dcc090] text-[#122a26]'
                        : 'text-[#dcc090]/75 hover:bg-white/5 hover:text-[#dcc090]'
                    }`}
                  >
                    <span className={`flex-shrink-0 ${isActive ? 'text-[#122a26]' : 'text-[#dcc090]/65'}`}>
                      {tab.icon}
                    </span>
                    <span className="text-left">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </aside>
          <div className={ADMIN_FIXED_SIDEBAR_SPACER_CLASS} aria-hidden="true" />

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <Card className="p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('admin.priceFilter.priceFilterDefaultRange')}</h2>
                <p className="text-sm text-gray-600">
                  {t('admin.priceFilter.stepSizeDescription')}
                </p>
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
                  <p className="text-gray-600">{t('admin.priceFilter.loadingSettings')}</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('admin.priceFilter.stepSizeUsd')}
                      </label>
                      <Input
                        type="number"
                        value={stepSizeUsd}
                        onChange={(e) => handleStepSizeChange(e.target.value)}
                        placeholder="100"
                        min="1"
                        step="1"
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div className="bg-[#dcc090]/15 border border-[#dcc090]/30 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-[#122a26] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="text-sm text-[#122a26]">
                        <p className="font-medium mb-1">{t('admin.priceFilter.howItWorks')}</p>
                        <ul className="list-disc list-inside space-y-1 text-[#414141]/75">
                          <li>{t('admin.priceFilter.stepSizeControls')}</li>
                          <li>{t('admin.priceFilter.defaultRange')}</li>
                          <li>{t('admin.priceFilter.usersCanAdjust')}</li>
                          <li>{t('admin.priceFilter.changesTakeEffect')}</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="primary"
                      onClick={handleSave}
                      disabled={saving}
                      className="px-6"
                    >
                      {saving ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>{t('admin.priceFilter.saving')}</span>
                        </div>
                      ) : (
                        t('admin.priceFilter.saveSettings')
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setMinPrice('');
                        setMaxPrice('');
                        setStepSizeUsd('');
                        prevStepSizeRef.current = '';
                      }}
                    >
                      {t('admin.priceFilter.clear')}
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}


'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../../../lib/auth/AuthContext';
import { Card, Button } from '@shop/ui';
import { apiClient } from '../../../lib/api-client';
import { AdminMenuDrawer } from '../../../components/AdminMenuDrawer';
import { useTranslation } from '../../../lib/i18n-client';
import { getAdminMenuTABS } from '../admin-menu.config';
import {
  ADMIN_FIXED_SIDEBAR_CLASS,
  ADMIN_FIXED_SIDEBAR_SPACER_CLASS,
} from '../constants/adminShell.constants';
import { getAdminSidebarNavIndentClass } from '../utils/adminMenuIndent';

interface DeliveryLocation {
  id?: string;
  country: string;
  city: string;
  price: number;
  /** Minimum cart merchandise subtotal in AMD for free delivery; 0 = disabled. */
  freeDeliveryFromAmd?: number;
}

interface DeliverySettings {
  locations: DeliveryLocation[];
}

export default function DeliveryPage() {
  const { t } = useTranslation();
  const { isLoggedIn, isAdmin, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [locations, setLocations] = useState<DeliveryLocation[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading) {
      if (!isLoggedIn || !isAdmin) {
        router.push('/supersudo');
        return;
      }
    }
  }, [isLoggedIn, isAdmin, isLoading, router]);

  useEffect(() => {
    if (isLoggedIn && isAdmin) {
      fetchDeliverySettings();
    }
  }, [isLoggedIn, isAdmin]);

  const fetchDeliverySettings = async () => {
    try {
      setLoading(true);
      console.log('🚚 [ADMIN] Fetching delivery settings...');
      const data = await apiClient.get<DeliverySettings>('/api/v1/admin/delivery');
      const raw = data.locations || [];
      setLocations(
        raw.map((loc) => ({
          ...loc,
          freeDeliveryFromAmd:
            typeof loc.freeDeliveryFromAmd === 'number' && Number.isFinite(loc.freeDeliveryFromAmd)
              ? loc.freeDeliveryFromAmd
              : 0,
        })),
      );
      console.log('✅ [ADMIN] Delivery settings loaded:', data);
    } catch (err: any) {
      console.error('❌ [ADMIN] Error fetching delivery settings:', err);
      // Use defaults if error
      setLocations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      console.log('🚚 [ADMIN] Saving delivery settings...', { locations });
      await apiClient.put('/api/v1/admin/delivery', { locations });
      alert(t('admin.delivery.savedSuccess'));
      console.log('✅ [ADMIN] Delivery settings saved');
      setEditingId(null);
      await fetchDeliverySettings();
    } catch (err: any) {
      console.error('❌ [ADMIN] Error saving delivery settings:', err);
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to save delivery settings';
      alert(t('admin.delivery.errorSaving').replace('{message}', errorMessage));
    } finally {
      setSaving(false);
    }
  };

  const handleAddLocation = () => {
    setLocations([...locations, { country: '', city: '', price: 1000, freeDeliveryFromAmd: 0 }]);
    setEditingId(`new-${Date.now()}`);
  };

  const handleUpdateLocation = (index: number, field: keyof DeliveryLocation, value: string | number) => {
    const updated = [...locations];
    updated[index] = { ...updated[index], [field]: value };
    setLocations(updated);
  };

  const handleDeleteLocation = (index: number) => {
    if (confirm(t('admin.delivery.deleteLocation'))) {
      const updated = locations.filter((_, i) => i !== index);
      setLocations(updated);
    }
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#122a26] mx-auto mb-4"></div>
          <p className="text-[#414141]/70">{t('admin.common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn || !isAdmin) {
    return null;
  }

  const adminTabs = getAdminMenuTABS(t);

  return (
    <div className="min-h-screen bg-[#efefef] pt-[3.75rem] pb-8">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:hidden mb-6">
            <AdminMenuDrawer tabs={adminTabs} currentPath="/supersudo/delivery" />
          </div>
          {/* Sidebar Navigation */}
          <aside className={ADMIN_FIXED_SIDEBAR_CLASS}>
            <nav className="h-full space-y-1 overflow-y-auto border-r border-[#dcc090]/25 bg-[#122a26] p-3">
              {adminTabs.map((tab) => {
                const isActive = pathname === tab.path || 
                  (tab.path === '/supersudo' && pathname === '/supersudo') ||
                  (tab.path !== '/supersudo' && pathname?.startsWith(tab.path));
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
            {/* Delivery Locations */}
            <Card className="mb-6 border-[#dcc090]/30 bg-white/90 p-6 shadow-[0_8px_30px_rgba(18,42,38,0.06)]">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-[#122a26]">{t('admin.delivery.deliveryPricesByLocation')}</h2>
                <Button
                  variant="primary"
                  onClick={handleAddLocation}
                  disabled={saving}
                >
                  {t('admin.delivery.addLocation')}
                </Button>
              </div>
              
              {locations.length === 0 ? (
                <div className="text-center py-8 text-[#414141]/60">
                  <p>{t('admin.delivery.noLocations')}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {locations.map((location, index) => (
                    <div key={index} className="border border-[#dcc090]/30 bg-white/70 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-[#414141]/75 mb-1">
                            {t('admin.delivery.country')}
                          </label>
                          <input
                            type="text"
                            value={location.country}
                            onChange={(e) => handleUpdateLocation(index, 'country', e.target.value)}
                            className="w-full px-3 py-2 border border-[#dcc090]/35 rounded-md focus:outline-none focus:ring-2 focus:ring-[#dcc090] focus:border-[#dcc090]"
                            placeholder={t('admin.delivery.countryPlaceholder')}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[#414141]/75 mb-1">
                            {t('admin.delivery.city')}
                          </label>
                          <input
                            type="text"
                            value={location.city}
                            onChange={(e) => handleUpdateLocation(index, 'city', e.target.value)}
                            className="w-full px-3 py-2 border border-[#dcc090]/35 rounded-md focus:outline-none focus:ring-2 focus:ring-[#dcc090] focus:border-[#dcc090]"
                            placeholder={t('admin.delivery.cityPlaceholder')}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[#414141]/75 mb-1">
                            {t('admin.delivery.price')}
                          </label>
                          <input
                            type="number"
                            value={location.price}
                            onChange={(e) => handleUpdateLocation(index, 'price', parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-[#dcc090]/35 rounded-md focus:outline-none focus:ring-2 focus:ring-[#dcc090] focus:border-[#dcc090]"
                            placeholder={t('admin.delivery.pricePlaceholder')}
                            min="0"
                            step="100"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[#414141]/75 mb-1">
                            {t('admin.delivery.freeDeliveryFromAmd')}
                          </label>
                          <input
                            type="number"
                            value={location.freeDeliveryFromAmd ?? 0}
                            onChange={(e) =>
                              handleUpdateLocation(
                                index,
                                'freeDeliveryFromAmd',
                                Math.max(0, parseFloat(e.target.value) || 0),
                              )
                            }
                            className="w-full px-3 py-2 border border-[#dcc090]/35 rounded-md focus:outline-none focus:ring-2 focus:ring-[#dcc090] focus:border-[#dcc090]"
                            placeholder={t('admin.delivery.freeDeliveryFromAmdPlaceholder')}
                            min="0"
                            step="1000"
                          />
                          <p className="mt-1 text-xs text-[#414141]/60">{t('admin.delivery.freeDeliveryFromAmdHint')}</p>
                        </div>
                      </div>
                      <div className="mt-3 flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleDeleteLocation(index)}
                          className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md"
                          disabled={saving}
                          aria-label={t('admin.delivery.deleteLocation')}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Actions */}
            <div className="flex gap-4">
              <Button
                variant="primary"
                onClick={handleSave}
                disabled={saving || locations.length === 0}
              >
                {saving ? t('admin.delivery.saving') : t('admin.delivery.saveSettings')}
              </Button>
              <Button
                variant="ghost"
                onClick={() => router.push('/supersudo')}
                disabled={saving}
              >
                {t('admin.delivery.cancel')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


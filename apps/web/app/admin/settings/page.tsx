'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/auth/AuthContext';
import { Card, Button } from '@shop/ui';
import { apiClient } from '../../../lib/api-client';
import { useTranslation } from '../../../lib/i18n-client';
import { clearCurrencyRatesCache } from '../../../lib/currency';

interface Settings {
  defaultCurrency?: string;
  globalDiscount?: number;
  categoryDiscounts?: Record<string, number>;
  brandDiscounts?: Record<string, number>;
  currencyRates?: Record<string, number>;
}

// AMD-based UI rates: how much of each currency equals 1 AMD
interface AmdBasedRates {
  USD: number; // 1 AMD = X USD
  EUR: number; // 1 AMD = X EUR
  RUB: number; // 1 AMD = X RUB
  GEL: number; // 1 AMD = X GEL
}

function toAmdBasedRates(usdBasedRates: Record<string, number>): AmdBasedRates {
  const amdRate = usdBasedRates.AMD ?? 400;
  return {
    USD: parseFloat((1 / amdRate).toFixed(6)),
    EUR: parseFloat(((usdBasedRates.EUR ?? 0.92) / amdRate).toFixed(6)),
    RUB: parseFloat(((usdBasedRates.RUB ?? 90) / amdRate).toFixed(6)),
    GEL: parseFloat(((usdBasedRates.GEL ?? 2.7) / amdRate).toFixed(6)),
  };
}

function fromAmdBasedRates(amd: AmdBasedRates): Record<string, number> {
  const amdRate = amd.USD > 0 ? parseFloat((1 / amd.USD).toFixed(2)) : 400;
  return {
    USD: 1,
    AMD: amdRate,
    EUR: parseFloat((amd.EUR * amdRate).toFixed(4)),
    RUB: parseFloat((amd.RUB * amdRate).toFixed(2)),
    GEL: parseFloat((amd.GEL * amdRate).toFixed(4)),
  };
}

export default function SettingsPage() {
  const { t } = useTranslation();
  const { isLoggedIn, isAdmin, isLoading } = useAuth();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<Settings>({
    defaultCurrency: 'AMD',
    currencyRates: {
      USD: 1,
      AMD: 400,
      EUR: 0.92,
      RUB: 90,
      GEL: 2.7,
    },
  });
  const [amdRates, setAmdRates] = useState<AmdBasedRates>({
    USD: 0.0025,
    EUR: 0.0023,
    RUB: 0.225,
    GEL: 0.00675,
  });

  useEffect(() => {
    if (!isLoading) {
      if (!isLoggedIn || !isAdmin) {
        router.push('/admin');
        return;
      }
    }
  }, [isLoggedIn, isAdmin, isLoading, router]);

  useEffect(() => {
    if (isLoggedIn && isAdmin) {
      fetchSettings();
    }
  }, [isLoggedIn, isAdmin]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      console.log('⚙️ [ADMIN] Fetching settings...');
      const data = await apiClient.get<Settings>('/api/v1/admin/settings');
      const usdRates = data.currencyRates || { USD: 1, AMD: 400, EUR: 0.92, RUB: 90, GEL: 2.7 };
      setSettings({
        defaultCurrency: data.defaultCurrency || 'AMD',
        globalDiscount: data.globalDiscount,
        categoryDiscounts: data.categoryDiscounts,
        brandDiscounts: data.brandDiscounts,
        currencyRates: usdRates,
      });
      setAmdRates(toAmdBasedRates(usdRates));
      console.log('✅ [ADMIN] Settings loaded:', data);
    } catch (err: any) {
      console.error('❌ [ADMIN] Error fetching settings:', err);
      const defaultRates = { USD: 1, AMD: 400, EUR: 0.92, RUB: 90, GEL: 2.7 };
      setSettings({ defaultCurrency: 'AMD', currencyRates: defaultRates });
      setAmdRates(toAmdBasedRates(defaultRates));
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      console.log('⚙️ [ADMIN] Saving settings...', settings);

      // Convert AMD-based UI rates back to USD-based rates for storage
      const currencyRatesToSave = fromAmdBasedRates(amdRates);

      await apiClient.put('/api/v1/admin/settings', {
        defaultCurrency: settings.defaultCurrency,
        currencyRates: currencyRatesToSave,
      });
      
      // Clear currency rates cache to force reload
      console.log('🔄 [ADMIN] Clearing currency rates cache...');
      clearCurrencyRatesCache();
      
      // Wait a bit to ensure cache is cleared, then dispatch event again
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          console.log('🔄 [ADMIN] Dispatching currency-rates-updated event...');
          window.dispatchEvent(new Event('currency-rates-updated'));
        }
      }, 100);
      
      alert(t('admin.settings.savedSuccess'));
      console.log('✅ [ADMIN] Settings saved, currency rates:', currencyRatesToSave);
    } catch (err: any) {
      console.error('❌ [ADMIN] Error saving settings:', err);
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to save settings';
      alert(t('admin.settings.errorSaving').replace('{message}', errorMessage));
    } finally {
      setSaving(false);
    }
  };

  if (isLoading || loading) {
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
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <button
            onClick={() => router.push('/admin')}
            className="text-gray-600 hover:text-gray-900 mb-4 flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t('admin.settings.backToAdmin')}
          </button>
          <h1 className="text-3xl font-bold text-gray-900">{t('admin.settings.title')}</h1>
        </div>

        {/* General Settings */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('admin.settings.generalSettings')}</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('admin.settings.siteName')}
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                defaultValue={t('admin.settings.siteNamePlaceholder')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('admin.settings.siteDescription')}
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                defaultValue={t('admin.settings.siteDescriptionPlaceholder')}
              />
            </div>
          </div>
        </Card>

        {/* Payment Settings */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('admin.settings.paymentSettings')}</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('admin.settings.defaultCurrency')}
              </label>
              <select 
                value={settings.defaultCurrency || 'AMD'}
                onChange={(e) => setSettings({ ...settings, defaultCurrency: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="AMD">{t('admin.settings.amd')}</option>
                <option value="USD">{t('admin.settings.usd')}</option>
                <option value="EUR">{t('admin.settings.eur')}</option>
              </select>
            </div>
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  defaultChecked
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">{t('admin.settings.enableOnlinePayments')}</span>
              </label>
            </div>
          </div>
        </Card>

        {/* Currency Exchange Rates */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">{t('admin.settings.currencyRates')}</h2>
          <p className="text-sm text-gray-600 mb-4">
            Մուտքագրեք, թե 1 AMD-ն ինչ արժե մյուս արժույթներով:
          </p>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  AMD (Armenian Dram)
                </label>
                <input
                  type="number"
                  value={1}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed"
                  disabled
                />
                <p className="text-xs text-gray-500 mt-1">Հիմնական արժույթ (Base Currency)</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  1 AMD = ? USD
                </label>
                <input
                  type="number"
                  step="0.000001"
                  min="0.000001"
                  value={amdRates.USD}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    if (!isNaN(v) && v > 0) setAmdRates({ ...amdRates, USD: v });
                  }}
                  onBlur={(e) => {
                    if (!e.target.value || parseFloat(e.target.value) <= 0) {
                      setAmdRates({ ...amdRates, USD: 0.0025 });
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.0025"
                />
                <p className="text-xs text-gray-500 mt-1">
                  1 USD = {amdRates.USD > 0 ? (1 / amdRates.USD).toFixed(0) : '—'} AMD
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  1 AMD = ? EUR
                </label>
                <input
                  type="number"
                  step="0.000001"
                  min="0.000001"
                  value={amdRates.EUR}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    if (!isNaN(v) && v > 0) setAmdRates({ ...amdRates, EUR: v });
                  }}
                  onBlur={(e) => {
                    if (!e.target.value || parseFloat(e.target.value) <= 0) {
                      setAmdRates({ ...amdRates, EUR: 0.0023 });
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.0023"
                />
                <p className="text-xs text-gray-500 mt-1">
                  1 EUR = {amdRates.EUR > 0 ? (1 / amdRates.EUR).toFixed(0) : '—'} AMD
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  1 AMD = ? RUB
                </label>
                <input
                  type="number"
                  step="0.0001"
                  min="0.0001"
                  value={amdRates.RUB}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    if (!isNaN(v) && v > 0) setAmdRates({ ...amdRates, RUB: v });
                  }}
                  onBlur={(e) => {
                    if (!e.target.value || parseFloat(e.target.value) <= 0) {
                      setAmdRates({ ...amdRates, RUB: 0.225 });
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.225"
                />
                <p className="text-xs text-gray-500 mt-1">
                  1 RUB = {amdRates.RUB > 0 ? (1 / amdRates.RUB).toFixed(1) : '—'} AMD
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  1 AMD = ? GEL
                </label>
                <input
                  type="number"
                  step="0.000001"
                  min="0.000001"
                  value={amdRates.GEL}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    if (!isNaN(v) && v > 0) setAmdRates({ ...amdRates, GEL: v });
                  }}
                  onBlur={(e) => {
                    if (!e.target.value || parseFloat(e.target.value) <= 0) {
                      setAmdRates({ ...amdRates, GEL: 0.00675 });
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00675"
                />
                <p className="text-xs text-gray-500 mt-1">
                  1 GEL = {amdRates.GEL > 0 ? (1 / amdRates.GEL).toFixed(0) : '—'} AMD
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex gap-4">
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? t('admin.settings.saving') : t('admin.settings.saveSettings')}
          </Button>
          <Button
            variant="ghost"
            onClick={() => router.push('/admin')}
            disabled={saving}
          >
            {t('admin.settings.cancel')}
          </Button>
        </div>
      </div>
    </div>
  );
}


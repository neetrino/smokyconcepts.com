'use client';

import { useTranslation } from '../../../../lib/i18n-client';

interface CategoryPriceAmdFieldProps {
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}

export function CategoryPriceAmdField({
  value,
  disabled = false,
  onChange,
}: CategoryPriceAmdFieldProps) {
  const { t } = useTranslation();

  return (
    <div>
      <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.08em] text-[#414141]/70">
        {t('admin.categories.categoryPriceAmd')}
      </label>
      <input
        type="number"
        min={0}
        step={1}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full rounded-lg border border-[#dcc090]/35 bg-white px-3 py-2.5 text-sm text-[#122a26] outline-none transition-all focus:border-[#dcc090] focus:ring-2 focus:ring-[#dcc090]/30 disabled:opacity-50"
      />
    </div>
  );
}

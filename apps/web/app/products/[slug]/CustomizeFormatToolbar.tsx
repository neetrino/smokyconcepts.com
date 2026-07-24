'use client';

import { t } from '../../../lib/i18n';
import type { LanguageCode } from '../../../lib/language';
import { CUSTOMIZE_GOOGLE_FONT_OPTIONS } from './constants/customize-google-fonts';
import type { CustomizeFormatState } from './utils/build-customize-preview-html';

export type CustomizeFormatToolbarProps = {
  language: LanguageCode;
  format: CustomizeFormatState;
  onFormatChange: (next: CustomizeFormatState) => void;
};

export function CustomizeFormatToolbar({
  language,
  format,
  onFormatChange,
}: CustomizeFormatToolbarProps) {
  const toggle = (key: keyof Pick<CustomizeFormatState, 'bold' | 'italic' | 'underline'>) => {
    onFormatChange({ ...format, [key]: !format[key] });
  };

  return (
    <div className="w-full max-w-[640px]">
      <div className="flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          aria-pressed={format.bold}
          className={`rounded border border-[#dcc090] px-2 py-1 font-montserrat text-[13px] font-semibold text-[#414141] ${
            format.bold ? 'bg-[#dcc090]/25' : ''
          }`}
          onClick={() => {
            toggle('bold');
          }}
        >
          {t(language, 'product.customize_format_bold')}
        </button>
        <button
          type="button"
          aria-pressed={format.italic}
          className={`rounded border border-[#dcc090] px-2 py-1 font-montserrat text-[13px] italic text-[#414141] ${
            format.italic ? 'bg-[#dcc090]/25' : ''
          }`}
          onClick={() => {
            toggle('italic');
          }}
        >
          {t(language, 'product.customize_format_italic')}
        </button>
        <button
          type="button"
          aria-pressed={format.underline}
          className={`rounded border border-[#dcc090] px-2 py-1 font-montserrat text-[13px] underline decoration-[#414141] text-[#414141] ${
            format.underline ? 'bg-[#dcc090]/25' : ''
          }`}
          onClick={() => {
            toggle('underline');
          }}
        >
          {t(language, 'product.customize_format_underline')}
        </button>
        <label className="flex flex-wrap items-center gap-1 font-montserrat text-[13px] text-[#414141]">
          <span>{t(language, 'product.customize_font_label')}</span>
          <select
            className="max-w-[200px] rounded border border-[#dcc090] bg-white px-2 py-1 font-montserrat text-[13px] text-[#414141]"
            value={format.fontStack}
            onChange={(e) => {
              onFormatChange({ ...format, fontStack: e.target.value });
            }}
          >
            {CUSTOMIZE_GOOGLE_FONT_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.stack}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}

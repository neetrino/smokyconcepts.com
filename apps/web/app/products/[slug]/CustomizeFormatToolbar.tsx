'use client';

import { t } from '../../../lib/i18n';
import type { LanguageCode } from '../../../lib/language';
import { CustomizeFontDropdown } from './CustomizeFontDropdown';
import {
  CUSTOMIZE_FORMAT_ASSETS,
  CUSTOMIZE_FORMAT_BUTTON_CLASS,
  CUSTOMIZE_FORMAT_CONTROL_ACTIVE_CLASS,
  CUSTOMIZE_FORMAT_CONTROL_ACTIVE_ICON_CLASS,
  CUSTOMIZE_FORMAT_CONTROL_IDLE_CLASS,
  CUSTOMIZE_FORMAT_TOOLBAR_CLASS,
} from './customize-format.constants';
import type { CustomizeFormatState } from './utils/build-customize-preview-html';

export type CustomizeFormatToolbarProps = {
  language: LanguageCode;
  format: CustomizeFormatState;
  onFormatChange: (next: CustomizeFormatState) => void;
};

type FormatToggleKey = keyof Pick<CustomizeFormatState, 'bold' | 'italic'>;

const FORMAT_TOGGLE_META: ReadonlyArray<{
  key: FormatToggleKey;
  labelKey: 'product.customize_format_bold' | 'product.customize_format_italic';
  iconSrc: string;
}> = [
  { key: 'bold', labelKey: 'product.customize_format_bold', iconSrc: CUSTOMIZE_FORMAT_ASSETS.boldSrc },
  { key: 'italic', labelKey: 'product.customize_format_italic', iconSrc: CUSTOMIZE_FORMAT_ASSETS.italicSrc },
];

export function CustomizeFormatToolbar({
  language,
  format,
  onFormatChange,
}: CustomizeFormatToolbarProps) {
  const toggle = (key: FormatToggleKey) => {
    onFormatChange({ ...format, [key]: !format[key] });
  };

  return (
    <div className={CUSTOMIZE_FORMAT_TOOLBAR_CLASS}>
      <CustomizeFontDropdown
        value={format.fontStack}
        fontLabel={t(language, 'product.customize_font_label')}
        clearLabel={t(language, 'product.customize_font_clear')}
        ariaLabel={t(language, 'product.customize_font_label')}
        onChange={(fontStack) => {
          onFormatChange({ ...format, fontStack });
        }}
      />
      <div className="flex shrink-0 flex-nowrap items-center gap-1.5 sm:gap-2">
        {FORMAT_TOGGLE_META.map(({ key, labelKey, iconSrc }) => {
          const isActive = format[key];
          return (
            <button
              key={key}
              type="button"
              aria-pressed={isActive}
              aria-label={t(language, labelKey)}
              className={`${CUSTOMIZE_FORMAT_BUTTON_CLASS} ${
                isActive
                  ? CUSTOMIZE_FORMAT_CONTROL_ACTIVE_CLASS
                  : CUSTOMIZE_FORMAT_CONTROL_IDLE_CLASS
              }`}
              onClick={() => {
                toggle(key);
              }}
            >
              <img
                src={iconSrc}
                alt=""
                width={18}
                height={18}
                className={`block ${isActive ? CUSTOMIZE_FORMAT_CONTROL_ACTIVE_ICON_CLASS : ''}`}
                decoding="async"
                draggable={false}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}

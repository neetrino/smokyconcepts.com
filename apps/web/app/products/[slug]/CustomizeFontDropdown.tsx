'use client';

import { useEffect, useId, useRef, useState } from 'react';

import {
  CUSTOMIZE_FONT_CONTROL_WIDTH_CLASS,
  CUSTOMIZE_FONT_DROPDOWN_OPTION_CLASS,
  CUSTOMIZE_FONT_DROPDOWN_PANEL_CLASS,
  CUSTOMIZE_FORMAT_ASSETS,
  CUSTOMIZE_FORMAT_FONT_TRIGGER_CLASS,
} from './customize-format.constants';
import {
  CUSTOMIZE_FONT_OPTIONS,
  type CustomizeFontOption,
} from './constants/customize-google-fonts';

const FONT_DROPDOWN_DIVIDER_CLASS = 'mx-0 h-px border-0 bg-[#e8e8e8]';

function findFontOptionByStack(stack: string): CustomizeFontOption {
  const normalized = stack.trim().replace(/\s+/g, ' ').toLowerCase();
  return (
    CUSTOMIZE_FONT_OPTIONS.find(
      (option) => option.stack.replace(/\s+/g, ' ').toLowerCase() === normalized
    ) ?? CUSTOMIZE_FONT_OPTIONS[0]
  );
}

export type CustomizeFontDropdownProps = {
  value: string;
  onChange: (fontStack: string) => void;
  ariaLabel: string;
};

export function CustomizeFontDropdown({ value, onChange, ariaLabel }: CustomizeFontDropdownProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();
  const selected = findFontOptionByStack(value);

  useEffect(() => {
    if (!open) {
      return;
    }
    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  const handleSelect = (option: CustomizeFontOption) => {
    onChange(option.stack);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className={`relative shrink-0 ${CUSTOMIZE_FONT_CONTROL_WIDTH_CLASS}`}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        onClick={() => {
          setOpen((previous) => !previous);
        }}
        className={CUSTOMIZE_FORMAT_FONT_TRIGGER_CLASS}
      >
        <span className="font-montserrat text-[16px] font-medium leading-[26px] text-[#414141]">Font</span>
        <img
          src={CUSTOMIZE_FORMAT_ASSETS.chevronSrc}
          alt=""
          width={9}
          height={16}
          className={`block shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
          decoding="async"
          draggable={false}
          aria-hidden
        />
      </button>
      {open ? (
        <ul
          id={listboxId}
          role="listbox"
          aria-label={ariaLabel}
          className={CUSTOMIZE_FONT_DROPDOWN_PANEL_CLASS}
        >
          {CUSTOMIZE_FONT_OPTIONS.map((option, index) => (
            <li key={option.id} role="presentation">
              <button
                type="button"
                role="option"
                aria-selected={option.id === selected.id}
                onClick={() => {
                  handleSelect(option);
                }}
                className={`${CUSTOMIZE_FONT_DROPDOWN_OPTION_CLASS} ${
                  option.id === selected.id ? 'bg-[#faf8f4]' : 'bg-white hover:bg-[#faf8f4]/60'
                }`}
                style={{ fontFamily: option.stack }}
              >
                {option.label}
              </button>
              {index < CUSTOMIZE_FONT_OPTIONS.length - 1 ? (
                <hr className={FONT_DROPDOWN_DIVIDER_CLASS} />
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

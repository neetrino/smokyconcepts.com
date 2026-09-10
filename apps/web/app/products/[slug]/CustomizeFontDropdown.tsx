'use client';

import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import {
  CUSTOMIZE_FONT_CONTROL_WIDTH_CLASS,
  CUSTOMIZE_FONT_DROPDOWN_OPTION_CLASS,
  CUSTOMIZE_FONT_DROPDOWN_PANEL_CLASS,
  CUSTOMIZE_FORMAT_ASSETS,
  CUSTOMIZE_FORMAT_CONTROL_ACTIVE_CLASS,
  CUSTOMIZE_FORMAT_CONTROL_IDLE_CLASS,
  CUSTOMIZE_FORMAT_CONTROL_INVALID_CLASS,
  CUSTOMIZE_FORMAT_FONT_TRIGGER_CLASS,
} from './customize-format.constants';
import {
  CUSTOMIZE_FONT_OPTIONS,
  type CustomizeFontOption,
} from './constants/customize-google-fonts';
import { CUSTOMIZE_INPUT_FONT_STACK } from './utils/build-customize-preview-html';

const FONT_DROPDOWN_DIVIDER_CLASS = 'mx-0 h-px border-0 bg-[#e8e8e8]';

/** Gap between trigger bottom and fixed panel (matches former `mt-0.5`). */
const FONT_DROPDOWN_PANEL_GAP_PX = 2;

type FontDropdownPanelPosition = {
  top: number;
  left: number;
  width: number;
};

function findFontOptionByStack(stack: string): CustomizeFontOption {
  const normalized = stack.trim().replace(/\s+/g, ' ').toLowerCase();
  return (
    CUSTOMIZE_FONT_OPTIONS.find(
      (option) => option.stack.replace(/\s+/g, ' ').toLowerCase() === normalized
    ) ?? CUSTOMIZE_FONT_OPTIONS[0]
  );
}

export type CustomizeFontDropdownProps = {
  value: string | null;
  onChange: (fontStack: string | null) => void;
  fontLabel: string;
  clearLabel: string;
  ariaLabel: string;
  /** Marks the control as mandatory (asterisk on the label). */
  isRequired?: boolean;
  /** Renders the invalid outline after a failed add-to-cart attempt. */
  isInvalid?: boolean;
  isShaking?: boolean;
  onShakeAnimationEnd?: () => void;
};

export function CustomizeFontDropdown({
  value,
  onChange,
  fontLabel,
  clearLabel,
  ariaLabel,
  isRequired = false,
  isInvalid = false,
  isShaking = false,
  onShakeAnimationEnd,
}: CustomizeFontDropdownProps) {
  const [open, setOpen] = useState(false);
  const [panelPosition, setPanelPosition] = useState<FontDropdownPanelPosition | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLUListElement>(null);
  const listboxId = useId();
  const selected = value ? findFontOptionByStack(value) : null;

  useLayoutEffect(() => {
    if (!open) {
      setPanelPosition(null);
      return;
    }

    const updatePosition = () => {
      const rect = rootRef.current?.getBoundingClientRect();
      if (!rect) {
        return;
      }

      setPanelPosition({
        top: rect.bottom + FONT_DROPDOWN_PANEL_GAP_PX,
        left: rect.left,
        width: rect.width,
      });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (rootRef.current?.contains(target) || panelRef.current?.contains(target)) {
        return;
      }
      setOpen(false);
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

  const handleClear = () => {
    onChange(null);
    setOpen(false);
  };

  const toggleOpen = () => {
    setOpen((previous) => !previous);
  };

  const panel =
    open && panelPosition && typeof document !== 'undefined'
      ? createPortal(
          <ul
            ref={panelRef}
            id={listboxId}
            role="listbox"
            aria-label={ariaLabel}
            className={CUSTOMIZE_FONT_DROPDOWN_PANEL_CLASS}
            style={{
              top: panelPosition.top,
              left: panelPosition.left,
              width: panelPosition.width,
            }}
          >
            {CUSTOMIZE_FONT_OPTIONS.map((option, index) => (
              <li key={option.id} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={option.id === selected?.id}
                  onClick={() => {
                    handleSelect(option);
                  }}
                  className={`${CUSTOMIZE_FONT_DROPDOWN_OPTION_CLASS} ${
                    option.id === selected?.id ? 'bg-[#faf8f4]' : 'bg-white hover:bg-[#faf8f4]/60'
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
          </ul>,
          document.body
        )
      : null;

  return (
    <div
      ref={rootRef}
      className={`relative shrink-0 ${CUSTOMIZE_FONT_CONTROL_WIDTH_CLASS} ${
        isShaking ? 'animate-size-shake' : ''
      }`}
      onAnimationEnd={onShakeAnimationEnd}
    >
      <div
        className={`${CUSTOMIZE_FORMAT_FONT_TRIGGER_CLASS} ${
          open ? CUSTOMIZE_FORMAT_CONTROL_ACTIVE_CLASS : CUSTOMIZE_FORMAT_CONTROL_IDLE_CLASS
        } ${isInvalid ? CUSTOMIZE_FORMAT_CONTROL_INVALID_CLASS : ''}`}
      >
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-required={isRequired}
          aria-invalid={isInvalid}
          onClick={toggleOpen}
          className="flex min-w-0 flex-1 items-center"
        >
          <span
            className="min-w-0 flex-1 truncate text-left text-[16px] font-medium leading-[26px] text-[#414141]"
            style={{ fontFamily: selected?.stack ?? CUSTOMIZE_INPUT_FONT_STACK }}
          >
            {selected?.label ?? fontLabel}
          </span>
          {isRequired && !selected ? (
            <span className="ml-1 shrink-0 text-red-600" aria-hidden>
              *
            </span>
          ) : null}
        </button>
        {selected ? (
          <button
            type="button"
            aria-label={clearLabel}
            className="ml-1 flex h-5 w-5 shrink-0 items-center justify-center rounded text-[#898989] hover:bg-[#122a26]/8 hover:text-[#414141]"
            onClick={handleClear}
          >
            <span aria-hidden className="text-[14px] leading-none">
              ×
            </span>
          </button>
        ) : null}
        <button
          type="button"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-label={ariaLabel}
          className="ml-1 flex shrink-0 items-center"
          onClick={toggleOpen}
        >
          <img
            src={CUSTOMIZE_FORMAT_ASSETS.chevronSrc}
            alt=""
            width={9}
            height={16}
            className={`block transition-transform ${open ? 'rotate-90' : ''}`}
            decoding="async"
            draggable={false}
            aria-hidden
          />
        </button>
      </div>
      {panel}
    </div>
  );
}

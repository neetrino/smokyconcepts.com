'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { useAuth } from '../lib/auth/AuthContext';
import {
  HEADER_ACTION_HIT_CLASS,
  HEADER_ACTION_ICON_CLASS,
  HEADER_ASSET_PATHS,
} from './header/header.constants';

const menuClass =
  'block w-full px-3 py-2.5 text-left text-xs font-extrabold uppercase tracking-[0.12em] text-[#dcc090] transition-opacity hover:bg-white/5 hover:opacity-100';

function HeaderAccountIcon() {
  return (
    <img src={HEADER_ASSET_PATHS.account} alt="" className={HEADER_ACTION_ICON_CLASS} aria-hidden />
  );
}

/**
 * Header bar account: Figma login icon; menu when logged in.
 */
export function HeaderDesktopAccount() {
  const pathname = usePathname();
  const { isLoggedIn, isAdmin, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const el = wrapRef.current;
      if (el && !el.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const iconButtonClass = HEADER_ACTION_HIT_CLASS;

  if (!isLoggedIn) {
    return (
      <Link href="/login" className={iconButtonClass} aria-label="Sign in">
        <HeaderAccountIcon />
      </Link>
    );
  }

  return (
    <div className="relative" ref={wrapRef}>
      <button
        type="button"
        className={iconButtonClass}
        aria-label="Account menu"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((v) => !v)}
      >
        <HeaderAccountIcon />
      </button>
      {open ? (
        <div
          role="menu"
          aria-orientation="vertical"
          className="absolute right-0 top-full z-[100] mt-2 min-w-[13.5rem] rounded-md border border-[#dcc090]/35 bg-[#122a26] py-1 shadow-lg"
        >
          <Link href="/profile" role="menuitem" className={menuClass} onClick={() => setOpen(false)}>
            Profile
          </Link>
          {isAdmin ? (
            <Link href="/supersudo" role="menuitem" className={menuClass} onClick={() => setOpen(false)}>
              Admin
            </Link>
          ) : null}
          <button
            type="button"
            role="menuitem"
            className={`${menuClass} border-t border-white/10 font-extrabold`}
            onClick={() => {
              setOpen(false);
              logout();
            }}
          >
            Log out
          </button>
        </div>
      ) : null}
    </div>
  );
}

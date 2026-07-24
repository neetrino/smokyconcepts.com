'use client';

import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export interface ProfileMenuItem {
  id: string;
  label: string;
  icon: ReactNode;
}

interface ProfileMenuDrawerProps {
  tabs: ProfileMenuItem[];
  activeTab: string;
  onSelect: (_tabId: string) => void;
}

/**
 * Mobile drawer for navigating profile dashboard tabs.
 */
export function ProfileMenuDrawer({ tabs, activeTab, onSelect }: ProfileMenuDrawerProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const handleSelect = (tabId: string) => {
    onSelect(tabId);
    setOpen(false);
  };

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => {
          setOpen(true);
        }}
        className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold uppercase tracking-wide text-[#122a26] shadow-[0_4px_14px_rgba(18,42,38,0.08)]"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6H20M4 12H16M4 18H12" />
        </svg>
        Menu
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex bg-black/40 backdrop-blur-sm"
          onClick={() => {
            setOpen(false);
          }}
        >
          <div
            className="flex h-full min-h-screen w-1/2 min-w-[16rem] max-w-full flex-col bg-white shadow-2xl"
            role="dialog"
            aria-modal="true"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className="inline-flex items-center"
                aria-label="Go to home page"
              >
                <img
                  src="/assets/home/Logo%20Full.webp"
                  alt="Home"
                  className="h-10 w-10 object-contain"
                />
              </Link>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                }}
                className="h-10 w-10 rounded-full border border-gray-200 text-[#414141]/70 hover:border-[#dcc090]/50 hover:text-[#122a26]"
                aria-label="Close profile menu"
              >
                <svg className="mx-auto h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 divide-y divide-gray-100 overflow-y-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleSelect(tab.id)}
                  className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium ${
                    activeTab === tab.id
                      ? 'bg-[#dcc090] text-[#122a26]'
                      : 'text-[#414141] hover:bg-[#dcc090]/10'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span className={activeTab === tab.id ? 'text-[#122a26]' : 'text-[#414141]/55'}>
                      {tab.icon}
                    </span>
                    {tab.label}
                  </span>
                  <svg
                    className={`h-4 w-4 ${activeTab === tab.id ? 'text-[#122a26]' : 'text-[#414141]/45'}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}




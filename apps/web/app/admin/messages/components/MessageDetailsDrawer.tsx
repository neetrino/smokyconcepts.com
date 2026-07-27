'use client';

import { useEffect, useState } from 'react';
import { formatAdminDateTime } from '../../utils/formatAdminDate';

interface ContactMessageDetails {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  source: 'CONTACT' | 'PERSONALIZE';
  createdAt: string;
}

interface MessageDetailsDrawerProps {
  message: ContactMessageDetails | null;
  labels: {
    title: string;
    sender: string;
    email: string;
    phone: string;
    source: string;
    sourceContact: string;
    sourcePersonalize: string;
    message: string;
    date: string;
    close: string;
  };
  onClose: () => void;
}

const DRAWER_ENTER_FRAME_MS = 16 as const;

export function MessageDetailsDrawer({ message, labels, onClose }: MessageDetailsDrawerProps) {
  const [isEntered, setIsEntered] = useState(false);

  useEffect(() => {
    if (!message) {
      setIsEntered(false);
      return undefined;
    }
    const frameId = window.setTimeout(() => setIsEntered(true), DRAWER_ENTER_FRAME_MS);
    return () => window.clearTimeout(frameId);
  }, [message]);

  useEffect(() => {
    if (!message) {
      return undefined;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [message, onClose]);

  useEffect(() => {
    if (!message) {
      return undefined;
    }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [message]);

  if (!message) {
    return null;
  }

  const sourceLabel =
    message.source === 'PERSONALIZE' ? labels.sourcePersonalize : labels.sourceContact;

  return (
    <div className="fixed inset-0 z-50" role="presentation">
      <button
        type="button"
        aria-label={labels.close}
        className={`absolute inset-0 z-0 bg-black/50 transition-opacity duration-200 ${
          isEntered ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />

      <aside
        className={`absolute inset-y-0 right-0 z-10 flex h-full max-h-dvh w-1/2 min-w-[18rem] transform flex-col overflow-hidden bg-white shadow-[-8px_0_32px_rgba(18,42,38,0.16)] transition-transform duration-200 ease-out ${
          isEntered ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="message-details-drawer-title"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-[#dcc090]/30 px-6 py-5">
          <h2 id="message-details-drawer-title" className="text-xl font-bold text-[#122a26]">
            {labels.title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-[#414141]/50 transition-colors hover:text-[#122a26]"
            aria-label={labels.close}
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#414141]/60">
              {labels.sender}
            </p>
            <p className="mt-1 text-sm font-semibold text-[#122a26]">{message.name}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#414141]/60">
              {labels.email}
            </p>
            <p className="mt-1 text-sm text-[#122a26]">{message.email}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#414141]/60">
              {labels.phone}
            </p>
            <p className="mt-1 text-sm text-[#122a26]">{message.subject}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#414141]/60">
              {labels.source}
            </p>
            <p className="mt-1">
              <span
                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${
                  message.source === 'PERSONALIZE'
                    ? 'bg-[#dcc090]/25 text-[#122a26]'
                    : 'bg-[#122a26]/10 text-[#122a26]'
                }`}
              >
                {sourceLabel}
              </span>
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#414141]/60">
              {labels.date}
            </p>
            <p className="mt-1 text-sm text-[#414141]/80">
              {formatAdminDateTime(message.createdAt)}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#414141]/60">
              {labels.message}
            </p>
            <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed text-[#122a26]">
              {message.message}
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}

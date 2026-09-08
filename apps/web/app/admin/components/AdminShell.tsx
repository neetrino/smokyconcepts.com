'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';

import { useTranslation } from '../../../lib/i18n-client';
import { AdminSidebar } from './AdminSidebar';

interface AdminShellProps {
  children: ReactNode;
}

export function AdminShell({ children }: AdminShellProps) {
  const { t } = useTranslation();
  const pathname = usePathname();

  return (
    <div className="flex flex-col gap-8 lg:flex-row">
      <AdminSidebar currentPath={pathname || '/supersudo'} t={t} />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

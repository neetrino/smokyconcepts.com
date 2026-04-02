import type { ReactNode } from 'react';
import { AdminThemeProvider } from '@/app/admin/context/AdminThemeContext';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminThemeProvider>{children}</AdminThemeProvider>;
}

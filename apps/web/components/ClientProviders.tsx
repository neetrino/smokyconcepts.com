'use client';

import { useEffect, type ReactNode } from 'react';
import { AuthProvider } from '../lib/auth/AuthContext';
import { enableClientCurrencyStorageReads, initializeCurrencyRates } from '../lib/currency';
import { ToastContainer } from './Toast';
import { CartDrawer } from './CartDrawer';

/**
 * ClientProviders component
 * Wraps the app with all client-side providers (Auth, Theme, etc.)
 */
export function ClientProviders({ children }: { children: ReactNode }) {
  useEffect(() => {
    enableClientCurrencyStorageReads();
    void initializeCurrencyRates();
  }, []);

  return (
    <AuthProvider>
      {children}
      <CartDrawer />
      <ToastContainer />
    </AuthProvider>
  );
}

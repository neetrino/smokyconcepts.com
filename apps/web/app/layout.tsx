import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { Inter, Montserrat } from 'next/font/google';
import './globals.css';
import { ClientProviders } from '../components/ClientProviders';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
const inter = Inter({ subsets: ['latin'] });

/** Geometric sans for homepage ritual steps (matches process / steps UI). */
const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  display: 'swap',
  weight: ['400', '600', '700', '800', '900'],
});

export const metadata: Metadata = {
  title: 'Shop - Professional E-commerce',
  description: 'Modern e-commerce platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${inter.className} ${montserrat.variable} bg-gray-50 text-gray-900 antialiased min-h-full`}
      >
        <Suspense fallback={null}>
          <ClientProviders>
            <div className="flex min-h-screen flex-col overflow-x-visible overflow-y-visible">
              <Header />
              <main className="flex-1 w-full overflow-x-visible overflow-y-visible">
                {children}
              </main>
              <Footer />
            </div>
          </ClientProviders>
        </Suspense>
      </body>
    </html>
  );
}


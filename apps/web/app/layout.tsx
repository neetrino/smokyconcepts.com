import React, { Suspense } from 'react';
import type { Metadata, Viewport } from 'next';
import { Inter, Montserrat } from 'next/font/google';
import './globals.css';
import { ClientProviders } from '../components/ClientProviders';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import {
  CANONICAL_SITE_URL,
  getMetadataBaseUrl,
} from '../lib/seo/get-metadata-base-url';

const inter = Inter({ subsets: ['latin'] });

/** Geometric sans for homepage ritual steps (matches process / steps UI). */
const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  display: 'swap',
  weight: ['400', '600', '700', '800', '900'],
});

const SITE_NAME = 'Smoky Concepts';
const SITE_DESCRIPTION = 'Smoky Concepts is a premium shop.';
const OG_IMAGE_PATH = '/og-image.png';
const OG_IMAGE_WIDTH = 1200;
const OG_IMAGE_HEIGHT = 1200;
const metadataBase = getMetadataBaseUrl();
const ogImageUrl = new URL(OG_IMAGE_PATH, metadataBase);

export const metadata: Metadata = {
  metadataBase,
  title: SITE_NAME,
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  icons: {
    icon: '/assets/home/Asset%202@4x-8.webp',
    shortcut: '/assets/home/Asset%202@4x-8.webp',
    apple: '/assets/home/Asset%202@4x-8.webp',
  },
  openGraph: {
    type: 'website',
    url: CANONICAL_SITE_URL,
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: ogImageUrl,
        width: OG_IMAGE_WIDTH,
        height: OG_IMAGE_HEIGHT,
        alt: SITE_NAME,
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [ogImageUrl.toString()],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${inter.className} ${montserrat.variable} bg-[#efefef] text-gray-900 antialiased min-h-full`}
      >
        <Suspense fallback={null}>
          <ClientProviders>
            <div className="flex min-h-screen flex-col">
              <Header />
              <main className="flex-1 w-full max-w-full overflow-x-hidden">
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

